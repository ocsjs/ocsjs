import { el } from './dom';

const panel = el('div');
const root = panel.attachShadow({ mode: 'closed' });

/**
 * 全局元素
 */
export const $elements = {
	/** 整个悬浮窗的 div 包裹元素 */
	panel,
	/** ShadowRoot 根元素 , 由 $elements.panel 创建  */
	root,
	/** 消息内容元素 */
	messageContainer: el('div', { className: 'message-container' }),
	/** 额外的菜单栏 */
	extraMenuBar: el('div', { className: 'extra-menu-bar' }),
	/** 悬浮提示 */
	tooltip: el('div', { className: 'tooltip' })
};
