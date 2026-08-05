import { splitAnswer, resolvePlainAnswer } from '../utils';
import { removeRedundant, answerNormalizedMatch, answerSimilarWithGap, normalizeString } from '../../utils/string';
import { findBestMatch } from 'string-similarity';
import { StringUtils } from '../../../utils/string';

/** 多选题单个题库结果的匹配数据 */
export interface MultipleMatchGroup {
	options: string[];
	answers: string[];
	ratings: number[];
	similarSum: number;
	similarCount: number;
}

/** 多选题匹配结果 */
export interface MultipleResolveResult {
	finish: boolean;
	options?: string[];
	plainOptions?: string[];
	groups?: MultipleMatchGroup[];
}

/**
 * 多选题匹配算法（自适应）
 *
 * 两阶段自动匹配，无需手动选择模式：
 * 1. 归一化匹配（单向 答案⊇选项）— 去除标点/空格差异后，仅当答案包含选项（或相等）才视为命中；
 *    不取"选项包含答案"方向，避免 "TCP" 误选 "TCP/IP协议" 等语义不一致的选项
 * 2. 相似匹配 + 领先度消歧 — 候选选项两两比较，文本相似时只保留匹配度更高的
 * 3. 纯ABCD答案兜底
 *
 * @param resultAnswers  每个题库结果的原始答案字符串列表
 * @param options         选项文本列表
 * @param separators      答案分隔符
 */
export function resolveMultiple(
	resultAnswers: string[],
	options: string[],
	separators?: string[]
): MultipleResolveResult {
	const optionStrings = options.map(removeRedundant);

	const groups: MultipleMatchGroup[] = [];

	for (let i = 0; i < resultAnswers.length; i++) {
		const answers = splitAnswer(resultAnswers[i].trim(), separators);

		// 阶段1: 归一化匹配（包含式）
		const normalizedGroup: MultipleMatchGroup = {
			options: [],
			answers: [],
			ratings: [],
			similarSum: 0,
			similarCount: 0
		};
		const normalizedOptions = answerNormalizedMatch(answers, optionStrings);
		for (const opt of normalizedOptions) {
			// answerNormalizedMatch 返回的是 optionStrings（已 removeRedundant）中的字符串，
			// 故在 optionStrings 中定位索引，再映射回原始 options，避免前缀剥离后查找不到
			const idx = optionStrings.indexOf(opt);
			if (idx !== -1) {
				// 严格方向：仅当 答案⊇选项（或归一化相等）时才视为命中，
				// 避免 "TCP" 误选 "TCP/IP协议" 等选项⊇答案的误匹配
				const matchedAns = answers.find((a) => {
					const na = normalizeString(removeRedundant(a));
					const no = normalizeString(removeRedundant(opt));
					return na === no || na.includes(no);
				});
				if (!matchedAns) continue;
				normalizedGroup.options.push(options[idx]);
				normalizedGroup.answers.push(matchedAns);
				// 归一化匹配中，答案与选项完全归一化相等的评分更高
				const na = normalizeString(removeRedundant(matchedAns));
				const no = normalizeString(removeRedundant(opt));
				const rating = na === no ? 1 : 0.8;
				normalizedGroup.ratings.push(rating);
				normalizedGroup.similarSum += rating;
				normalizedGroup.similarCount += 1;
			}
		}
		// 归一化匹配结果也需要消歧
		const normalizedDisambiguated = disambiguateSimilarOptions(normalizedGroup.options, normalizedGroup.ratings);
		const normalizedKeptIndices = normalizedDisambiguated.map((opt) => normalizedGroup.options.indexOf(opt));
		normalizedGroup.options = normalizedDisambiguated;
		normalizedGroup.answers = normalizedKeptIndices.map((idx) => normalizedGroup.answers[idx]);
		normalizedGroup.ratings = normalizedKeptIndices.map((idx) => normalizedGroup.ratings[idx]);
		normalizedGroup.similarCount = normalizedGroup.options.length;
		normalizedGroup.similarSum = normalizedGroup.ratings.reduce((a, b) => a + b, 0);

		// 相似度匹配
		const ratingGroup: MultipleMatchGroup = { options: [], answers: [], ratings: [], similarSum: 0, similarCount: 0 };
		const ratings = answerSimilarWithGap(answers, optionStrings);
		for (let j = 0; j < ratings.length; j++) {
			if (ratings[j].rating > 0.6) {
				ratingGroup.options.push(options[j]);
				ratingGroup.answers.push(ratings[j].target);
				ratingGroup.ratings.push(ratings[j].rating);
				ratingGroup.similarSum += ratings[j].rating;
				ratingGroup.similarCount += 1;
			}
		}

		// 领先度消歧
		const disambiguated = disambiguateSimilarOptions(ratingGroup.options, ratingGroup.ratings);
		const keptIndices = disambiguated.map((opt) => ratingGroup.options.indexOf(opt));
		ratingGroup.options = disambiguated;
		ratingGroup.answers = keptIndices.map((idx) => ratingGroup.answers[idx]);
		ratingGroup.ratings = keptIndices.map((idx) => ratingGroup.ratings[idx]);
		ratingGroup.similarCount = ratingGroup.options.length;
		ratingGroup.similarSum = ratingGroup.ratings.reduce((a, b) => a + b, 0);

		// 选匹配度最高的
		const best = [normalizedGroup, ratingGroup].sort(
			(a, b) => b.similarCount * 100 + b.similarSum - a.similarCount * 100 - a.similarSum
		)[0];
		groups[i] = best;
	}

	const sorted = groups
		.filter((g) => g.similarCount !== 0)
		.sort((a, b) => {
			const bsc = b.similarCount * 100;
			const asc = a.similarCount * 100;
			return bsc + b.similarSum - asc - a.similarSum;
		});

	if (sorted[0]) {
		return { finish: true, options: sorted[0].options, groups: sorted };
	}

	// 纯ABCD答案兜底
	const plainOptions: string[] = [];
	for (const answer of resultAnswers) {
		const ans = StringUtils.nowrap(answer, '').trim();
		if (resolvePlainAnswer(ans)) {
			for (const char of ans) {
				const index = char.charCodeAt(0) - 65;
				if (options[index] !== undefined) {
					plainOptions.push(options[index]);
				}
			}
		}
	}

	if (plainOptions.length) {
		return { finish: true, plainOptions: [...new Set(plainOptions)] };
	}

	return { finish: false };
}

/**
 * 领先度消歧：候选选项两两比较文本相似度，如果非常相似则只保留与答案匹配度更高的
 * 解决多选题"一字之差的选项全选"问题
 *
 * 示例：
 *   选项A "计算机网络" rating=1.0，选项B "计算机网络原理" rating=0.8
 *   二者文本相似度 > 0.6 → 只保留 rating 更高的 A
 */
export function disambiguateSimilarOptions(options: string[], ratings: number[], threshold = 0.6): string[] {
	if (options.length <= 1) return options;

	const normalized = options.map((o) => normalizeString(removeRedundant(o)));
	const eliminated = new Set<number>();

	for (let i = 0; i < options.length; i++) {
		if (eliminated.has(i)) continue;
		for (let j = i + 1; j < options.length; j++) {
			if (eliminated.has(j)) continue;
			const pairwise = findBestMatch(normalized[i], [normalized[j]]).bestMatch.rating;
			if (pairwise > threshold) {
				if (ratings[i] >= ratings[j]) {
					eliminated.add(j);
				} else {
					eliminated.add(i);
					break;
				}
			}
		}
	}

	return options.filter((_, i) => !eliminated.has(i));
}
