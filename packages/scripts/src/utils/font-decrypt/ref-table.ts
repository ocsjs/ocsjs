import type { RefTable } from './types';

/**
 * 参考特征表加载器（FRB2 格式）
 *
 * FRB2 二进制格式（小端序）：
 * ┌────────────────────────────────────────────────────────┐
 * │ magic      "FRB2"        4B   格式标识                  │
 * │ count      uint32        4B   候选字数量                │
 * │ threshold  uint32        4B   查询端二值化阈值           │
 * │ gc         uint32        4B   粗特征网格边长（如 16）     │
 * │ gf         uint32        4B   精特征网格边长（如 24）     │
 * │ codepoints uint32×count       候选字码点表               │
 * │ coarse     位打包 count×gc²/8B  粗特征（MSB 优先）        │
 * │ fine       位打包 count×gf²/8B  精特征（MSB 优先）        │
 * └────────────────────────────────────────────────────────┘
 *
 * 表由离线脚本（.codebuddy/font_analysis/）用官方原版字体生成：
 * 把每个候选字渲染成位图 -> 盒式平均降采样 -> 按阈值二值化 -> 位打包。
 * 位打包后每字仅占 (gc²+gf²)/8 字节，单平台全量表约 0.76MB（gzip 后约 0.3MB）。
 *
 * 特征表与平台加密方式无关（只取决于官方字体设计），一次生成永久有效，
 * 不需要像哈希表那样随平台改字体而更新。
 */

/** 按 URL 缓存加载结果（特征表可跨页面/跨字体复用，只加载一次） */
const refTableCache = new Map<string, Promise<RefTable>>();

/** 把位打包数据解包为 0/1 数组（便于直接做 L2 距离计算） */
function unpackBits(packed: Uint8Array, offset: number, count: number, dims: number): Uint8Array {
	const bytesPerGlyph = dims / 8;
	const out = new Uint8Array(count * dims);
	for (let i = 0; i < count; i++) {
		const pBase = offset + i * bytesPerGlyph;
		const oBase = i * dims;
		for (let b = 0; b < bytesPerGlyph; b++) {
			const byte = packed[pBase + b];
			// MSB 优先：第 0 位是字节的最高位
			for (let k = 0; k < 8; k++) {
				out[oBase + b * 8 + k] = (byte >> (7 - k)) & 1;
			}
		}
	}
	return out;
}

/** 加载参考特征表（同一 URL 只加载一次；失败后清除缓存允许下次重试） */
export function loadRefTable(url: string): Promise<RefTable> {
	let cached = refTableCache.get(url);
	if (!cached) {
		// fetch 无响应时可能永不 settle，加超时防止无限等待
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 30_000);
		cached = fetch(url, { signal: controller.signal })
			.then((r) => r.arrayBuffer())
			.then((buf) => {
				const dv = new DataView(buf);
				const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
				if (magic !== 'FRB2') {
					throw new Error('[font-decrypt] 无效的特征表格式: ' + magic);
				}
				const count = dv.getUint32(4, true);
				const threshold = dv.getUint32(8, true);
				const gc = dv.getUint32(12, true);
				const gf = dv.getUint32(16, true);
				const cps = new Uint32Array(count);
				let off = 20;
				for (let i = 0; i < count; i++, off += 4) {
					cps[i] = dv.getUint32(off, true);
				}
				const packed = new Uint8Array(buf);
				const coarse = unpackBits(packed, off, count, gc * gc);
				off += (count * gc * gc) / 8;
				const fine = unpackBits(packed, off, count, gf * gf);
				return { count, cps, coarse, fine, gc, gf, threshold };
				});
				// 无论成功失败都清除超时定时器；失败时清除缓存，
				// 避免缓存住 rejected Promise 导致后续永远失败（网络恢复后也无法重试）
				cached = cached
				.then((table) => {
					clearTimeout(timer);
					return table;
				})
				.catch((err) => {
					clearTimeout(timer);
					refTableCache.delete(url);
					throw err;
				});
				refTableCache.set(url, cached);
				}
				return cached;
				}
