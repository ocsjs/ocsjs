import { loadRefTable } from './ref-table';
import { crackFontInWorker } from './worker';
import type { CrackResult, FontDecryptConfig, RefTable } from './types';

/**
 * 位图渲染匹配核心算法
 *
 * 【整体流程】
 *   密文字 -> 用加密字体渲染到 canvas -> 提取二值位图特征
 *   -> 在参考特征表中做两级最近邻搜索 -> 得到"该字形实际画的是哪个字"
 *
 * 【归一化方案（两端必须与特征表生成脚本严格一致）】
 * 字形渲染的坐标系直接决定特征可比性，这里采用"固定坐标系"：
 *   - 480×480 固定画布、字号 360、基线固定 y=384、按 advance 水平居中
 *   - 不使用字体自身度量（ascent/descent）定位——加密字体的 hhea 表
 *     常被生成工具改写，与官方字体不一致，而轮廓相对基线原点的位置
 *     是字体设计的固有属性，两端一致
 *   - 保留绝对位置信息：不裁剪墨迹 bbox，因此 一/—/_、丶/、 等
 *     仅靠位置区分的字符也能正确识别
 *
 * 【特征提取】
 *   盒式平均降采样（每个网格取平均灰度）后按阈值二值化为 0/1：
 *   - 盒式平均在 Python（离线生成端）和浏览器端可做到逐位一致，
 *     避免双线性等滤波算法的跨端差异
 *   - 二值特征对光栅化器的 gamma/抗锯齿差异天然鲁棒
 *     （笔画核心像素在任何光栅化器下都稳定为实心）
 *   - 480 与 16/24 均为整数倍关系，保证盒式平均无插值误差
 *
 * 【两级最近邻匹配】
 *   1. 粗筛：16×16 粗特征与全表（约 7000 字）计算 L2 距离，取最近 40 个候选
 *   2. 精排：24×24 精特征在候选中取最优
 *   置信度 margin = 1 - 最优距离/次优距离，越接近 1 越可靠
 *
 * 【可变字体字重陷阱（重要）】
 * 考试平台加密字体是 SourceHanSansSC-VF（wght 250-900），浏览器默认
 * 按 font-weight:400 实例化可变字体，而特征表按 wght250 生成，笔画粗细
 * 不一致会严重干扰匹配。canvas 不支持 font-variation-settings，
 * 解决办法是 FontFace 描述符声明 { weight: '250' } 锁定实例化字重。
 */

/** 渲染参数：与离线特征表生成脚本严格一致，修改需同步重新生成特征表 */
const RENDER = 360;
const SQ = 480;
const BASELINE = 384;
/** 粗筛候选数量 */
const SHORTLIST = 40;
/** 墨迹判定阈值（判断字形是否空白） */
const INK_THRESHOLD = 40;

/** 渲染画布单例（模块级复用，避免每字创建 canvas 的开销） */
let renderCanvas: { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | undefined;

function getRenderCanvas() {
	if (!renderCanvas) {
		const cv = document.createElement('canvas');
		cv.width = SQ;
		cv.height = SQ;
		renderCanvas = { cv, ctx: cv.getContext('2d', { willReadFrequently: true })! };
	}
	return renderCanvas;
}

/**
 * 渲染单字并提取特征。
 * 返回 { coarse, fine }（二值 0/1 数组）；空白字形（无墨迹）返回 null。
 */
function renderGlyph(
	fontFamily: string,
	ch: string,
	table: RefTable
): { coarse: Uint8Array; fine: Uint8Array } | null {
	const { ctx } = getRenderCanvas();
	ctx.clearRect(0, 0, SQ, SQ);
	ctx.fillStyle = '#fff';
	ctx.font = `${RENDER}px "${fontFamily}"`;
	ctx.textBaseline = 'alphabetic';
	const advance = ctx.measureText(ch).width;
	// 基线原点固定、按 advance 居中，保证同一设计的字形两端落位一致
	ctx.fillText(ch, (SQ - advance) / 2, BASELINE);
	const px = ctx.getImageData(0, 0, SQ, SQ).data;

	// 空白字形检测（空格等）：无任何墨迹则不参与匹配，按原样保留
	let hasInk = false;
	for (let i = 3; i < px.length; i += 4) {
		if (px[i] > INK_THRESHOLD) {
			hasInk = true;
			break;
		}
	}
	if (!hasInk) {
		return null;
	}

	// 积分图（summed-area table）：一次构建后每个网格 O(1) 求和，
	// 与逐像素盒式平均结果完全一致（SQ 与 16/24 均为整数倍关系，无插值）
	const W = SQ + 1;
	const ii = new Uint32Array(W * W);
	for (let y = 0; y < SQ; y++) {
		let rowSum = 0;
		const srcRow = y * SQ * 4;
		const dstRow = (y + 1) * W;
		const upRow = y * W;
		for (let x = 0; x < SQ; x++) {
			rowSum += px[srcRow + x * 4 + 3];
			ii[dstRow + x + 1] = ii[upRow + x + 1] + rowSum;
		}
	}

	// 盒式平均降采样（SQ 与目标网格为整数倍关系）+ 阈值二值化
	const box = (n: number) => {
		const b = SQ / n;
		const area = b * b;
		const out = new Uint8Array(n * n);
		for (let gy = 0; gy < n; gy++) {
			for (let gx = 0; gx < n; gx++) {
				const y0 = gy * b;
				const x0 = gx * b;
				const sum =
					ii[(y0 + b) * W + x0 + b] - ii[y0 * W + x0 + b] - ii[(y0 + b) * W + x0] + ii[y0 * W + x0];
				out[gy * n + gx] = sum / area > table.threshold ? 1 : 0;
			}
		}
		return out;
	};

	return { coarse: box(table.gc), fine: box(table.gf) };
}

/** 覆盖检测画布缓存（按 字体族+回退族 复用，避免反复创建 canvas） */
const coverageCanvasCache: Record<string, HTMLCanvasElement> = {};

/**
 * 双回退对比法检测字体是否覆盖某字符。
 *
 * 原理：
 *   - 字符在字体中："family", serif 与 "family", sans-serif 都使用
 *     该字体自身的字形渲染，两者像素完全相同
 *   - 字符不在字体中：分别走 serif / sans-serif 系统回退字体渲染，
 *     两种设计不同，像素必然有显著差异
 *
 * 用小号画布（200×200 @ 120px）快速判定，与主破解流程的大画布渲染互不影响。
 */
function isCoveredByFont(fontFamily: string, ch: string): boolean {
	const render = (fallback: string) => {
		const key = fontFamily + '|' + fallback;
		const cv =
			coverageCanvasCache[key] ??
			(coverageCanvasCache[key] = (() => {
				const c = document.createElement('canvas');
				c.width = 200;
				c.height = 200;
				return c;
			})());
		const ctx = cv.getContext('2d', { willReadFrequently: true })!;
		ctx.clearRect(0, 0, 200, 200);
		ctx.fillStyle = '#fff';
		ctx.font = `120px "${fontFamily}", ${fallback}`;
		ctx.textBaseline = 'middle';
		ctx.fillText(ch, 10, 100);
		return ctx.getImageData(0, 0, 200, 200).data;
	};
	const a = render('serif');
	const b = render('sans-serif');
	let diff = 0;
	for (let i = 3; i < a.length; i += 4) {
		diff += Math.abs(a[i] - b[i]);
	}
	// 实测：覆盖字符 diff = 0，未覆盖字符 diff > 100000，阈值取 1000 足够安全
	return diff < 1000;
}

/** 两个二值特征向量的 L2 距离（等价于不同位的个数） */
function bitDistance(tableArr: Uint8Array, idx: number, dims: number, q: Uint8Array) {
	let s = 0;
	const base = idx * dims;
	for (let i = 0; i < dims; i++) {
		if (tableArr[base + i] !== q[i]) {
			s++;
		}
	}
	return s;
}

/** 单字符的两级最近邻匹配 */
export function crackChar(table: RefTable, feat: { coarse: Uint8Array; fine: Uint8Array }) {
	const { count, cps, coarse, fine, gc, gf } = table;
	// 第一级：粗特征全表扫描
	const dists = new Float64Array(count);
	for (let i = 0; i < count; i++) {
		dists[i] = bitDistance(coarse, i, gc * gc, feat.coarse);
	}
	// 取第 SHORTLIST 小的距离作为阈值（原生排序远快于比较器索引排序），
	// 再单遍收集所有不超过阈值的候选（并列也收集，数量会略多于 SHORTLIST，不影响正确性）
	const sorted = Float64Array.from(dists);
	sorted.sort();
	const threshold = sorted[Math.min(SHORTLIST, count) - 1];
	const idx: number[] = [];
	for (let i = 0; i < count; i++) {
		if (dists[i] <= threshold) {
			idx.push(i);
		}
	}
	// 第二级：精特征在候选中取最优/次优
	let bestI = -1;
	let best = Infinity;
	let second = Infinity;
	for (let k = 0; k < idx.length; k++) {
		const i = idx[k];
		const d = bitDistance(fine, i, gf * gf, feat.fine);
		if (d < best) {
			second = best;
			best = d;
			bestI = i;
		} else if (d < second) {
			second = d;
		}
	}
	return {
		ch: String.fromCodePoint(cps[bestI]),
		best,
		second,
		margin: second > 0 ? 1 - best / second : 1
	};
}

/**
 * 破解加密字体，返回 密文字 -> 真实字 映射。
 *
 * @param fontSource 字体来源：URL 或 ArrayBuffer（FontFace 原生支持 ttf/otf/woff/woff2）
 * @param chars      需要破解的字符集合（通常取加密区域的全部文本去重即可，
 *                   无需破解整个字表；未提供的字符在解密时按原样保留）
 * @param config     平台解密配置（特征表地址、字重锁定等）
 */
export async function crackFont(
	fontSource: string | ArrayBuffer,
	chars: string | string[],
	config: FontDecryptConfig
): Promise<CrackResult> {
	const table = await loadRefTable(config.refTableUrl);
	const uniq = [...new Set(chars)].filter((c) => c.trim() !== '');

	// 优先在 Web Worker 中破解（OffscreenCanvas 渲染，不阻塞主线程）；
	// 环境不支持或 Worker 失败时自动回退下方的主线程路径
	if (config.useWorker !== false) {
		const r = await crackFontInWorker(fontSource, uniq, config, table);
		if (r) {
			return r;
		}
	}

	const family = 'font-decrypt-' + Math.random().toString(36).slice(2);
	const source = typeof fontSource === 'string' ? `url("${fontSource}")` : fontSource;
	// 可变字体必须通过 weight 描述符锁定实例化字重（见文件头注释）
	const face = new FontFace(family, source, config.fontWeight ? { weight: config.fontWeight } : {});
	// 字体 URL 无响应时 load() 可能永不 settle，必须加超时防止无限等待
	await Promise.race([
		face.load(),
		new Promise<never>((_, reject) => setTimeout(() => reject(new Error('[font-decrypt] 字体加载超时')), 15_000))
	]);
	// 项目 tsconfig 的 DOM lib 版本较旧，缺少 FontFaceSet.add 的类型定义，这里做最小断言
	(document.fonts as unknown as { add(font: FontFace): void }).add(face);

	const map: Record<string, string> = {};
	const details: CrackResult['details'] = [];
	for (let i = 0; i < uniq.length; i++) {
		const ch = uniq[i];
		// 【字体覆盖检测】加密字体只包含少量字形（如超星子集仅 60 个），
		// 页面明文区域的字符不在字体 cmap 内，浏览器会用系统回退字体渲染
		// （显示的就是真实字符），这类字符不是密文，必须跳过——
		// 否则回退渲染的图像参与匹配会产生垃圾映射。
		// 注意：document.fonts.check() 在 Chrome 中不检测字形覆盖（只检查
		// 字体是否加载完成），因此这里使用"双回退对比法"（见 isCoveredByFont）。
		if (!isCoveredByFont(family, ch)) {
			map[ch] = ch;
			continue;
		}
		const feat = renderGlyph(family, ch, table);
		if (!feat) {
			map[ch] = ch;
			continue;
		}
		const r = crackChar(table, feat);
		map[ch] = r.ch;
		details.push({ from: ch, to: r.ch, margin: +r.margin.toFixed(3) });
		config.onProgress?.(i + 1, uniq.length);
		// 让出主线程，避免长时间阻塞页面交互
		if (i % 10 === 9) {
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
	}
	return { map, details };
}

/** 用映射表解密一段文本（未破解过的字符按原样保留） */
export function decryptText(text: string, map: Record<string, string>): string {
	return [...text].map((c) => map[c] ?? c).join('');
}

/**
 * 用映射表原地解密元素内所有文本节点。
 * 只改文本节点内容，不触碰 HTML 结构，避免 innerHTML 替换破坏事件绑定。
 */
export function decryptElements(roots: Element | Element[], map: Record<string, string>) {
	for (const root of Array.isArray(roots) ? roots : [roots]) {
		const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
		const nodes: Text[] = [];
		while (walker.nextNode()) {
			nodes.push(walker.currentNode as Text);
		}
		for (const node of nodes) {
			node.nodeValue = decryptText(node.nodeValue ?? '', map);
		}
	}
}

/**
 * 收集元素内出现的去重字符集（作为 crackFont 的 chars 入参，
 * 只破解页面实际出现的字符，比全字表破解快几个数量级）。
 */
export function collectChars(roots: Element | Element[]): string {
	let text = '';
	for (const root of Array.isArray(roots) ? roots : [roots]) {
		text += root.textContent ?? '';
	}
	return text;
}

/** 在页面中查找字体文件 URL（@font-face 规则 + 资源加载记录） */
export function findFontUrls(doc: Document = document): string[] {
	const urls = new Set<string>();
	for (const sheet of Array.from(doc.styleSheets)) {
		try {
			for (const rule of Array.from(sheet.cssRules)) {
				if (rule instanceof CSSFontFaceRule) {
					const m = /url\(["']?([^"')]+)["']?\)/.exec(rule.style.getPropertyValue('src'));
					if (m) {
						urls.add(new URL(m[1], location.href).href);
					}
				}
			}
		} catch {
			// 跨域样式表无法读取，忽略
		}
	}
	// 注意必须用目标 document 所属 window 的 performance：
	// iframe 内加载的字体资源只记录在 iframe 自己的 performance 里
	const perf = doc.defaultView?.performance ?? performance;
	for (const entry of perf.getEntriesByType('resource')) {
		if (/\.(ttf|otf|woff2?)(\?|$)/i.test(entry.name)) {
			urls.add(entry.name);
		}
	}
	return [...urls];
}

/** 从 @font-face 的 data URI 中提取 base64 字体数据并解码为 ArrayBuffer */
export function extractFontFromStyle(doc: Document, fontFamilyMarker: string): ArrayBuffer | undefined {
	const styleEl = Array.from(doc.head.querySelectorAll('style')).find((s) =>
		s.textContent?.includes(fontFamilyMarker)
	);
	const base64 = styleEl?.textContent?.match(/base64,([\w\W]+?)['")]/)?.[1];
	if (!base64) {
		return undefined;
	}
	const raw = window.atob(base64);
	const buffer = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) {
		buffer[i] = raw.charCodeAt(i);
	}
	return buffer.buffer;
}

/** 页面 @font-face 声明（族名 + 字体源） */
export interface FontFaceInfo {
	/** font-family 名称 */
	family: string;
	/** 字体源：网络 URL 或 data URI（可直接作为 crackFont 的 fontSource） */
	src: string;
}

/**
 * 列出页面中所有 @font-face 声明（族名 + src）。
 * 用于"一页多字体"场景：不同元素可能使用不同置换表生成的字体，
 * 需要按 font-family 分组后分别破解。
 */
export function listFontFaces(doc: Document = document): FontFaceInfo[] {
	const faces: FontFaceInfo[] = [];
	for (const sheet of Array.from(doc.styleSheets)) {
		try {
			for (const rule of Array.from(sheet.cssRules)) {
				if (rule instanceof CSSFontFaceRule) {
					const family = rule.style.getPropertyValue('font-family').replace(/["']/g, '').trim();
					const m = /url\(["']?([^"')]+)["']?\)/.exec(rule.style.getPropertyValue('src'));
					if (family && m) {
						// data URI 原样保留；相对 URL 以【目标 document 的地址】为基准转为绝对 URL
						//（iframe 内的相对路径不能用顶层 location 解析）
						const base = doc.location?.href ?? location.href;
						faces.push({ family, src: m[1].startsWith('data:') ? m[1] : new URL(m[1], base).href });
					}
				}
			}
		} catch {
			// 跨域样式表无法读取，忽略
		}
	}
	return faces;
}
