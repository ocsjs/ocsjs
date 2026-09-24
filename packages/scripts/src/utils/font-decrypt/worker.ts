import type { CrackResult, FontDecryptConfig, RefTable } from './types';

/**
 * Web Worker 破解通道
 *
 * 主线程破解在字符较多时会阻塞页面交互（渲染 + 最近邻匹配均为同步计算）。
 * 本模块把完整破解流程放进 Blob 内联 Worker 中执行：
 *   - Worker 内使用 OffscreenCanvas 渲染字形（与 DOM 无关）
 *   - FontFace / self.fonts（WorkerFontFaceSet）在 Worker 中加载加密字体
 *   - 匹配算法与 bitmap.ts 完全一致（下方 WORKER_SOURCE 为独立副本，
 *     修改 bitmap.ts 的算法时必须同步修改此处）
 *
 * 以下任一条件不满足时返回 null，调用方自动回退主线程路径：
 *   - 环境不支持 Worker / OffscreenCanvas
 *   - 页面 CSP 拦截 worker-src（new Worker 抛错或加载失败）
 *   - Worker 内部出错或整体超时
 */

/** Worker 整体超时（超时后回退主线程，保证功能可用） */
const WORKER_TIMEOUT = 30_000;

/**
 * Worker 源码（纯 JS 字符串，避免打包器对独立 worker 文件的处理问题；
 * 注意：内部不能使用模板字符串占位符，常量与 bitmap.ts 保持同步）
 */
const WORKER_SOURCE = `
'use strict';
var RENDER = 360, SQ = 480, BASELINE = 384, SHORTLIST = 40, INK_THRESHOLD = 40;

var renderCv = null;
function getRenderCtx() {
	if (!renderCv) {
		renderCv = new OffscreenCanvas(SQ, SQ);
		renderCv.ctx = renderCv.getContext('2d', { willReadFrequently: true });
	}
	return renderCv.ctx;
}

var covCv = {};
function isCoveredByFont(fontFamily, ch) {
	var render = function (fallback) {
		var cv = covCv[fallback];
		if (!cv) {
			cv = new OffscreenCanvas(200, 200);
			cv.ctx = cv.getContext('2d', { willReadFrequently: true });
			covCv[fallback] = cv;
		}
		var ctx = cv.ctx;
		ctx.clearRect(0, 0, 200, 200);
		ctx.fillStyle = '#fff';
		ctx.font = '120px "' + fontFamily + '", ' + fallback;
		ctx.textBaseline = 'middle';
		ctx.fillText(ch, 10, 100);
		return ctx.getImageData(0, 0, 200, 200).data;
	};
	var a = render('serif');
	var b = render('sans-serif');
	var diff = 0;
	for (var i = 3; i < a.length; i += 4) {
		diff += Math.abs(a[i] - b[i]);
	}
	return diff < 1000;
}

function renderGlyph(fontFamily, ch, table) {
	var ctx = getRenderCtx();
	ctx.clearRect(0, 0, SQ, SQ);
	ctx.fillStyle = '#fff';
	ctx.font = RENDER + 'px "' + fontFamily + '"';
	ctx.textBaseline = 'alphabetic';
	var advance = ctx.measureText(ch).width;
	ctx.fillText(ch, (SQ - advance) / 2, BASELINE);
	var px = ctx.getImageData(0, 0, SQ, SQ).data;

	var hasInk = false;
	for (var i = 3; i < px.length; i += 4) {
		if (px[i] > INK_THRESHOLD) { hasInk = true; break; }
	}
	if (!hasInk) {
		return null;
	}

	var W = SQ + 1;
	var ii = new Uint32Array(W * W);
	for (var y = 0; y < SQ; y++) {
		var rowSum = 0;
		var srcRow = y * SQ * 4;
		var dstRow = (y + 1) * W;
		var upRow = y * W;
		for (var x = 0; x < SQ; x++) {
			rowSum += px[srcRow + x * 4 + 3];
			ii[dstRow + x + 1] = ii[upRow + x + 1] + rowSum;
		}
	}

	var box = function (n) {
		var b = SQ / n;
		var area = b * b;
		var out = new Uint8Array(n * n);
		for (var gy = 0; gy < n; gy++) {
			for (var gx = 0; gx < n; gx++) {
				var y0 = gy * b;
				var x0 = gx * b;
				var sum = ii[(y0 + b) * W + x0 + b] - ii[y0 * W + x0 + b] - ii[(y0 + b) * W + x0] + ii[y0 * W + x0];
				out[gy * n + gx] = sum / area > table.threshold ? 1 : 0;
			}
		}
		return out;
	};

	return { coarse: box(table.gc), fine: box(table.gf) };
}

function bitDistance(tableArr, idx, dims, q) {
	var s = 0;
	var base = idx * dims;
	for (var i = 0; i < dims; i++) {
		if (tableArr[base + i] !== q[i]) { s++; }
	}
	return s;
}

function crackChar(table, feat) {
	var count = table.count;
	var dists = new Float64Array(count);
	for (var i = 0; i < count; i++) {
		dists[i] = bitDistance(table.coarse, i, table.gc * table.gc, feat.coarse);
	}
	var sorted = Float64Array.from(dists);
	sorted.sort();
	var threshold = sorted[Math.min(SHORTLIST, count) - 1];
	var idx = [];
	for (var j = 0; j < count; j++) {
		if (dists[j] <= threshold) { idx.push(j); }
	}
	var bestI = -1, best = Infinity, second = Infinity;
	for (var k = 0; k < idx.length; k++) {
		var d = bitDistance(table.fine, idx[k], table.gf * table.gf, feat.fine);
		if (d < best) { second = best; best = d; bestI = idx[k]; }
		else if (d < second) { second = d; }
	}
	return {
		ch: String.fromCodePoint(table.cps[bestI]),
		margin: second > 0 ? 1 - best / second : 1
	};
}

self.onmessage = function (e) {
	var msg = e.data;
	(async function () {
		if (typeof FontFace === 'undefined' || typeof OffscreenCanvas === 'undefined' || !self.fonts) {
			throw new Error('worker env unsupported');
		}
		var family = 'font-decrypt-w-' + Math.random().toString(36).slice(2);
		var source = typeof msg.fontSource === 'string' ? 'url("' + msg.fontSource + '")' : msg.fontSource;
		var face = new FontFace(family, source, msg.fontWeight ? { weight: msg.fontWeight } : {});
		await face.load();
		self.fonts.add(face);
		var table = {
			count: msg.count, cps: msg.cps, coarse: msg.coarse, fine: msg.fine,
			gc: msg.gc, gf: msg.gf, threshold: msg.threshold
		};
		var map = {};
		var details = [];
		var uniq = msg.chars;
		for (var i = 0; i < uniq.length; i++) {
			var ch = uniq[i];
			if (!isCoveredByFont(family, ch)) { map[ch] = ch; continue; }
			var feat = renderGlyph(family, ch, table);
			if (!feat) { map[ch] = ch; continue; }
			var r = crackChar(table, feat);
			map[ch] = r.ch;
			details.push({ from: ch, to: r.ch, margin: +r.margin.toFixed(3) });
			self.postMessage({ type: 'progress', done: i + 1, total: uniq.length });
		}
		self.postMessage({ type: 'result', map: map, details: details });
	})().catch(function (err) {
		self.postMessage({ type: 'error', message: String((err && err.message) || err) });
	});
};
`;

/**
 * 尝试在 Worker 中破解字体。
 * 返回 null 表示 Worker 通道不可用（调用方应回退主线程路径）。
 *
 * 注意：特征表通过 postMessage 结构化克隆传入（约 7MB，一次性开销），
 * 不能使用 transfer——特征表有全局缓存，transfer 会置空缓存数组。
 */
export function crackFontInWorker(
	fontSource: string | ArrayBuffer,
	chars: string[],
	config: FontDecryptConfig,
	table: RefTable
): Promise<CrackResult | null> {
	return new Promise((resolve) => {
		if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
			return resolve(null);
		}
		let worker: Worker;
		try {
			const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'application/javascript' }));
			worker = new Worker(url);
			URL.revokeObjectURL(url);
		} catch {
			return resolve(null);
		}
		let settled = false;
		const timer = setTimeout(() => done(null), WORKER_TIMEOUT);
		const done = (r: CrackResult | null) => {
			if (!settled) {
				settled = true;
				clearTimeout(timer);
				worker.terminate();
				resolve(r);
			}
		};
		worker.onerror = () => done(null);
		worker.onmessage = (e: MessageEvent) => {
			const msg = e.data;
			if (msg.type === 'progress') {
				config.onProgress?.(msg.done, msg.total);
			} else if (msg.type === 'result') {
				done({ map: msg.map, details: msg.details });
			} else if (msg.type === 'error') {
				done(null);
			}
		};
		worker.postMessage({
			fontSource,
			chars,
			fontWeight: config.fontWeight,
			count: table.count,
			cps: table.cps,
			coarse: table.coarse,
			fine: table.fine,
			gc: table.gc,
			gf: table.gf,
			threshold: table.threshold
		});
	});
}
