/* eslint-disable no-undef */
import { CustomElementTagMap } from '../elements/interface';

export type AllElementTagMaps = HTMLElementTagNameMap & CustomElementTagMap;
export type AllElementTagKeys = keyof AllElementTagMaps;
/** 子元素 */
export type ElementChildren = (string | Node)[] | string;
/** 元素数学 */
export type ElementAttrs<K extends AllElementTagKeys> = Partial<AllElementTagMaps[K]>;
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
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: Partial<AllElementTagMaps[K]>
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrsOrChildren?: ElementAttrs<K> | ElementChildren
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: Partial<AllElementTagMaps[K]>,
	children?: (string | HTMLElement)[] | string
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: Partial<AllElementTagMaps[K]>,
	handler?: ElementHandler<K>
): AllElementTagMaps[K];
export function el<K extends AllElementTagKeys>(
	tagName: K,
	attrs?: Partial<AllElementTagMaps[K]>,
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
					const value = attrs[key];
					Reflect.set(element, key, value);
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
export function $el(selector: string) {
	return document.querySelector(selector);
}

/**
 * 选择元素列表，效果等同于 document.querySelectorAll(selector)
 */
export function $$el(selector: string) {
	return Array.from(document.querySelectorAll(selector) as unknown as HTMLElement[]);
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
		target.style.top = target.offsetTop - pos2 + 'px';
		target.style.left = target.offsetLeft - pos1 + 'px';
	}

	function closeDragElement() {
		ondrag?.();
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;
	}
}

/**
 * 启动元素提示气泡，根据元素 title 即时显示，（兼容手机端的提示）
 * @param target
 */
export function tooltip<T extends HTMLElement>(target: T) {
	const title = el('div', { className: 'tooltip' });

	const onMouseMove = (e: MouseEvent) => {
		title.style.top = e.y + 'px';
		title.style.left = e.x + 'px';
	};
	const showTitle = (e: MouseEvent) => {
		if (target.title) {
			title.style.display = 'block';
			title.textContent = target.title;
			title.style.top = e.y + 'px';
			title.style.left = e.x + 'px';
			target.after(title);
		}

		window.addEventListener('mousemove', onMouseMove);
	};
	const hideTitle = () => {
		title.style.display = 'none';
		window.removeEventListener('mousemove', onMouseMove);
	};
	hideTitle();
	target.addEventListener('mouseenter', showTitle as any);
	target.addEventListener('click', showTitle as any);
	target.addEventListener('mouseout', hideTitle);
	target.addEventListener('blur', hideTitle);

	return target;
}
