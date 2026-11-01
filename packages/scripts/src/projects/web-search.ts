/**
 * 免费网络搜索兜底（Bing 网页搜索，无需 API Key）
 *
 * 题库搜不到时先用网络搜索结果作为语料：把 Bing 结果页的标题+摘要提取为段落，
 * 再用 text-match 的覆盖率对选项打分 / 找与题目最相似的文句。
 */

import { gmGet } from '../projects/cx-context';
import { scoreCandidate, pickBestSentence } from '../utils/text-match';
import type { Passage } from '../utils/text-match';
import { extractBingPassages } from '../utils/web-search-core';
import type { ContextPick } from '../utils/fallback-core';

const BING_URL = 'https://cn.bing.com/search?q=';

/** 网络搜索：把问题作为查询，返回解析出的段落 */
export async function webSearchPassages(question: string): Promise<Passage[]> {
	try {
		const url = BING_URL + encodeURIComponent(question);
		const r = await gmGet(url);
		return extractBingPassages(r.text);
	} catch (e) {
		return [];
	}
}

/**
 * 网络搜索兜底：返回选项中最受网络语料支持的项（或填空的最相似文句）。
 * 只选得分超过阈值且明显领先的项，避免乱答。
 */
export async function webSearchPick(
	question: string,
	optionTexts: string[],
	type: 'single' | 'multiple' | 'judgement' | 'completion'
): Promise<ContextPick | undefined> {
	// 判断题选项是「对/错」，网络覆盖度无意义，不参与
	if (type === 'judgement') return undefined;
	const passages = await webSearchPassages(question);
	if (!passages.length) return undefined;

	if (type === 'completion') {
		const best = pickBestSentence(question, passages);
		return best ? { answer: best.sentence, score: best.score, source: '网络' } : undefined;
	}

	// 单选：选网络语料支持度最高的选项
	const candidates = optionTexts.map((t) => ({ t, s: scoreCandidate(question, t, passages) }));
	candidates.sort((a, b) => b.s - a.s);
	if (candidates[0] && candidates[0].s >= 0.35 && candidates[0].s - (candidates[1]?.s || 0) >= 0.05) {
		return { answer: candidates[0].t, score: candidates[0].s, source: '网络' };
	}
	return undefined;
}
