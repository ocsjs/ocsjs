/**
 * 文本相似度匹配（纯逻辑，无 DOM/浏览器依赖，可在 node 中直接测试）
 *
 * 用途：课程全文检索兜底答题 —— 把课程章节文本作为语料，
 * 对「题目 + 候选选项」与语料片段做字符二元组重合度打分。
 */

/** 归一化：去空白、标点、全角转半角、小写化 */
export function normalizeText(s: string): string {
	return (s || '')
		.replace(/[\u3000\s]+/g, '')
		.replace(/[，。！？；：、“”‘’（）【】《》〈〉—…·,.!?;:'"()[\]<>-]/g, '')
		.toLowerCase();
}

/** 字符二元组集合（中文效果最佳；纯英文短词退化为词级集合） */
export function charBigrams(s: string): Set<string> {
	const text = normalizeText(s);
	const set = new Set<string>();
	if (!text) return set;
	if (/^[a-z0-9]+$/.test(text) && text.length <= 8) {
		set.add(text);
		return set;
	}
	if (text.length === 1) {
		set.add(text);
		return set;
	}
	for (let i = 0; i < text.length - 1; i++) {
		set.add(text.slice(i, i + 2));
	}
	return set;
}

/** 覆盖率：a 的二元组有多少比例出现在 b 中（0~1，a 为空时 0） */
export function coverage(a: string, b: string): number {
	const sa = charBigrams(a);
	if (sa.size === 0) return 0;
	const sb = charBigrams(b);
	let hit = 0;
	for (const g of sa) {
		if (sb.has(g)) hit++;
	}
	return hit / sa.size;
}

export interface Passage {
	/** 来源标记（章节名/卡片序号等），仅用于展示 */
	source?: string;
	text: string;
}

/**
 * 给单个候选答案打分：
 * 在所有语料片段中取 max( 候选被片段覆盖度 * (0.4 + 0.6 * 题目与片段的相关度) )
 * —— 只有与题目相关的片段才有发言权，候选在该片段中出现的次数越多越好。
 */
export function scoreCandidate(question: string, candidate: string, passages: Passage[]): number {
	let best = 0;
	for (const p of passages) {
		const relevance = coverage(question, p.text);
		if (relevance < 0.05) continue;
		const support = coverage(candidate, p.text);
		const score = support * (0.4 + 0.6 * relevance);
		if (score > best) best = score;
	}
	return best;
}

export interface CandidatePick {
	index: number;
	candidate: string;
	score: number;
	/** 第二名得分，用于判断命中是否显著 */
	runnerUp: number;
}

/**
 * 从候选列表中选出语料支持度最高的一项。
 * 命中条件：最高分 >= threshold 且领先第二名 margin 以上（避免瞎蒙）。
 */
export function pickBestCandidate(
	question: string,
	candidates: string[],
	passages: Passage[],
	threshold = 0.35,
	margin = 0.1
): CandidatePick | undefined {
	let best: CandidatePick | undefined;
	let runnerUp = 0;
	candidates.forEach((c, index) => {
		const score = scoreCandidate(question, c, passages);
		if (!best || score > best.score) {
			runnerUp = best?.score ?? 0;
			best = { index, candidate: c, score, runnerUp };
		} else if (score > runnerUp) {
			runnerUp = score;
		}
	});
	if (best) {
		best.runnerUp = runnerUp;
		if (best.score >= threshold && best.score - runnerUp >= margin) {
			return best;
		}
	}
	return undefined;
}

/** 按中文/英文句读切句 */
export function splitSentences(text: string): string[] {
	return (text || '')
		.split(/[。！？!?；;\n]+/)
		.map((s) => s.trim())
		.filter((s) => normalizeText(s).length >= 6);
}

/**
 * 从语料中找出与题目最相似的一句（用于填空题兜底填充）。
 * 返回 undefined 表示没有足够相似的句子。
 */
export function pickBestSentence(
	question: string,
	passages: Passage[],
	threshold = 0.3
): { sentence: string; score: number; source?: string } | undefined {
	let best: { sentence: string; score: number; source?: string } | undefined;
	for (const p of passages) {
		for (const sentence of splitSentences(p.text)) {
			if (sentence.length > 200) continue;
			const score = coverage(question, sentence) * 0.5 + coverage(sentence, question) * 0.5;
			if (!best || score > best.score) {
				best = { sentence, score, source: p.source };
			}
		}
	}
	return best && best.score >= threshold ? best : undefined;
}

/**
 * 从选项中选出与题目最相似的一项（无语料时的选项-题目匹配）。
 * 用双向覆盖率：题目覆盖选项 + 选项覆盖题目，取最高且超过阈值者；否则 undefined（交给随机兜底）。
 */
export function pickMostSimilarOption(
	question: string,
	options: string[],
	threshold = 0.35
): { option: string; score: number } | undefined {
	let best: { option: string; score: number } | undefined;
	for (const opt of options) {
		if (!opt.trim()) continue;
		const score = (coverage(question, opt) + coverage(opt, question)) / 2;
		if (!best || score > best.score) {
			best = { option: opt, score };
		}
	}
	return best && best.score >= threshold ? best : undefined;
}

/**
 * 多选匹配：按选项与题目的双向覆盖率从高到低排序。
 * 供「无题库时选匹配度最高的选项」使用：可配合阈值取多个，或直接取第一个（最高）。
 */
export function pickMostSimilarOptions(question: string, options: string[]): { option: string; score: number }[] {
	return options
		.map((opt) => {
			const score = opt.trim() ? (coverage(question, opt) + coverage(opt, question)) / 2 : 0;
			return { option: opt, score };
		})
		.filter((x) => x.score > 0)
		.sort((a, b) => b.score - a.score);
}

/** HTML 转纯文本：去 script/style/标签/实体，压缩空白 */
export function stripHtml(html: string): string {
	return (html || '')
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/[\t ]+/g, ' ')
		.replace(/\n\s+/g, '\n')
		.trim();
}
