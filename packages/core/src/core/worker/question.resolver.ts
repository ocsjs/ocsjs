import { QuestionResolver, WorkContext } from './interface';
import { resolveSingle, resolveMultiple, resolveJudgement, resolveCompletion, isJudgementOptions } from './resolvers';

/** 默认答案题目处理器 */
export function createDefaultQuestionResolver<E>(
	ctx: WorkContext<E>
): Record<'single' | 'multiple' | 'completion' | 'judgement', QuestionResolver<E>> {
	return {
		/**
		 * 单选题处理器
		 *
		 * 委托给 resolveSingle 纯函数，将 DOM 元素适配为字符串
		 */
		async single(infos, options, handler) {
			const optionTexts = options.map((o) => o.innerText);

			// 选项具备判断题性质时，直接走判断题处理逻辑
			if (isJudgementOptions(optionTexts.map((o) => o.trim()))) {
				const answerGroups = infos.map((info) => info.results.map((res) => res.answer));
				const result = resolveJudgement(answerGroups, optionTexts);
				if (result.finish && result.option !== undefined) {
					const index = optionTexts.indexOf(result.option);
					const opt = index !== -1 ? options[index] : options[0];
					await handler('judgement', result.option, opt, ctx);
				}
				return result;
			}

			const answers = infos.map((info) => info.results.map((res) => res.answer)).flat();

			const result = resolveSingle(answers, optionTexts, ctx.answerSeparators);

			if (result.finish && result.option !== undefined) {
				const index = optionTexts.indexOf(result.option);
				const opt = index !== -1 ? options[index] : options[0];
				await handler('single', result.option, opt, ctx);
			}

			return result;
		},
		/**
		 * 多选题处理器
		 *
		 * 委托给 resolveMultiple 纯函数，将 DOM 元素适配为字符串
		 */
		async multiple(infos, options, handler) {
			const resultAnswers = infos.map((info) => info.results.map((res) => res.answer)).flat();
			const optionTexts = options.map((o) => o.innerText);

			const result = resolveMultiple(resultAnswers, optionTexts, ctx.answerSeparators);

			// 纯 ABCD 答案兜底走 plainOptions，普通匹配走 options
			const resolvedOptions = result.finish ? result.options ?? result.plainOptions : undefined;

			if (result.finish && resolvedOptions) {
				for (const optText of resolvedOptions) {
					const index = optionTexts.indexOf(optText);
					const opt = index !== -1 ? options[index] : options[0];
					await handler('multiple', optText, opt, ctx);
				}
			}

			return result;
		},
		/**
		 * 判断题处理器
		 *
		 * 委托给 resolveJudgement 纯函数
		 */
		async judgement(infos, options, handler) {
			const answerGroups = infos.map((info) => info.results.map((res) => res.answer));
			const optionTexts = options.map((o) => o.innerText);

			const result = resolveJudgement(answerGroups, optionTexts);

			if (result.finish && result.option !== undefined) {
				const index = optionTexts.indexOf(result.option);
				const opt = index !== -1 ? options[index] : options[0];
				await handler('judgement', result.option, opt, ctx);
			}

			return result;
		},
		/**
		 * 填空题处理器
		 *
		 * 委托给 resolveCompletion 纯函数
		 */
		async completion(infos, options, handler) {
			const answerGroups = infos.map((info) => info.results.map((res) => res.answer));

			const result = resolveCompletion(answerGroups, options.length, ctx.answerSeparators);

			if (result.finish && result.answers) {
				for (let i = 0; i < result.answers.length; i++) {
					await handler('completion', result.answers[i], options[i], ctx);
				}
			}

			return result;
		}
	};
}
