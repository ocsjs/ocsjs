import { SimplifyWorkResult } from '../core/worker';
import { splitAnswer } from '../core/worker/utils';
import { $ } from '../utils/common';
import { $creator } from '../utils/creator';
import { el } from '../utils/dom';
import { IElement } from './interface';

/** 判断是否有网络图片格式的文本，有则替换成 img 标签  */
const transformImgLink = (str: string) =>
	str.replace(/https?:\/\/.*?ananas.*?\.(png|jpg|jpeg|gif)/g, (match) => `<img src="${match}" />`);

/**
 * 搜索结果元素
 */
export class SearchInfosElement extends IElement {
	/** 搜索结果 [题目，答案] */
	infos: SimplifyWorkResult['searchInfos'] = [];
	/** 当前的题目 */
	question: string = '';

	connectedCallback() {
		const question = transformImgLink(this.question || '无');

		this.append(
			el('div', [el('span', { innerHTML: question }), $creator.copy('复制', question)], (div) => {
				div.style.padding = '4px';
			}),
			el('hr')
		);

		this.append(
			...this.infos.map((info) => {
				return el('details', { open: true }, [
					el('summary', [el('a', { href: info.homepage, innerText: info.name })]),
					...(info.error
						? /** 显示错误信息 */
						  [el('span', { className: 'error' }, [info.error || '网络错误或者未知错误'])]
						: /** 显示结果列表 */
						  [
								...info.results.map((ans) => {
									const title = transformImgLink(ans[0] || this.question || '无');
									const answer = transformImgLink(ans[1] || '无');

									return el('div', { className: 'search-result' }, [
										/** 题目 */
										el('div', { className: 'question' }, [
											el('span', { innerHTML: title }),
											$creator.copy('复制', title)
										]),
										/** 答案 */
										el('div', { className: 'answer' }, [
											el('span', '答案：'),
											...splitAnswer(answer).map((a) => el('code', a)),
											$creator.copy('复制', splitAnswer(answer).join(' '))
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
