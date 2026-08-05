import { SimplifyWorkResult, splitAnswer, $, QuestionTypes } from '@ocsjs/core';
import { $ui, h } from 'easy-us';
import { createQuestionTitleExtra } from '../utils';

/**
 * 判断是否有图片链接，如果有则使用 <img> 标签包裹，但如果已经被 <img> 包裹则不处理
 */
const transformImgLinkOfQuestion = (question: string) => {
	// 防止题目中包含 img 标签元素，所以先统一吧 img 标签替换成链接
	const dom = new DOMParser().parseFromString(question, 'text/html');
	for (const img of Array.from(dom.querySelectorAll('img'))) {
		img.replaceWith(img.src);
	}
	// 最后将所有图片链接替换成 img 标签
	return dom.documentElement.innerHTML.replace(/https?:\/\/.+?\.(png|jpg|jpeg|gif)/g, (img) => {
		return `<img src="${img}" />`;
	});
};

/**
 * 搜索结果元素
 */
export class SearchInfosElement extends HTMLElement {
	/** 搜索结果 [题目，答案] */
	infos: SimplifyWorkResult['searchInfos'] = [];
	/** 当前的题目 */
	question: string = '';

	type: QuestionTypes;

	connectedCallback() {
		const question = transformImgLinkOfQuestion(this.question || '无');

		const type_text = {
			single: '单选题',
			multiple: '多选题',
			judgement: '判断题',
			completion: '填空题'
		};
		const type_label = this.type ? Reflect.get(type_text, this.type) : '';

		this.append(
			h(
				'div',
				[
					...(type_label ? [h('span', { className: 'search-result-question-type' }, type_label)] : []),
					h('div', { className: 'title-content' }, [
						...question
							.split('\n')
							.map((l) => l.trim())
							.filter(Boolean)
							.map((l) => h('div', { innerHTML: l }))
					]),
					createQuestionTitleExtra(this.question)
				],
				(div) => {
					div.className = 'search-info-title';
				}
			)
		);

		this.append(
			...this.infos.map((info) => {
				return h('details', { open: true, className: 'search-info-details' }, [
					h('summary', [h('a', { href: info.homepage, innerText: info.name, target: '_blank' })]),

					...(info.error
						? /** 显示错误信息 */
						  [h('span', { className: 'error' }, [info.error || '网络错误或者未知错误'])]
						: /** 显示结果列表 */
						  []
					).concat([
						...info.results.map((ans) => {
							const title = transformImgLinkOfQuestion(ans[0] || this.question || '无');
							const answer = transformImgLinkOfQuestion(ans[1] || '无');
							const extra_data = JSON.parse(JSON.stringify(ans[2] || {}));

							if (extra_data.ai) {
								extra_data.tags = extra_data.tags || [];
								extra_data.tags.push({
									text: 'AI',
									title: '此答案由 AI 生成，仅供参考',
									color: 'blue'
								});
							}

							if (extra_data.cache) {
								extra_data.tags = extra_data.tags || [];
								extra_data.tags.push({
									text: '题库缓存',
									title:
										'此答案来自本地缓存，由在线题库搜索后保存在本地。\n- 清空缓存：请前往通用-拓展应用-题库缓存\n- 关闭缓存：请前往通用-全局设置-题库缓存',
									color: 'gray'
								});
							}

							return h('div', { className: 'search-result' }, [
								/** 题目 */
								h('div', { className: 'question' }, [h('span', { innerHTML: title })]),
								/** 答案 */
								h('div', { className: 'answer' }, [
									h('span', '答案：'),
									...(extra_data.tags
										? extra_data.tags.map((tag: { text: string; title: string; color: string }) =>
												$ui.tooltip(
													h('span', {
														className: 'search-result-answer-tag ' + tag.color,
														innerHTML: tag.text,
														title: tag.title,
														dataset: { title: tag.title }
													})
												)
										  )
										: []),
									...splitAnswer(answer).map((a) => h('code', { innerHTML: a }))
								])
							]);
						})
					])
				]);
			})
		);

		$.onresize(this, (sr) => {
			sr.style.maxHeight = window.innerHeight / 2 + 'px';
		});
	}
}
