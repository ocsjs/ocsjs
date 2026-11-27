import { splitAnswer, splitAnswerBySpaceSafely } from '../utils';

/** 填空题匹配结果 */
export interface CompletionResolveResult {
	finish: boolean;
	answers?: string[];
}

/**
 * 填空题匹配算法
 *
 * 遍历题库答案，找到答案数量与填空框数量一致的答案组，
 * 或者填空框只有一个时将所有答案合并。
 *
 * @param answerGroups  每个题库的答案列表
 * @param blankCount    填空框数量
 * @param separators    答案分隔符
 */
export function resolveCompletion(
	answerGroups: string[][],
	blankCount: number,
	separators?: string[]
): CompletionResolveResult {
	for (const answers of answerGroups) {
		let ans = answers.filter((a) => a);
		if (ans.length === 1) {
			ans = splitAnswer(ans[0], separators);
		}

		if (ans.length !== 0 && (ans.length === blankCount || blankCount === 1)) {
			if (ans.length === blankCount) {
				return { finish: true, answers: ans };
			} else if (blankCount === 1) {
				return { finish: true, answers: [ans.join(' ')] };
			}
		}
	}

	// 空格分隔兜底：题库答案为 "答案1 答案2 答案3" 这类空格分隔格式时，
	// 常规分隔符无法切分，此时用带安全校验（语言一致、字数差别不大）的空格分割再匹配一次。
	// 仅在空数大于 1 时生效（空数为 1 时上方已直接合并填写）。
	if (blankCount > 1) {
		for (const answers of answerGroups) {
			const ans = answers.filter((a) => a);
			if (ans.length === 1) {
				const spaceSplit = splitAnswerBySpaceSafely(ans[0]);
				if (spaceSplit && spaceSplit.length === blankCount) {
					return { finish: true, answers: spaceSplit };
				}
			}
		}
	}

	return { finish: false };
}
