import { $, defaultAnswerWrapperHandler, OCSWorker, WorkResult } from '@ocsjs/core';
import { $message } from 'easy-us';
import { CommonWorkOptions } from '../utils';
import { optimizationElementWithImage, simplifyWorkResult } from '../utils/work';
import { BackgroundProject } from './background';
import { CommonProject } from './common';

function normalizeText(text: string) {
	return text.replace(/\s+/g, ' ').trim();
}

function getQuestionTitle(titles: (HTMLElement | undefined)[]) {
	return titles
		.filter(Boolean)
		.map((title) => normalizeText(optimizationElementWithImage(title as HTMLElement, true).innerText))
		.filter(Boolean)
		.join(',');
}

function getQuestionOptions(options: HTMLElement[]) {
	return options
		.map((option) => normalizeText(optimizationElementWithImage(option, true).innerText))
		.filter(Boolean)
		.join('\n');
}

function inferQuestionType(root: HTMLElement, options: HTMLElement[]): 'single' | 'multiple' | 'judgement' | 'completion' | undefined {
	const typeText = normalizeText(root.querySelector('.item-type')?.textContent || '');

	if (typeText.includes('单选')) {
		return 'single';
	}
	if (typeText.includes('多选')) {
		return 'multiple';
	}
	if (typeText.includes('判断')) {
		return 'judgement';
	}
	if (/(填空|简答|主观)/.test(typeText)) {
		return 'completion';
	}

	const radioCount = options.filter((option) => option.querySelector('[type="radio"]')).length;
	const checkboxCount = options.filter((option) => option.querySelector('[type="checkbox"]')).length;
	const textareaCount = options.filter(
		(option) =>
			option instanceof HTMLTextAreaElement ||
			(option instanceof HTMLInputElement && option.type === 'text') ||
			option.querySelector('textarea,input[type="text"]')
	).length;

	if (radioCount === 2) {
		return 'judgement';
	}
	if (radioCount > 0) {
		return 'single';
	}
	if (checkboxCount > 0) {
		return 'multiple';
	}
	if (textareaCount > 0) {
		return 'completion';
	}
}

function fillInputValue(element: HTMLElement, answer: string) {
	const input =
		element instanceof HTMLInputElement
			? element
			: element instanceof HTMLTextAreaElement
			? element
			: element.querySelector<HTMLInputElement | HTMLTextAreaElement>('input[type="text"], textarea');

	if (!input) {
		return;
	}

	input.value = answer;
	input.dispatchEvent(new Event('input', { bubbles: true }));
	input.dispatchEvent(new Event('change', { bubbles: true }));
	(input as HTMLElement).focus?.();
	(input as HTMLElement).blur?.();
}

function clickChoiceOption(option: HTMLElement) {
	const input = option.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]');
	if (input?.checked) {
		return;
	}

	option.click();
	input?.dispatchEvent(new Event('change', { bubbles: true }));
}

export function yktExamWork({ answererWrappers, period, thread, answerSeparators, answerMatchMode }: CommonWorkOptions) {
	$message.info({ content: '开始作业/考试' });
	CommonProject.scripts.workResults.methods.init();

	const titleTransform = (titles: (HTMLElement | undefined)[]) => getQuestionTitle(titles);

	const worker = new OCSWorker({
		root: '.exercise-item',
		elements: {
			title: '.item-body h4.exam-font',
			options: '.item-body .el-radio, .item-body .el-checkbox, .item-body textarea, .item-body input[type="text"]'
		},
		thread: thread ?? 1,
		answerSeparators: answerSeparators.split(',').map((s) => s.trim()),
		answerMatchMode: answerMatchMode,
		answerer: (elements, ctx) => {
			const title = titleTransform(elements.title);

			if (!title) {
				throw new Error('题目为空，请忽略此题或反馈页面结构变化。');
			}

			return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
				await $.sleep((period ?? 3) * 1000);
				return defaultAnswerWrapperHandler(answererWrappers, {
					type: ctx.type || 'unknown',
					title,
					options: getQuestionOptions((ctx.elements.options || []) as HTMLElement[])
				});
			});
		},
		work: {
			type(ctx) {
				return inferQuestionType(ctx.root, (ctx.elements.options || []) as HTMLElement[]);
			},
			async handler(type, answer, option) {
				if (type === 'single' || type === 'multiple' || type === 'judgement') {
					clickChoiceOption(option);
					return;
				}

				if (type === 'completion' && answer.trim()) {
					fillInputValue(option, answer.trim());
				}
			}
		},
		onResultsUpdate(curr, _, res) {
			const simplified = simplifyWorkResult(res, titleTransform);
			CommonProject.scripts.workResults.methods.setResults(simplified);

			if (curr.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
					simplifyWorkResult([curr as WorkResult<any>], titleTransform)
				);
			}

			CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
		}
	});

	worker
		.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug })
		.then(() => {
			$message.info({ content: '作业/考试完成，请自行检查后提交。', duration: 0 });
			worker.emit('done');
		})
		.catch((err) => {
			$message.error({ content: `作业/考试失败: ${err}`, duration: 0 });
		});

	return worker;
}
