/**
 * 视频清晰度选择（纯逻辑，可单测）
 *
 * 超星播放器的视频源/清晰度档位在不同课程里字段不统一
 * （res / label / name，值可能是「流畅/标清/高清/超清」或「360p/720p/1080p」），
 * 这里统一折算成 0~4 的质量等级，0 最低，用于「自动最低清晰度」省流量。
 */

export interface VideoSourceLike {
	res?: string;
	label?: string;
	name?: string;
	[key: string]: any;
}

/** 清晰度标签 → 等级（0 最低） */
const LABEL_RANKS: [RegExp, number][] = [
	[/流畅|smooth/i, 0],
	[/标清|普清|standard|sd/i, 1],
	// 「超高清」含「高清」，必须先匹配超清一档
	[/超清|超高清|fullhd|1080/i, 3],
	[/高清|\bhd\b|high/i, 2],
	[/原画|蓝光|4k|2k|2160|1440/i, 4]
];

/** 数字分辨率 → 等级 */
function numericRank(pixels: number): number {
	if (pixels <= 360) return 0;
	if (pixels <= 540) return 1;
	if (pixels <= 800) return 2;
	if (pixels <= 1200) return 3;
	return 4;
}

/**
 * 识别单个视频源的质量等级，无法识别时返回 undefined。
 */
export function qualityRankOf(source: VideoSourceLike): number | undefined {
	if (!source) return undefined;
	const raw = [source.res, source.label, source.name].find((v) => typeof v === 'string' && v.trim()) as
		| string
		| undefined;
	if (!raw) return undefined;
	const text = raw.trim();
	for (const [pattern, rank] of LABEL_RANKS) {
		if (pattern.test(text)) return rank;
	}
	const matched = text.match(/(\d{3,4})\s*[pPiI]/);
	if (matched) return numericRank(parseInt(matched[1], 10));
	return undefined;
}

/**
 * 从视频源列表中挑选最低清晰度的一个。
 * 全部无法识别质量时返回第一个（播放器通常把最低清晰度放在最前）。
 */
export function pickLowestSource<T extends VideoSourceLike>(sources: T[]): T | undefined {
	if (!Array.isArray(sources) || sources.length === 0) return undefined;
	if (sources.length === 1) return sources[0];
	let best: T | undefined;
	let bestRank = Number.POSITIVE_INFINITY;
	for (const source of sources) {
		const rank = qualityRankOf(source);
		if (rank === undefined) continue;
		if (rank < bestRank) {
			bestRank = rank;
			best = source;
		}
	}
	return best || sources[0];
}
