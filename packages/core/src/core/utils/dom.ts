import { RawElements, SearchedElements } from '../worker/interface';

/**
 * 与 {@link domSearchAll } 相同，区别是这个只返回单个元素，而不是一个元素数组
 * @param root
 * @param wrapper
 * @returns
 */
export function domSearch<E extends RawElements>(
	/** 搜索构造器 */
	wrapper: E,
	root: HTMLElement | Document = window.document
): SearchedElements<E, HTMLElement | null> {
	const obj = Object.create({});
	Reflect.ownKeys(wrapper).forEach((key) => {
		const item = wrapper[key.toString()];
		Reflect.set(
			obj,
			key,
			typeof item === 'string'
				? root.querySelector(item)
				: typeof item === 'function'
				? item(root)
				: item.map((fun) => fun(root))
		);
	});
	return obj;
}

/**
 * 元素搜索
 *
 * @example
 *
 * const { title , btn , arr } = domSearch(document.body,{
 *      title: '.title'
 *      btn: ()=> '.btn',
 *      arr: ()=> Array.from(document.body.querySelectorAll('.function-arr'))
 * })
 *
 * console.log(title) // 等价于 Array.from(document.body.querySelectorAll('.title'))
 * console.log(btn)// 等价于 Array.from(document.body.querySelectorAll('.btn'))
 */
export function domSearchAll<E extends RawElements>(
	/** 搜索构造器 */
	wrapper: E,
	root: HTMLElement | Document = window.document
): SearchedElements<E, HTMLElement[]> {
	const obj = Object.create({});
	Reflect.ownKeys(wrapper).forEach((key) => {
		const item = wrapper[key.toString()];

		Reflect.set(
			obj,
			key,
			typeof item === 'string'
				? Array.from(root.querySelectorAll(item))
				: typeof item === 'function'
				? item(root)
				: item.map((fun) => fun(root))
		);
	});
	return obj;
}
