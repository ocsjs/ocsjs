/**
 * 纯 JS PNG 放大器（零依赖）。
 *
 * 用于图片题优化：当图片任意边 < 题库/模型最小尺寸（如豆包 14px）时，
 * 将图片最近邻放大到 ≥ 该尺寸，避免模型 400 拒绝。
 *
 * 环境分发：
 *   - Node（测试）：手写 PNG 解码（zlib inflate + 反过滤）→ 重采样 → 编码（filter 0 + zlib deflate）。
 *   - 浏览器（生产）：canvas 缩放。
 *
 * 仅处理 8 位、颜色类型 0/2/4/6（灰度/RGB/灰度Alpha/RGBA）的 PNG；
 * 其他（调色板、低位深）不放大，原样返回。
 */

/** 是否运行在 Node 环境（非浏览器 / 非油猴脚本） */
function isNodeEnv(): boolean {
	return (
		typeof process !== 'undefined' &&
		!!(process as any).versions?.node &&
		(globalThis as any).GM_xmlhttpRequest === undefined
	);
}

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

interface PngInfo {
	width: number;
	height: number;
	bitDepth: number;
	colorType: number;
	channels: number;
}

// ========== 基础工具 ==========

function dataUrlToBytes(dataUrl: string): Uint8Array | undefined {
	const m = dataUrl.match(/^data:[^;,]+.*?;base64,(.+)$/);
	if (!m) return undefined;
	if (typeof Buffer !== 'undefined') {
		return new Uint8Array(Buffer.from(m[1], 'base64'));
	}
	const bin = atob(m[1]);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes;
}

function bytesToDataUrl(bytes: Uint8Array): string {
	let b64: string;
	if (typeof Buffer !== 'undefined') {
		b64 = Buffer.from(bytes).toString('base64');
	} else {
		let bin = '';
		const chunk = 0x8000;
		for (let i = 0; i < bytes.length; i += chunk) {
			bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
		}
		b64 = btoa(bin);
	}
	return `data:image/png;base64,${b64}`;
}

function readUint32BE(bytes: Uint8Array, off: number): number {
	return (
		(bytes[off] * 0x1000000) +
		((bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3])
	) >>> 0;
}

function concatUint8(arrs: Uint8Array[]): Uint8Array {
	let len = 0;
	for (const a of arrs) len += a.length;
	const out = new Uint8Array(len);
	let o = 0;
	for (const a of arrs) {
		out.set(a, o);
		o += a.length;
	}
	return out;
}

// CRC32（PNG 标准，poly 0xEDB88320）
const CRC_TABLE: number[] = (() => {
	const table = new Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(bytes: Uint8Array): number {
	let crc = 0xffffffff;
	for (let i = 0; i < bytes.length; i++) {
		crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

// ========== zlib（仅 Node，计算变量名规避打包器静态分析）==========

function getZlib(): any {
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const r = typeof require !== 'undefined' ? (require as any) : null;
		if (!r) return null;
		const name = 'zl' + 'ib';
		return r(name);
	} catch {
		return null;
	}
}

function zlibInflate(data: Uint8Array): Uint8Array {
	const zlib = getZlib();
	if (!zlib) throw new Error('zlib 不可用');
	const buf = zlib.inflateSync(Buffer.from(data));
	return new Uint8Array(buf);
}

function zlibDeflate(data: Uint8Array): Uint8Array {
	const zlib = getZlib();
	if (!zlib) throw new Error('zlib 不可用');
	const buf = zlib.deflateSync(Buffer.from(data));
	return new Uint8Array(buf);
}

// ========== 解析 / 解码 ==========

/** 获取 PNG 尺寸（仅 8 位、颜色类型 0/2/4/6；否则 undefined） */
export function getImageSize(dataUrl: string): PngInfo | undefined {
	const bytes = dataUrlToBytes(dataUrl);
	if (!bytes || bytes.length < 26) return undefined;
	for (let i = 0; i < 8; i++) if (bytes[i] !== PNG_SIG[i]) return undefined;
	const width = readUint32BE(bytes, 16);
	const height = readUint32BE(bytes, 20);
	const bitDepth = bytes[24];
	const colorType = bytes[25];
	const channels =
		colorType === 2 ? 3 : colorType === 6 ? 4 : colorType === 4 ? 2 : colorType === 0 ? 1 : 0;
	if (channels === 0) return undefined;
	if (bitDepth !== 8) return undefined;
	return { width, height, bitDepth, colorType, channels };
}

function paeth(a: number, b: number, c: number): number {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	if (pb <= pc) return b;
	return c;
}

/** 反过滤单行（0:None 1:Sub 2:Up 3:Average 4:Paeth），原地修改 cur */
function unfilterRow(filter: number, cur: Uint8Array, prev: Uint8Array, bpp: number) {
	const n = cur.length;
	switch (filter) {
		case 0:
			return;
		case 1:
			for (let x = bpp; x < n; x++) cur[x] = (cur[x] + cur[x - bpp]) & 0xff;
			return;
		case 2:
			for (let x = 0; x < n; x++) cur[x] = (cur[x] + prev[x]) & 0xff;
			return;
		case 3:
			for (let x = 0; x < n; x++) {
				const a = x >= bpp ? cur[x - bpp] : 0;
				const b = prev[x];
				cur[x] = (cur[x] + Math.floor((a + b) / 2)) & 0xff;
			}
			return;
		case 4:
			for (let x = 0; x < n; x++) {
				const a = x >= bpp ? cur[x - bpp] : 0;
				const b = prev[x];
				const c = x >= bpp ? prev[x - bpp] : 0;
				cur[x] = (cur[x] + paeth(a, b, c)) & 0xff;
			}
			return;
	}
}

/** 解码 PNG 为原始像素 Uint8Array（按行、按 channels 顺序，无 filter 字节） */
function decodePng(bytes: Uint8Array, info: PngInfo): Uint8Array | undefined {
	const idatChunks: Uint8Array[] = [];
	let off = 8;
	while (off + 8 <= bytes.length) {
		const len = readUint32BE(bytes, off);
		const type = String.fromCharCode(
			bytes[off + 4],
			bytes[off + 5],
			bytes[off + 6],
			bytes[off + 7]
		);
		if (type === 'IDAT') {
			idatChunks.push(bytes.subarray(off + 8, off + 8 + len));
		} else if (type === 'IEND') break;
		off += 12 + len;
	}
	if (idatChunks.length === 0) return undefined;
	const idat = concatUint8(idatChunks);
	let inflated: Uint8Array;
	try {
		inflated = zlibInflate(idat);
	} catch {
		return undefined;
	}
	const { width, height, channels } = info;
	const bpp = channels;
	const stride = width * bpp;
	const out = new Uint8Array(height * stride);
	let prev = new Uint8Array(stride);
	let src = 0;
	for (let y = 0; y < height; y++) {
		if (src + 1 + stride > inflated.length) break;
		const filter = inflated[src++];
		const cur = out.subarray(y * stride, (y + 1) * stride);
		for (let x = 0; x < stride; x++) cur[x] = inflated[src + x];
		src += stride;
		unfilterRow(filter, cur, prev, bpp);
		prev = cur;
	}
	return out;
}

// ========== 重采样 / 编码 ==========

/** 最近邻 N 倍放大 */
function resampleNearest(
	pixels: Uint8Array,
	width: number,
	height: number,
	channels: number,
	scale: number
): { pixels: Uint8Array; width: number; height: number } {
	const newW = width * scale;
	const newH = height * scale;
	const out = new Uint8Array(newH * newW * channels);
	const inStride = width * channels;
	const outStride = newW * channels;
	for (let y = 0; y < newH; y++) {
		const sy = Math.floor(y / scale);
		for (let x = 0; x < newW; x++) {
			const sx = Math.floor(x / scale);
			const inOff = sy * inStride + sx * channels;
			const outOff = y * outStride + x * channels;
			for (let c = 0; c < channels; c++) out[outOff + c] = pixels[inOff + c];
		}
	}
	return { pixels: out, width: newW, height: newH };
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
	const chunk = new Uint8Array(4 + 4 + data.length + 4);
	const dv = new DataView(chunk.buffer);
	dv.setUint32(0, data.length);
	for (let i = 0; i < 4; i++) chunk[4 + i] = type.charCodeAt(i);
	chunk.set(data, 8);
	const crc = crc32(chunk.subarray(4, 8 + data.length));
	dv.setUint32(8 + data.length, crc);
	return chunk;
}

/** 编码 PNG（8 位、filter 0） */
function encodePng(
	width: number,
	height: number,
	channels: number,
	pixels: Uint8Array
): Uint8Array | undefined {
	const bpp = channels;
	const stride = width * bpp;
	const raw = new Uint8Array(height * (1 + stride));
	let o = 0;
	for (let y = 0; y < height; y++) {
		raw[o++] = 0; // filter None
		for (let x = 0; x < stride; x++) raw[o++] = pixels[y * stride + x];
	}
	let compressed: Uint8Array;
	try {
		compressed = zlibDeflate(raw);
	} catch {
		return undefined;
	}
	const sig = new Uint8Array(PNG_SIG);
	const ihdr = new Uint8Array(13);
	const dv = new DataView(ihdr.buffer);
	dv.setUint32(0, width);
	dv.setUint32(4, height);
	ihdr[8] = 8; // bitDepth
	ihdr[9] = channels === 4 ? 6 : channels === 3 ? 2 : channels === 2 ? 4 : 0; // colorType
	ihdr[10] = 0; // compression
	ihdr[11] = 0; // filter
	ihdr[12] = 0; // interlace
	return concatUint8([
		sig,
		makeChunk('IHDR', ihdr),
		makeChunk('IDAT', compressed),
		makeChunk('IEND', new Uint8Array(0))
	]);
}

// ========== 放大（环境分发）==========

/** Node 路径：手写 PNG 编解码放大 */
function upscalePngViaCodec(dataUrl: string, minDim: number): string {
	const bytes = dataUrlToBytes(dataUrl);
	const info = getImageSize(dataUrl);
	if (!bytes || !info) return dataUrl;
	if (info.width >= minDim && info.height >= minDim) return dataUrl;
	const decoded = decodePng(bytes, info);
	if (!decoded) return dataUrl;
	const scale = Math.ceil(minDim / Math.min(info.width, info.height));
	const { pixels, width, height } = resampleNearest(
		decoded,
		info.width,
		info.height,
		info.channels,
		scale
	);
	const encoded = encodePng(width, height, info.channels, pixels);
	if (!encoded) return dataUrl;
	return bytesToDataUrl(encoded);
}

/** 浏览器路径：canvas 缩放 */
async function upscalePngViaCanvas(dataUrl: string, minDim: number): Promise<string> {
	const img = new Image();
	await new Promise<void>((res, rej) => {
		img.onload = () => res();
		img.onerror = () => rej(new Error('图片加载失败'));
		img.src = dataUrl;
	});
	const w = img.naturalWidth || img.width;
	const h = img.naturalHeight || img.height;
	if (w >= minDim && h >= minDim) return dataUrl;
	const scale = Math.ceil(minDim / Math.min(w, h));
	const canvas = document.createElement('canvas');
	canvas.width = w * scale;
	canvas.height = h * scale;
	const ctx = canvas.getContext('2d');
	if (!ctx) return dataUrl;
	ctx.drawImage(img, 0, 0, w * scale, h * scale);
	return canvas.toDataURL('image/png');
}

/**
 * 放大过小图片使其任意边 ≥ minDim。
 * - Node：PNG 编解码路径。
 * - 浏览器：canvas 路径。
 * 已达标的图片原样返回；无法处理（非支持格式 / 失败）也原样返回。
 */
export async function upscalePngDataUrl(dataUrl: string, minDim: number): Promise<string> {
	if (isNodeEnv()) return upscalePngViaCodec(dataUrl, minDim);
	return upscalePngViaCanvas(dataUrl, minDim);
}
