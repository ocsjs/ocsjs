import { $ } from './common';
import { $ui, h } from 'easy-us';

export interface PreventTextOptions {
	/** 按钮文字 */
	name: string;
	/**
	 * 执行的延时
	 * @default 5
	 */
	delay?: number;
	/**
	 * 时间到后是否自动删除该文本按钮元素
	 * @default true
	 */
	autoRemove?: boolean;
	/** 执行的回调 */
	ondefault: (span: HTMLSpanElement) => void;
	/** 不执行的回调 */
	onprevent?: (span: HTMLSpanElement) => void;
}

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
