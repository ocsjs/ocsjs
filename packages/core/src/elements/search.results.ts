import { SearchResult } from '../core/worker/answer.wrapper.handler';
import { splitAnswer } from '../core/worker/utils';
import { $creator } from '../utils/creator';
import { el } from '../utils/dom';
import { IElement } from './interface';

/** 判断是否有网络图片格式的文本，有则替换成 img 标签  */
const transformImgLink = (str: string) =>
	str.replace(/https?:\/\/.*?\.(png|jpg|jpeg|gif)/g, (match) => `<img src="${match}" />`);

export class SearchResultsElement extends IElement {
	results: SearchResult[] = [];
	question: string = '';

	connectedCallback() {
		const question = transformImgLink(this.question || '无');

		this.append(
			el('div', [question, $creator.copy('复制', question)], (div) => {
				div.style.padding = '4px';
			}),
			el('hr'),
			...this.results.map((res) => {
				return el('details', { open: true }, [
					el('summary', [el('a', { href: res.homepage, innerText: res.name })]),
					...(res.error
						? /** 显示错误信息 */
						  [
								el('span', { className: 'error' }, [
									'此题库搜题时发生错误：',
									res.error.message || '网络错误或者未知错误'
								])
						  ]
						: /** 显示结果列表 */
						  [
								...res.answers.map((ans) => {
									const title = transformImgLink(ans.question || this.question || '无');
									const answer = transformImgLink(ans.answer || '无');

									return el('div', { className: 'search-result' }, [
										/** 题目 */
										el('div', { className: 'question' }, [title, $creator.copy('复制', title)]),
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

		const resize = () => {
			this.style.maxHeight = window.innerHeight / 2 + 'px';
		};
		resize();
		window.addEventListener('resize', resize);
	}
}
