import { $store } from 'easy-us';
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

/**
 * 回源校验间隔：
 * - CDN 响应带 ETag/Last-Modified（可发条件请求）时，每小时校验一次，
 *   未变更返回 304（响应体为空、仅几百字节），实现"不发版即可让全用户缓存失效"：
 *   服务端更新文件后，用户最多 1 小时内自动拿到新版
 * - CDN 不支持验证器时退化为 7 天 TTL，避免每小时全量下载
 */
const REVALIDATE_WITH_VALIDATOR_MS = 60 * 60 * 1000;
const REVALIDATE_NO_VALIDATOR_MS = 7 * 24 * 60 * 60 * 1000;
/** 缓存格式版本：存储结构变化时递增使旧缓存整体失效 */
const REF_TABLE_CACHE_VERSION = 'v1';

interface RefTableCacheRecord {
	/** 上次回源校验时间 */
	updatedAt: number;
	/** 下载时响应的 ETag（用于 If-None-Match 条件请求） */
	etag?: string;
	/** 下载时响应的 Last-Modified（ETag 缺失时的备选验证器） */
	lastModified?: string;
	/** base64 编码的 FRB2 二进制 */
	data: string;
}

const storeKey = (url: string) => `ocs.font-decrypt.ref-table.${REF_TABLE_CACHE_VERSION}:${url}`;

function bufToBase64(buf: ArrayBuffer): string {
	const bytes = new Uint8Array(buf);
	let bin = '';
	const CHUNK = 0x8000;
	for (let i = 0; i < bytes.length; i += CHUNK) {
		bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
	}
	return btoa(bin);
}

function base64ToBuf(b64: string): ArrayBuffer {
	const bin = atob(b64);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) {
		bytes[i] = bin.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * 读取持久化缓存记录（GM 存储，跨域名/跨会话生效）。
 * 不过滤时间（过期记录仍用于条件请求与 stale 兜底）；损坏或非预期格式时清除并返回 undefined
 */
function readPersistedRecord(url: string): RefTableCacheRecord | undefined {
	try {
		const record = $store.get(storeKey(url)) as RefTableCacheRecord | undefined;
		if (!record || typeof record.data !== 'string' || typeof record.updatedAt !== 'number') {
			return undefined;
		}
		return record;
	} catch {
		$store.delete(storeKey(url));
		return undefined;
	}
}

/** 写入持久化缓存；存储失败（容量等）不影响主流程 */
function persist(url: string, buf: ArrayBuffer, etag?: string, lastModified?: string): void {
	try {
		const record: RefTableCacheRecord = { updatedAt: Date.now(), etag, lastModified, data: bufToBase64(buf) };
		$store.set(storeKey(url), record);
	} catch {
		// 忽略
	}
}

/** 304 未变更时仅刷新校验时间，内容不变 */
function touchPersisted(url: string, record: RefTableCacheRecord): void {
	try {
		$store.set(storeKey(url), { ...record, updatedAt: Date.now() });
	} catch {
		// 忽略
	}
}

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

/** 解析 FRB2 二进制为 RefTable（网络与缓存两条加载路径共用） */
function parseRefTable(buf: ArrayBuffer): RefTable {
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
}

/**
 * 实际加载逻辑：
 * 1. 持久化缓存（GM 存储，跨域名/跨会话）新鲜期内直接使用，零网络请求
 * 2. 过期后回源校验：带 If-None-Match / If-Modified-Since 条件请求头，
 *    服务端未变更返回 304（几乎零流量）继续用缓存；已变更返回 200 替换缓存
 * 3. 网络失败时回退本地缓存（stale-if-error），仍无则抛错
 */
async function fetchAndParseRefTable(url: string): Promise<RefTable> {
	const record = readPersistedRecord(url);
	const hasValidator = !!(record?.etag || record?.lastModified);
	const interval = hasValidator ? REVALIDATE_WITH_VALIDATOR_MS : REVALIDATE_NO_VALIDATOR_MS;

	const parseRecord = (r: RefTableCacheRecord): RefTable => parseRefTable(base64ToBuf(r.data));

	// 1. 缓存新鲜：零网络
	if (record && Date.now() - record.updatedAt <= interval) {
		try {
			console.debug('[font-decrypt] 特征表命中本地缓存：', url);
			return parseRecord(record);
		} catch {
			// 缓存内容损坏，清除后走网络
			$store.delete(storeKey(url));
		}
	}

	// 2. 回源校验（fetch 无响应时可能永不 settle，加超时防止无限等待）
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 30_000);
	try {
		const headers: Record<string, string> = {};
		if (record?.etag) {
			headers['If-None-Match'] = record.etag;
		} else if (record?.lastModified) {
			headers['If-Modified-Since'] = record.lastModified;
		}
		const res = await fetch(url, { signal: controller.signal, headers });

		// 304：服务端文件未变更，仅刷新校验时间，继续用本地缓存
		if (res.status === 304 && record) {
			console.debug('[font-decrypt] 特征表服务端未变更（304），沿用本地缓存：', url);
			touchPersisted(url, record);
			return parseRecord(record);
		}
		if (!res.ok) {
			throw new Error('[font-decrypt] 特征表下载失败: HTTP ' + res.status);
		}
		const buf = await res.arrayBuffer();
		const table = parseRefTable(buf);
		persist(url, buf, res.headers.get('etag') ?? undefined, res.headers.get('last-modified') ?? undefined);
		console.debug('[font-decrypt] 特征表已从网络加载并缓存：', url);
		return table;
	} catch (err) {
		// 3. stale-if-error：网络失败但存在本地缓存时，先用旧数据保证功能可用
		if (record) {
			try {
				console.warn('[font-decrypt] 特征表网络加载失败，回退使用本地缓存：', url);
				return parseRecord(record);
			} catch {
				$store.delete(storeKey(url));
			}
		}
		throw err;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * 加载参考特征表（同一 URL 只加载一次；失败后清除缓存允许下次重试）
 *
 * 缓存层级：内存（页面级） -> GM 持久化（跨域名/跨会话） -> CDN（条件请求校验）
 * 服务端更新文件后无需发版：校验间隔到期自动发现新版本，见 REVALIDATE_* 常量说明
 */
export function loadRefTable(url: string): Promise<RefTable> {
	let cached = refTableCache.get(url);
	if (!cached) {
		// 失败时清除缓存，避免缓存住 rejected Promise 导致后续永远失败（网络恢复后也无法重试）
		cached = fetchAndParseRefTable(url).catch((err) => {
			refTableCache.delete(url);
			throw err;
		});
		refTableCache.set(url, cached);
	}
	return cached;
}
