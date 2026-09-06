import { getImageSize, upscalePngDataUrl } from './png-upscaler';

export interface ImageSuggestionResult {
	/** base64 图片数组，顺序对应 [图片1]、[图片2]… */
	images: string[];
	/** 原题标题中图片 URL 替换为 [图片N] 占位符后的文本（不含 base64） */
	suggestion_title: string;
	/** 原选项中图片 URL 替换为 [图片N] 占位符后的文本（不含 base64），无图片时为 undefined */
	suggestion_options?: string;
}

/** 是否运行在 Node 环境（非浏览器 / 非油猴脚本） */
function isNodeEnv(): boolean {
	return (
		typeof process !== 'undefined' &&
		!!(process as any).versions?.node &&
		(globalThis as any).GM_xmlhttpRequest === undefined
	);
}

/** Node 下用 node-fetch 拉取图片并转为 data URL（base64） */
async function nodeFetchToBase64(url: string): Promise<string> {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fet: typeof fetch = require('node-fetch').default || require('node-fetch');
	// 携带 Referer / User-Agent 绕过防盗链（如 chaoxing 403）
	let referer = '';
	try {
		referer = new URL(url).origin + '/';
	} catch {
		// 非 URL，忽略
	}
	const res = await fet(url, {
		headers: {
			Referer: referer,
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
		}
	});
	if (!res.ok) {
		throw new Error(`图片下载失败 ${res.status}`);
	}
	// node-fetch v2 支持 .buffer()
	const buffer = (res as any).buffer ? (res as any).buffer() : res.arrayBuffer();
	const buf: Buffer = buffer instanceof Promise ? await buffer : buffer;
	const contentType = res.headers.get('content-type') || 'image/png';
	return `data:${contentType};base64,${buf.toString('base64')}`;
}

/**
 * 将图片转换为 base64 字符串
 * 支持传入 URL 字符串或 HTMLImageElement
 * 优先使用 Canvas 方式（浏览器已携带认证信息加载图片，可绕过防盗链）
 * Canvas 失败时（跨域无 CORS 头导致画布被污染）回退到 GM_xmlhttpRequest
 */
export function imageToBase64(source: string | HTMLImageElement): Promise<string> {
	return new Promise((resolve, reject) => {
		// 如果是 HTMLImageElement，直接用 Canvas 绘制转换
		if (typeof HTMLImageElement !== 'undefined' && source instanceof HTMLImageElement) {
			// 已经是 data URL，直接返回
			if (source.src.startsWith('data:')) {
				resolve(source.src);
				return;
			}
			try {
				const canvas = document.createElement('canvas');
				canvas.width = source.naturalWidth;
				canvas.height = source.naturalHeight;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(source, 0, 0);
				const dataUrl = canvas.toDataURL('image/png');
				resolve(dataUrl);
				return;
			} catch {
				// Canvas 被污染（跨域无 CORS），回退到 GM_xmlhttpRequest
			}
		}

		// URL 字符串或 Canvas 回退：尝试通过 crossOrigin="anonymous" 加载图片再用 Canvas 转换
		const url = typeof source === 'string' ? source : source.src;

		// 已经是 data URL，直接返回
		if (url.startsWith('data:')) {
			resolve(url);
			return;
		}

		// Node 环境：直接拉取图片字节转 base64
		if (isNodeEnv()) {
			nodeFetchToBase64(url).then(resolve, reject);
			return;
		}

		// 浏览器环境：尝试设置 crossOrigin 加载图片 + Canvas 转换
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			try {
				const canvas = document.createElement('canvas');
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0);
				resolve(canvas.toDataURL('image/png'));
			} catch {
				// Canvas 失败，回退到 GM_xmlhttpRequest
				gmXmlHttpRequestFallback(url, resolve, reject);
			}
		};
		img.onerror = () => {
			// 图片加载失败（CORS 阻止），回退到 GM_xmlhttpRequest
			gmXmlHttpRequestFallback(url, resolve, reject);
		};
		img.src = url;
	});
}

/** GM_xmlhttpRequest 回退方案，忽略跨域限制 */
function gmXmlHttpRequestFallback(url: string, resolve: (value: string) => void, reject: (reason: any) => void) {
	if (typeof GM_xmlhttpRequest === 'undefined') {
		reject(new Error('图片转 base64 失败'));
		return;
	}
	// eslint-disable-next-line no-undef
	GM_xmlhttpRequest({
		url,
		method: 'GET',
		responseType: 'blob',
		onload: (response) => {
			const blob = response.response as Blob;
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		},
		onerror: reject
	});
}

/**
 * 将任意 data URL（可能含 charset 等参数、或非 png mime）统一为 data:image/png;base64,{b64} 格式。
 * 仅重写前缀与 mime，不转换图片字节。
 */
function normalizeToPngDataUrl(dataUrl: string): string {
	const m = dataUrl.match(/^data:[^;,]+.*?;base64,(.+)$/);
	return `data:image/png;base64,${m ? m[1] : dataUrl}`;
}

/** 图片最小边长阈值：低于此值的图片会被题库/模型（如豆包 14px）拒绝，需放大后再提交 */
const MIN_IMAGE_DIMENSION = 14;

export async function createImageSuggestion(
	title: string,
	options?: string,
	/** DOM 调用方可直接传入按文档顺序的标题图片 URL，跳过正则提取 */
	titleImages?: string[],
	/** DOM 调用方可直接传入按文档顺序的选项图片 URL，跳过正则提取 */
	optionImages?: string[]
): Promise<ImageSuggestionResult | undefined> {
	// 匹配图片 URL：非贪婪且排除中文/全角字符，避免跨越多个 URL 或中文文本拼成非法 URL
	const imageUrlRegex = /https?:\/\/[^\s一-鿿＀-￯]+?\.(?:png|jpe?g|gif|bmp|webp|svg)(?:\?[^\s一-鿿＀-￯]*)?/gi;

	// 收集标题和选项中的所有图片 URL，保持顺序
	// 若调用方提供 images 数组则直接使用（DOM 遍历所得，跳过正则）；否则回退到正则提取（字符串输入场景）
	const titleUrls = titleImages && titleImages.length ? titleImages.slice() : title.match(imageUrlRegex) || [];
	const optionUrls = optionImages && optionImages.length ? optionImages.slice() : options?.match(imageUrlRegex) || [];

	if (titleUrls.length === 0 && optionUrls.length === 0) return undefined;

	// 去重，保持顺序
	const allUrls: string[] = [];
	const seen = new Set<string>();
	for (const url of [...titleUrls, ...optionUrls]) {
		if (!seen.has(url)) {
			seen.add(url);
			allUrls.push(url);
		}
	}

	// 并行转换所有图片为 base64
	const base64Map = new Map<string, string>();
	await Promise.all(
		allUrls.map(async (url) => {
			try {
				const base64 = await imageToBase64(url);
				base64Map.set(url, base64);
			} catch {
				// 转换失败的图片跳过
			}
		})
	);

	if (base64Map.size === 0) return undefined;

	// 构建 URL → [图片N] 的映射，同时按顺序收集 base64 数组
	// 按 allUrls（题目/选项中的出现顺序）遍历，而非下载完成顺序，保证编号与原文一致
	// 占位符左右各加两个空格，与相邻中文/符号分隔，便于题库解析
	const images: string[] = [];
	const placeholderMap = new Map<string, string>();
	for (const url of allUrls) {
		const base64 = base64Map.get(url);
		if (!base64) continue;
		// 统一为 data:image/png;base64,{b64} 格式，去除 charset 等参数与原始 mime 差异
		let normalized = normalizeToPngDataUrl(base64);
		// 过小图片放大到 ≥ MIN_IMAGE_DIMENSION，避免模型（如豆包 14px）拒绝
		const size = getImageSize(normalized);
		if (size && (size.width < MIN_IMAGE_DIMENSION || size.height < MIN_IMAGE_DIMENSION)) {
			try {
				normalized = await upscalePngDataUrl(normalized, MIN_IMAGE_DIMENSION);
			} catch (e: any) {
				console.warn(
					`[imageOptimize] 图片 ${size.width}x${size.height} 放大失败，已跳过：${url}（${e?.message}）`
				);
				continue;
			}
		}
		placeholderMap.set(url, ` [图片${images.length + 1}] `);
		images.push(normalized);
	}

	if (images.length === 0) return undefined;

	// 标题：URL 替换为 [图片N] 占位符（不含 base64）
	let suggestionTitle = title;
	for (const [url, placeholder] of placeholderMap) {
		suggestionTitle = suggestionTitle.split(url).join(placeholder);
	}

	// 选项：URL 替换为 [图片N] 占位符（不含 base64），仅当选项含图片时返回
	let suggestionOptions: string | undefined;
	if (options) {
		const hasOptionImages = optionUrls.some((url) => base64Map.has(url));
		if (hasOptionImages) {
			suggestionOptions = options;
			for (const [url, placeholder] of placeholderMap) {
				suggestionOptions = suggestionOptions!.split(url).join(placeholder);
			}
		}
	}

	return {
		images,
		suggestion_title: suggestionTitle,
		...(suggestionOptions !== undefined ? { suggestion_options: suggestionOptions } : {})
	};
}

/** 按行去重字符串，保持首次出现的顺序 */
function dedupeLines(str: string): string {
	const seen = new Set<string>();
	const result: string[] = [];
	for (const line of str.split('\n')) {
		if (!seen.has(line)) {
			seen.add(line);
			result.push(line);
		}
	}
	return result.join('\n');
}

/** 数组去重，保持首次出现的顺序 */
function dedupeArray<T>(arr: T[]): T[] {
	const seen = new Set<T>();
	const result: T[] = [];
	for (const item of arr) {
		if (!seen.has(item)) {
			seen.add(item);
			result.push(item);
		}
	}
	return result;
}

export async function buildAnswererEnv(params: {
	type?: string;
	title: string;
	/** 选项文本，支持字符串或字符串数组（数组会按行拼接为字符串） */
	options?: string | string[];
	/** DOM 调用方传入的标题图片 URL（跳过正则提取） */
	titleImages?: string[];
	/** DOM 调用方传入的选项图片 URL（跳过正则提取） */
	optionsImages?: string[];
	enableImageOptimize?: boolean;
}): Promise<Record<string, any>> {
	// options 归一化为字符串：数组按行拼接，保证后续占位符替换与图片匹配均为字符串处理
	const rawOptions = Array.isArray(params.options)
		? params.options.filter((o) => o != null && o !== '').join('\n')
		: params.options ?? '';
	// options 按行去重（保持顺序）
	const options = dedupeLines(rawOptions);
	// 原题 title / options 始终保留，不做覆盖与修改
	const env: Record<string, any> = {
		type: params.type || 'unknown',
		title: params.title,
		options
	};
	if (params.enableImageOptimize) {
		const suggestion = await createImageSuggestion(params.title, options, params.titleImages, params.optionsImages);
		if (suggestion) {
			// 新增独立字段，由题库配置（v2）显式引用后才会被提交
			// images / suggestion_options 去重，避免重复数据上传
			env.images = dedupeArray(suggestion.images);
			env.suggestion_title = suggestion.suggestion_title;
			if (suggestion.suggestion_options !== undefined) {
				env.suggestion_options = dedupeLines(suggestion.suggestion_options);
			}
		}
	}
	return env;
}

/**
 * 题库配置是否支持图片题优化。
 *
 * 仅判定请求方法是否为 POST：GET 方法无法安全携带 base64 图片数据。
 *
 * 注意：本函数仅用于**提示**用户更新题库配置，不做任何限制。
 * 因为上传内容由题库配置的占位符决定，而原题 title / options 不再被覆盖，
 * 旧配置（只读 ${title} / ${options}）不会上传新增字段，因此即便返回 false 也是安全的。
 */
export function isAnswererWrappersSupportImageOptimize(wrappers: any[]): boolean {
	return wrappers.some((w) => w && String(w.method || 'get').toLowerCase() === 'post');
}
