import { ConfigElement } from '../elements/config';
import { Config } from '../interfaces/config';

import { namespaceKey } from './common';
import { ElementChildren, ElementHandler, el } from './dom';

export const $creator = {
	/**
	 * 启动元素提示气泡，根据元素 title 即时显示，（兼容手机端的提示）
	 * @param target
	 */
	tooltip<T extends HTMLElement>(target: T) {
		const title = el('div', { className: 'tooltip' });
		target.setAttribute('data-title', target.title);
		// 取消默认title，避免系统默认事件重复显示
		target.removeAttribute('title');

		const onMouseMove = (e: MouseEvent) => {
			title.style.top = e.y + 'px';
			title.style.left = e.x + 'px';
		};
		const showTitle = (e: MouseEvent) => {
			const dataTitle = target.getAttribute('data-title');
			if (dataTitle) {
				title.style.display = 'block';
				title.innerHTML = dataTitle.split('\n').join('<br>') || '';
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
	},

	/**
	 * 创建 select 元素的子选项
	 * @param selectedValue
	 * @param options [value,text,title]
	 * @returns
	 */
	selectOptions(selectedValue: string | null = '', options: ([any, string] | [any, string, string])[]) {
		return options.map((opt) =>
			el('option', { value: String(opt[0]), innerText: opt[1], title: opt[2] }, (opt) => {
				if (opt.value === selectedValue) {
					opt.toggleAttribute('selected');
				}
			})
		);
	},
	input(
		attrs?: Partial<HTMLInputElement> | undefined,
		children?: ElementChildren,
		handler?: ElementHandler<'input'> | undefined
	) {
		return el('input', attrs, function (input) {
			input.append(...(children || []));
			input.classList.add('base-style-input');
			handler?.apply(this, [input]);
		});
	},
	button(
		attrs?: Omit<Partial<HTMLInputElement>, 'type'> | undefined,
		children?: ElementChildren,
		handler?: ElementHandler<'input'> | undefined
	) {
		return el('input', { type: 'button', ...attrs }, function (btn) {
			btn.append(...(children || []));
			btn.classList.add('base-style-button');
			handler?.apply(this, [btn]);
		});
	},
	/** 创建设置区域 */

	configs<T extends Record<string, Config<any>>>(namespace: string | undefined, configs: T) {
		const elements: { [K in keyof T]: ConfigElement<T[K]['tag']> } = Object.create({});
		for (const key in configs) {
			if (Object.prototype.hasOwnProperty.call(configs, key)) {
				const cfg = configs[key];
				if (cfg.label !== undefined) {
					const element = el('config-element', {
						key: namespaceKey(namespace, key),
						tag: cfg.tag,
						sync: cfg.sync,
						attrs: cfg.attrs,
						_onload: cfg.onload
					});
					element.label.textContent = cfg.label;
					elements[key] = element;
				}
			}
		}

		return elements;
	}
};
