import { el } from './dom';

const panel = el('div');
const root = panel.attachShadow({ mode: 'closed' });

/**
 * 全局元素
 */
export const $elements = {
	panel,
	root,
	messageContainer: el('div', { className: 'message-container' }),
	/** 悬浮提示 */
	tooltip: el('div', { className: 'tooltip' })
};

root.append($elements.messageContainer, $elements.tooltip);
