import { $ } from './common';
import { $ui, h } from 'easy-us';

let popupWin: Window | null;
window.addEventListener('beforeunload', () => {
	popupWin?.close();
});

/**
 * 创建关于问题题目的拓展功能按钮，包括复制和百度一下
 * @param question 问题
 */
export function createQuestionTitleExtra(question: string) {
	const space = $ui.space(
		[
			$ui.copy('复制', question),
			h('span', { className: 'question-title-extra-btn', innerText: '🌏百度一下' }, (btn) => {
				btn.onclick = () => {
					popupWin?.close();
					popupWin = $.createCenteredPopupWindow(`https://www.baidu.com/s?wd=${question}`, '百度搜索', {
						width: 1000,
						height: 800,
						resizable: true,
						scrollbars: true
					});
				};
			})
		],
		{ x: 4 }
	);
	space.style.marginTop = '6px';
	space.style.textAlign = 'right';
	return h('div', { style: { textAlign: 'right' } }, [space]);
}
