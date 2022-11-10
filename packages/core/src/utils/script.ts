import { el } from './dom';

/**
 * project 中脚本的辅助库
 */

/**
 * 创建 select 元素的子选项
 * @param selectedValue
 * @param options
 * @returns
 */
export function $createSelectOptions(selectedValue: string, options: { text: string; value: any }[]) {
	return options.map((opt) =>
		el('option', { value: String(opt.value), innerText: opt.text }, (opt) => {
			if (opt.value === selectedValue) {
				opt.toggleAttribute('selected');
			}
		})
	);
}
