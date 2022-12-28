import { SearchResult } from '../core/worker/answer.wrapper.handler';
import { splitAnswer } from '../core/worker/utils';
import { el } from '../utils/dom';
import { IElement } from './interface';

export class SearchResultsElement extends IElement {
	results: SearchResult[] = [];
	question: string = '';

	connectedCallback() {
		this.append(
			...this.results.map((res) => {
				return el('details', { open: true }, [
					el('summary', [el('a', { href: res.homepage, innerText: res.name })]),
					...(res.error
						? /** 显示错误信息 */
						  [el('span', { className: 'error' }, res.error.message || '未知错误')]
						: /** 显示结果列表 */
						  res.answers.map((answer) => {
								return el('div', { className: 'search-result' }, [
									/** 题目 */
									el('div', { className: 'question' }, [
										answer.question || this.question || '无',
										el('span', '复制', (btn) => {
											btn.className = 'copy';
											btn.onclick = () => {
												btn.innerText = '√';
												navigator.clipboard.writeText(answer.question || this.question || '无');
												setTimeout(() => {
													btn.innerText = '复制';
												}, 500);
											};
										})
									]),
									/** 答案 */
									el('div', { className: 'answer' }, [
										el('span', '答案：'),
										...splitAnswer(answer.answer || '无').map((a) => el('code', a)),
										el('span', '复制', (btn) => {
											btn.className = 'copy';
											btn.onclick = () => {
												btn.innerText = '√';
												navigator.clipboard.writeText(splitAnswer(answer.answer || '无').join(' '));
												setTimeout(() => {
													btn.innerText = '复制';
												}, 500);
											};
										})
									])
								]);
						  }))
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
