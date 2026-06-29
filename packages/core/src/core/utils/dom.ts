import { RawElements, SearchedElements } from '../worker/interface';

/**
 * 设置输入元素的值并触发必要的事件
 * 现代前端框架（Vue/React/Angular）监听 input/change 事件，直接设置 value 不会触发这些事件。
 * 此函数确保所有框架都能感知到值的变化。
 *
 * @param element - 需要设置值的输入元素
 * @param value - 要设置的值
 * @param triggerChange - 是否同时触发 change 事件（默认 true）
 */
export function setInputValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string, triggerChange = true): void {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;
  const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value'
  )?.set;

  if (element instanceof HTMLTextAreaElement && nativeTextareaValueSetter) {
    nativeTextareaValueSetter.call(element, value);
  } else if (element instanceof HTMLInputElement && nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    (element as any).value = value;
  }

  // 触发 input 事件（Vue/React 监听这个）
  element.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

  if (triggerChange) {
    element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
  }
}

/**
 * 通用的完成答题事件修正函数
 * 替换直接修改 textarea.value 的旧写法，确保框架能感知到值变化
 */
export async function setCompletionAnswer(
  option: HTMLElement,
  answer: string
): Promise<boolean> {
  const textarea = option.querySelector('textarea');
  if (textarea) {
    setInputValue(textarea, answer);
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  // 尝试直接 input 元素
  const input = option.querySelector('input:not([type="radio"]):not([type="checkbox"])');
  if (input) {
    setInputValue(input as HTMLInputElement, answer);
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }

  return false;
}

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
				? item(root).filter(Boolean)
				: item.map((fun) => fun(root))
		);
	});
	return obj;
}
