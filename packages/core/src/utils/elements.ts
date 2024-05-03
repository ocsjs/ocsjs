import { h } from 'easy-us';

const wrapper = h('div');
const root = wrapper.attachShadow({ mode: 'closed' });
const tooltipContainer = h('div', { className: 'tooltip-container' });
root.append(tooltipContainer);

/**
 * 全局元素
 */
export const $elements = {
	/** 整个悬浮窗的 div 包裹元素 */
	wrapper,
	/** ShadowRoot 根元素 */
	root,
	tooltipContainer
};
