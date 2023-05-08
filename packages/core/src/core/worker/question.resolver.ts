import { QuestionResolver, WorkContext } from './interface';
import { isPlainAnswer, splitAnswer } from './utils';
import { answerSimilar, removeRedundant, clearString } from '../utils/string';
import { $ } from '../../utils/common';
import { StringUtils } from '../../utils/string';

/** 默认答案题目处理器 */
export function defaultQuestionResolve<E>(
	ctx: WorkContext<E>
): Record<'single' | 'multiple' | 'completion' | 'judgement', QuestionResolver<E>> {
	return {
		/**
		 * 单选题处理器
		 *
		 * 在多个题库给出的答案中，找出最相似的答案
		 */
		async single(infos, options, handler) {
			const allAnswer = infos.map((res) => res.results.map((res) => splitAnswer(res.answer)).flat()).flat();
			const optionStrings = options.map((o) => removeRedundant(o.innerText));
			/** 配对选项的相似度 */
			const ratings = answerSimilar(allAnswer, optionStrings);
			/**  找出最相似的选项 */
			let index = -1;
			let max = 0;
			ratings.forEach((rating, i) => {
				if (rating.rating > max) {
					max = rating.rating;
					index = i;
				}
			});
			// 存在选项，并且相似度超过 60 %
			if (index !== -1 && max > 0.6) {
				/** 经自定义的处理器进行处理 */
				await handler('single', options[index].innerText, options[index], ctx);
				await $.sleep(500);
				return {
					finish: true,
					ratings: ratings.map((r) => r.rating)
				};
			}

			// 是否为纯ABCD答案
			for (const info of infos) {
				for (const res of info.results) {
					const ans = StringUtils.nowrap(res.answer).trim();
					if (ans.length === 1 && isPlainAnswer(ans)) {
						const index = ans.charCodeAt(0) - 65;
						await handler('single', options[index].innerText, options[index], ctx);
						await $.sleep(500);
						return { finish: true, option: options[index] };
					}
				}
			}

			return { finish: false, allAnswer, options: optionStrings, ratings };
		},
		/**
		 * 多选题处理器
		 *
		 * 匹配每个题库的答案，找出匹配数量最多的题库，并且选择
		 */
		async multiple(infos, options, handler) {
			/** 最终的回答列表 */
			const targetAnswers: string[][] = [];
			/** 最终的选项 */
			const targetOptions: HTMLElement[][] = [];

			type Result = {
				/** 匹配的选项 */
				options: HTMLElement[];
				/** 匹配的答案 */
				answers: string[];
				ratings: number[];
				/** 总匹配度 */
				similarSum: number;
				/** 匹配数量 */
				similarCount: number;
			};

			const list: Result[] = [];

			const results = infos.map((info) => info.results).flat();

			/**
			 * 遍历题库结果
			 * 选出结果中包含答案最多的一个
			 */
			for (let i = 0; i < results.length; i++) {
				const result = results[i];
				// 每个答案可能存在多个选项需要分割
				const answers = splitAnswer(result.answer);

				const matchResult: Result = { options: [], answers: [], ratings: [], similarSum: 0, similarCount: 0 };
				// 判断选项是否完全存在于答案里面
				for (const option of options) {
					const ans = answers.find((answer) =>
						answer.includes(removeRedundant(option.textContent || option.innerText))
					);
					if (ans) {
						matchResult.options.push(option);
						matchResult.answers.push(ans);
						matchResult.ratings.push(1);
						matchResult.similarSum += 1;
						matchResult.similarCount += 1;
					}
				}

				const ratingResult: Result = { options: [], answers: [], ratings: [], similarSum: 0, similarCount: 0 };
				// 相似度匹配
				const ratings = answerSimilar(
					answers,
					options.map((o) => removeRedundant(o.innerText))
				);
				for (let j = 0; j < ratings.length; j++) {
					const rating = ratings[j];
					if (rating.rating > 0.6) {
						ratingResult.options.push(options[j]);
						ratingResult.answers.push(ratings[j].target);
						ratingResult.ratings.push(ratings[j].rating);
						ratingResult.similarSum += rating.rating;
						ratingResult.similarCount += 1;
					}
				}

				// 如果全匹配大于 相似度匹配
				if (matchResult.similarSum > ratingResult.similarSum) {
					list[i] = matchResult;
				} else {
					list[i] = ratingResult;
				}
			}

			const match = list
				.filter((i) => i.similarCount !== 0)
				.sort((a, b) => {
					const bsc = b.similarCount * 100;
					const asc = a.similarCount * 100;
					const bss = b.similarSum;
					const ass = a.similarSum;

					// similarCount 由于是匹配的数量，其结果决定排序，
					// similarSum 是匹配精度，其结果决定同样数量的情况下，哪一个的精度更高

					// 高到低排序
					return bsc + bss - asc + ass;
				});

			if (match[0]) {
				for (let i = 0; i < match[0].options.length; i++) {
					await handler('multiple', match[0].answers[i], match[0].options[i], ctx);
					// 暂停一会防止点击过快
					await $.sleep(500);
				}

				return { finish: true, match, targetOptions, targetAnswers };
			} else {
				const plainOptions = [];
				// 纯ABCD答案
				for (const result of results) {
					const ans = StringUtils.nowrap(result.answer).trim();
					if (isPlainAnswer(ans)) {
						for (const char of ans) {
							const index = char.charCodeAt(0) - 65;
							await handler('single', options[index].innerText, options[index], ctx);
							await $.sleep(500);
							plainOptions.push(options[index]);
						}
					}
				}

				if (plainOptions.length) {
					return { finish: true, plainOptions };
				} else {
					return { finish: false };
				}
			}
		},
		/** 判断题处理器 */
		async judgement(infos, options, handler) {
			for (const answers of infos.map((info) => info.results.map((res) => res.answer))) {
				const correctWords = ['是', '对', '正确', '确定', '√', '对的', '是的', '正确的', 'true', 'True', 'yes', '1'];
				const incorrectWords = [
					'非',
					'否',
					'错',
					'错误',
					'×',
					'X',
					'错的',
					'不对',
					'不正确的',
					'不正确',
					'不是',
					'不是的',
					'false',
					'False',
					'no',
					'0'
				];

				/** 答案显示正确 */
				const answerShowCorrect = answers.find((answer) => matches(answer, correctWords));
				/** 答案显示错误 */
				const answerShowIncorrect = answers.find((answer) => matches(answer, incorrectWords));

				if (answerShowCorrect || answerShowIncorrect) {
					let option: HTMLElement | undefined;
					for (const el of options) {
						/** 选项显示正确 */
						const textShowCorrect = matches(el.innerText, correctWords);
						/** 选项显示错误 */
						const textShowIncorrect = matches(el.innerText, incorrectWords);

						if (answerShowCorrect && textShowCorrect) {
							option = el;
							await handler('judgement', answerShowCorrect, el, ctx);
							await $.sleep(500);
							break;
						}
						if (answerShowIncorrect && textShowIncorrect) {
							option = el;
							await handler('judgement', answerShowIncorrect, el, ctx);
							await $.sleep(500);
							break;
						}
					}

					return { finish: true, option };
				}

				function matches(target: string, options: string[]) {
					return options.some((option) => RegExp(clearString(option, '√', '×')).test(clearString(target, '√', '×')));
				}
			}

			return { finish: false };
		},
		/** 填空题处理器 */
		async completion(infos, options, handler) {
			for (const answers of infos.map((info) => info.results.map((res) => res.answer))) {
				// 排除空答案
				let ans = answers.filter((ans) => ans);
				if (ans.length === 1) {
					ans = splitAnswer(ans[0]);
				}

				if (
					ans.length !== 0 &&
					/** 答案数量要和文本框数量一致，或者文本框只有一个 */
					(ans.length === options.length || options.length === 1)
				) {
					if (ans.length === options.length) {
						for (let index = 0; index < options.length; index++) {
							const element = options[index];
							await handler('completion', ans[index], element, ctx);
							await $.sleep(500);
						}
						return { finish: true };
					} else if (options.length === 1) {
						await handler('completion', ans.join(' '), options[0], ctx);
						await $.sleep(500);
						return { finish: true };
					}

					return { finish: false };
				}
			}

			return { finish: false };
		}
	};
}
