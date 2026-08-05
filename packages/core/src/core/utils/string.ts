import { findBestMatch, Rating } from 'string-similarity';

/**
 * 删除特殊字符, 并且全部转小写，只保留英文，数字，中文
 * @param str
 * @returns
 */
export function clearString(str: string, ...exclude: string[]) {
	exclude.push(...['①②③④⑤⑥⑦⑧⑨']);
	return str
		.trim()
		.toLocaleLowerCase()
		.replace(RegExp(`[^\\u2E80-\\u9FFFA-Za-z0-9${exclude.join('')}]*`, 'g'), '');
}

/**
 * 归一化字符串：去除标点、空格、全角转半角后再 clearString
 * 用于精确匹配前预处理，忽略空白和标点差异
 */
export function normalizeString(str: string): string {
	return clearString(
		str
			.replace(/[，。！？；：""''、（）【】《》\s]/g, '') // 去除中文标点和空白
			.replace(/[,.\-!?;:'"()[\]<>]/g, '') // 去除英文标点
			.replace(/[ａ-ｚＡ-Ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角→半角
			.replace(/％/g, '%')
	);
}

/**
 * 归一化精确匹配模式
 * 对答案和选项进行归一化处理后精确比对
 * 解决"多一个标点符号就匹配不上"的问题
 *
 * 方向说明（与 resolveMultiple 保持一致）：仅取"答案⊇选项"或相等，不取"选项⊇答案"，
 * 避免 "TCP" 误选 "TCP/IP协议"、"相对论" 误选 "爱因斯坦的相对论" 等语义不一致的选项。
 */
export function answerNormalizedMatch(answers: string[], options: string[]): string[] {
	const _answers = answers.map(removeRedundant).map(normalizeString);
	const _options = options.map(removeRedundant).map(normalizeString);

	return _answers.length !== 0
		? _options
				.map((opt, i) => {
					let level = 0;
					if (opt) {
						for (const ans of _answers) {
							if (ans === opt) {
								level = 2;
								break;
							} else if (ans.includes(opt)) {
								level = 1;
							}
						}
					}
					return { opt, original: options[i], level };
				})
				.filter(({ level }) => level > 0)
				.sort((a, b) => b.level - a.level)
				.map(({ original }) => original)
		: [];
}

/**
 * 答案相似度匹配 , 返回相似度对象列表 Array<{@link Rating}>
 *
 * 相似度计算算法 : https://www.npmjs.com/package/string-similarity
 *
 * @param answers 答案列表
 * @param options 选项列表
 *
 *
 * @example
 *
 * ```js
 *
 * answerSimilar( ['3'], ['1+2','3','4','错误的选项'] ) // [0, 1, 0, 0]
 *
 * answerSimilar( ['hello world','console.log("hello world")'], ['console.log("hello world")','hello world','1','错误的选项'] ) // [1, 1, 0, 0]
 *
 * ```
 *
 */
export function answerSimilar(answers: string[], options: string[]): Rating[] {
	const _answers = answers.map(removeRedundant).map((a) => clearString(a));
	const _options = options.map(removeRedundant).map((o) => clearString(o));

	const similar =
		_answers.length !== 0
			? _options.map((option) => {
					if (option.trim() === '') {
						return { rating: 0, target: '' };
					}
					return findBestMatch(option, _answers).bestMatch;
			  })
			: _options.map(() => ({ rating: 0, target: '' }));

	return similar;
}

/** 带领先度的相似度评分 */
export interface MatchRating extends Rating {
	/** 最高分选项与次高分选项的相似度差距（领先度），仅最高分选项有值，其余为 0 */
	gap: number;
}

/**
 * 带领先度消歧的相似度匹配
 * 返回每个选项的相似度 + 与次优选项的领先度
 * 用于解决"相似选项全选"的问题
 */
export function answerSimilarWithGap(answers: string[], options: string[]): MatchRating[] {
	const _answers = answers.map(removeRedundant).map((a) => clearString(a));
	const _options = options.map(removeRedundant).map((o) => clearString(o));

	if (_answers.length === 0) {
		return _options.map(() => ({ rating: 0, target: '', gap: 0 }));
	}

	const ratings = _options.map((option) => {
		if (option.trim() === '') {
			return { rating: 0, target: '' };
		}
		return findBestMatch(option, _answers).bestMatch;
	});

	// 计算领先度：最高分与次高分之间的差异
	const sortedRatings = [...ratings].sort((a, b) => b.rating - a.rating);
	const maxRating = sortedRatings[0]?.rating ?? 0;
	let secondRating = 0;
	// 找到与最高分不同的次高分（可能多个选项同分，需要找到真正不同的那个）
	for (let i = 1; i < sortedRatings.length; i++) {
		if (sortedRatings[i].rating < maxRating) {
			secondRating = sortedRatings[i].rating;
			break;
		}
	}

	return ratings.map((r) => ({
		...r,
		gap: r.rating === maxRating ? maxRating - secondRating : 0
	}));
}

/**
 * 	精准匹配模式，返回符合的选项字符串列表
 * @param answers	答案列表
 * @param options	选项列表
 */
export function answerExactMatch(answers: string[], options: string[]): string[] {
	const _answers = answers.map(removeRedundant);
	const _options = options.map(removeRedundant);

	const result =
		_answers.length !== 0
			? _options.filter((option) => {
					return _answers.find((answer) => answer.trim() === option.trim());
			  })
			: [];

	return result;
}

/**
 * 删除题目选项中开头的冗余字符串
 *
 * 两条规则依次执行：
 * 1. `A.` / `A、` / `A)` 等带分隔符的选项标签：字母 + 分隔符 + 内容
 * 2. `A选项` / `C男女平等` 等字母直接紧跟中文的标签：字母 + 中文内容
 *    （仅当字母后紧跟中文时剥离，故 "TCP协议"、"CPU" 等字母串不被误删）
 */
export function removeRedundant(str: string) {
	return (
		str
			?.trim()
			.replace(/^[A-Z]{1}[^A-Za-z0-9⺀-鿿]+([A-Za-z0-9⺀-鿿]+)/, '$1')
			.replace(/^[A-Z]{1}([⺀-鿿][A-Za-z0-9⺀-鿿]*)/, '$1') || ''
	);
}
