import { findBestMatch, Rating } from 'string-similarity';

/**
 * 删除特殊字符, 并且全部转小写，只保留英文，数字，中文
 * @param str
 * @returns
 */
export function clearString(str: string, ...exclude: string[]) {
	return str
		.trim()
		.toLocaleLowerCase()
		.replace(RegExp(`[^\\u4e00-\\u9fa5A-Za-z0-9${exclude.join('')}]*`, 'g'), '');
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
	const _answers = answers.map(removeRedundant);
	const _options = options.map(removeRedundant);

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

/**
 * 删除题目选项中开头的冗余字符串
 */
export function removeRedundant(str: string) {
	return str?.trim().replace(/[A-Z]{1}[^A-Za-z0-9\u4e00-\u9fa5]+([A-Za-z0-9\u4e00-\u9fa5]+)/, '$1') || '';
}
