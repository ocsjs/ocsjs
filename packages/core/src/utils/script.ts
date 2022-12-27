import { el } from './dom';

/**
 * project 中脚本的辅助库
 */

/**
 * 创建 select 元素的子选项
 * @param selectedValue
 * @param options [value,text]
 * @returns
 */
export function $createSelectOptions(selectedValue: string | null = '', options: [any, string][]) {
	return options.map((opt) =>
		el('option', { value: String(opt[0]), innerText: opt[1] }, (opt) => {
			if (opt.value === selectedValue) {
				opt.toggleAttribute('selected');
			}
		})
	);
}
