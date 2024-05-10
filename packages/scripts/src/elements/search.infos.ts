import { SimplifyWorkResult, splitAnswer, $ } from '@ocsjs/core';
import { h } from 'easy-us';
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
	return dom.documentElement.innerText.replace(/https?:\/\/.+?\.(png|jpg|jpeg|gif)/g, (img) => {
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

	connectedCallback() {
		console.log('connectedCallback : ', this);

		const question = transformImgLinkOfQuestion(this.question || '无');

		this.append(
			h('div', [h('span', { innerHTML: question }), createQuestionTitleExtra(this.question)], (div) => {
				div.style.padding = '4px';
			}),
			h('hr')
		);

		this.append(
			...this.infos.map((info) => {
				return h('details', { open: true }, [
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

							return h('div', { className: 'search-result' }, [
								/** 题目 */
								h('div', { className: 'question' }, [h('span', { innerHTML: title })]),
								/** 答案 */
								h('div', { className: 'answer' }, [
									h('span', '答案：'),
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
