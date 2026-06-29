import { splitAnswer } from '../utils';

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
 * 增加了模糊匹配降级：当答案数 > 填空数时尝试合并多余空，
 * 当答案数 < 填空数时尝试拆分长答案。
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

		// 精确匹配：答案数 == 填空数
		if (ans.length !== 0 && (ans.length === blankCount || blankCount === 1)) {
			if (ans.length === blankCount) {
				return { finish: true, answers: ans };
			} else if (blankCount === 1) {
				return { finish: true, answers: [ans.join(' ')] };
			}
		}

		// 模糊匹配降级 1：答案数 > 填空数，尝试合并多余答案
		if (ans.length > blankCount && blankCount > 1) {
			const merged: string[] = [];
			const extra = ans.length - blankCount;
			let i = 0;
			for (let b = 0; b < blankCount; b++) {
				if (b < blankCount - extra) {
					merged.push(ans[i++]);
				} else {
					// 最后一个空合并剩余所有
					merged.push(ans.slice(i).join(' '));
					break;
				}
			}
			return { finish: true, answers: merged };
		}

		// 模糊匹配降级 2：答案数 < 填空数，尝试按长度拆分最长答案
		if (ans.length < blankCount && ans.length > 0 && blankCount > 1) {
			const merged: string[] = [];
			const needSplit = blankCount - ans.length;
			// 找到最长答案进行拆分
			let maxIdx = 0;
			for (let i = 1; i < ans.length; i++) {
				if (ans[i].length > ans[maxIdx].length) maxIdx = i;
			}
			const longAnswer = ans[maxIdx];
			const splitParts = splitAnswer(longAnswer, [',', '，', '、', ' ', ';', '；']);
			if (splitParts.length >= needSplit + 1) {
				// 用拆分后的部分替换该答案
				const newAns = [...ans];
				newAns.splice(maxIdx, 1, ...splitParts.slice(0, needSplit + 1));
				if (newAns.length === blankCount) {
					return { finish: true, answers: newAns.slice(0, blankCount) };
				}
			}
			// 如果还没匹配上，保留原答案（宁可多填少填也不要漏题）
			return { finish: true, answers: ans.slice(0, blankCount) };
		}
	}

	return { finish: false };
}
