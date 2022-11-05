/* eslint-disable no-undef */
import { CustomElementTagMap } from '../elements/interface';

export type AllElementTagMaps = HTMLElementTagNameMap & CustomElementTagMap;

/**
 * 创建元素，效果等同于 document.createElement(tagName, options)
 */
export function el<K extends keyof AllElementTagMaps>(
	tagName: K,
	options?: ElementCreationOptions | undefined
): AllElementTagMaps[K] {
	return document.createElement(tagName, options) as any;
}

/**
 * 选择元素，效果等同于 document.querySelector(selector)
 */
export function $el(selector: string) {
	return document.querySelector(selector);
}

/**
 * 选择元素列表，效果等同于 document.querySelectorAll(selector)
 */
export function $$el(selector: string) {
	return document.querySelectorAll(selector);
}
