import { splitAnswer, resolvePlainAnswer } from '../utils';
import { removeRedundant, answerNormalizedMatch, answerSimilar } from '../../utils/string';
import { StringUtils } from '../../../utils/string';

/** 单选题匹配结果 */
export interface SingleResolveResult {
	finish: boolean;
	option?: string;
	ratings?: number[];
	allAnswer?: string[];
	options?: string[];
}

/**
 * 单选题匹配算法（自适应）
 *
 * 四阶段自动匹配，无需手动选择模式：
 * 1. 归一化精确匹配 — 去除标点/空格/全角半角差异后精确比对
 * 2. 相似匹配 — 取所有选项中相似度最高且超过阈值的那个
 * 3. 纯ABCD答案兜底
 * 4. 多片段答案适配 — 题库答案被分隔符拆成多片段时，合并为一个答案后重新调用本算法
 *
 * @param answers  所有题库返回的答案列表
 * @param options   选项文本列表
 * @param separators 答案分隔符
 */
export function resolveSingle(answers: string[], options: string[], separators?: string[]): SingleResolveResult {
	const allAnswer = answers.map((a) => splitAnswer(a, separators)).flat();
	const optionStrings = options.map(removeRedundant);

	// ========== 阶段1: 归一化精确匹配 ==========
	const normalizedResult = answerNormalizedMatch(allAnswer, optionStrings);
	if (normalizedResult.length) {
		const index = optionStrings.findIndex((opt) => opt === normalizedResult[0]);
		if (index !== -1) {
			return { finish: true, option: options[index] };
		}
	}

	// ========== 阶段2: 相似匹配（取最优） ==========
	const ratings = answerSimilar(allAnswer, optionStrings);

	let bestIndex = -1;
	let bestRating = 0;
	ratings.forEach((r, i) => {
		if (r.rating > bestRating) {
			bestRating = r.rating;
			bestIndex = i;
		}
	});

	if (bestIndex !== -1 && bestRating > 0.6) {
		return {
			finish: true,
			option: options[bestIndex],
			ratings: ratings.map((r) => r.rating)
		};
	}

	// ========== 阶段3: 纯ABCD答案兜底 ==========
	for (const answer of allAnswer) {
		const ans = resolvePlainAnswer(StringUtils.nowrap(answer, '').trim());
		// 单选仅允许单字母答案（多字母视为多选答案，不在此处理）
		if (ans && ans.length === 1) {
			const index = ans.charCodeAt(0) - 65;
			if (optionStrings[index] !== undefined) {
				return { finish: true, option: options[index] };
			}
		}
	}

	// ========== 阶段4: 多片段答案适配（最后阶段） ==========
	// 当题库答案被分隔符拆成多个片段（如 "听党指挥 # 能打胜仗 # 作风优良"）时，
	// 单选的正确选项应是这些片段拼接后的整体。此处将所有片段合并为一个答案，
	// 再重新走一遍单选匹配流程：完整覆盖时阶段1即可精确命中；若仅覆盖部分片段，
	// 合并后的答案既无法精确匹配、相似度也达不到阈值，从而返回未命中。
	if (allAnswer.length > 1) {
		const merged = allAnswer.join('');
		const r = resolveSingle([merged], options, separators);
		if (r.finish) {
			return r;
		}
	}

	return { finish: false, allAnswer, options: optionStrings };
}
