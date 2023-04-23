/* eslint-disable no-undef */
import { CustomElementTagMap } from '../elements/interface';

/**
 * 可自定义元素样式的属性
 */
export type CustomElementStyleAttrs<E extends Record<string, any>> = {
	[K in keyof E]: K extends 'style' ? Partial<CSSStyleDeclaration> : E[K];
};

export type AllElementTagMaps = HTMLElementTagNameMap & CustomElementTagMap;
export type AllElementTagKeys = keyof AllElementTagMaps;
/** 子元素 */
export type ElementChildren = (string | Node)[] | string;
/** 元素属性 */
export type ElementAttrs<K extends AllElementTagKeys> = CustomElementStyleAttrs<Partial<AllElementTagMaps[K]>>;

/** 元素处理回调 */
export type ElementHandler<K extends AllElementTagKeys> = (
	this: AllElementTagMaps[K],
	el: AllElementTagMaps[K]
) => void;

/**
 * 创建元素，效果等同于 document.createElement(tagName, options)
 * @param tagName 标签名
 * @param attrsOrChildren 元素属性，或者子元素列表，或者字符串
 * @param childrenOrHandler 子元素列表，或者元素生成的回调函数
 */
export function el<K extends AllElementTagKeys>(tagName: K, children?: ElementChildren): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(tagName: K, attrs?: ElementAttrs<K>): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrsOrChildren?: ElementAttrs<K> | ElementChildren
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: ElementAttrs<K>,
	children?: (string | HTMLElement)[] | string
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: ElementAttrs<K>,
	handler?: ElementHandler<K>
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	children?: ElementChildren,
	handler?: ElementHandler<K>
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: ElementAttrs<K>,
	childrenOrHandler?: ElementChildren | ElementHandler<K>
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrsOrChildren?: ElementAttrs<K> | ElementChildren,
	childrenOrHandler?: ElementChildren | ElementHandler<K>
): AllElementTagMaps[K] {
	const element: AllElementTagMaps[K] = document.createElement(tagName) as any;
	if (attrsOrChildren) {
		if (Array.isArray(attrsOrChildren)) {
			element.append(...attrsOrChildren);
		} else if (typeof attrsOrChildren === 'string') {
			element.append(attrsOrChildren);
		} else {
			const attrs = attrsOrChildren;
			/** 设置属性 */
			for (const key in attrs) {
				if (Object.prototype.hasOwnProperty.call(attrs, key)) {
					if (key === 'style') {
						Object.assign(element.style, attrs[key]);
					} else {
						const value = attrs[key];
						Reflect.set(element, key, value);
					}
				}
			}
		}
	}
	if (childrenOrHandler) {
		if (typeof childrenOrHandler === 'function') {
			childrenOrHandler.call(element, element);
		} else if (Array.isArray(childrenOrHandler)) {
			element.append(...childrenOrHandler);
		} else if (typeof childrenOrHandler === 'string') {
			element.append(childrenOrHandler);
		}
	}

	return element;
}

/**
 * 选择元素，效果等同于 document.querySelector(selector)
 */
export function $el<T extends HTMLElement>(selector: string, root: HTMLElement | Document = window.document) {
	const el = root.querySelector(selector);
	return el === null ? undefined : (el as (T & { [x: string]: any }) | undefined);
}

/**
 * 选择元素列表，效果等同于 document.querySelectorAll(selector)
 */
export function $$el<T extends HTMLElement>(selector: string, root: HTMLElement | Document = window.document) {
	return Array.from(root.querySelectorAll(selector) as unknown as (T & { [x: string]: any })[]);
}

/**
 * 使元素可以被拖动
 * @param header 拖动块
 * @param target 移动块
 */
export function enableElementDraggable(header: HTMLElement, target: HTMLElement, ondrag?: () => void) {
	let pos1 = 0;
	let pos2 = 0;
	let pos3 = 0;
	let pos4 = 0;

	header.onmousedown = dragMouseDown;

	function dragMouseDown(e: MouseEvent) {
		e = e || window.event;

		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e: MouseEvent) {
		e = e || window.event;

		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		target.style.top = Math.max(target.offsetTop - pos2, 10) + 'px';
		target.style.left = target.offsetLeft - pos1 + 'px';
	}

	function closeDragElement() {
		ondrag?.();
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}
