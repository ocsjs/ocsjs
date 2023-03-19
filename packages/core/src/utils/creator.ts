import { ConfigElement } from '../elements/config';
import { Script } from '../interfaces';
import { Config } from '../interfaces/config';
import { $ } from './common';
import { ElementChildren, ElementHandler, el } from './dom';
import { $elements } from './elements';
import { $gm } from './tampermonkey';

export interface PreventTextOptions {
	/** 按钮文字 */
	name: string;
	/**
	 * 执行的延时
	 * @default 5
	 */
	delay?: number;
	/**
	 * 时间到后是否自动删除该文本按钮元素
	 * @default true
	 */
	autoRemove?: boolean;
	/** 执行的回调 */
	ondefault: (span: HTMLSpanElement) => void;
	/** 不执行的回调 */
	onprevent?: (span: HTMLSpanElement) => void;
}

/**
 * 元素创建器
 */
export const $creator = {
	/** 创建多行的文本，支持 字符串，元素，以及包含字符串元素的列表，最多二维数组 */
	notes(lines: (string | HTMLElement | (string | HTMLElement)[])[], tag: 'ul' | 'ol' = 'ul') {
		return el(
			tag,
			lines.map((line) => el('li', Array.isArray(line) ? line.map((node) => el('div', [node])) : [line]))
		);
	},
	/**
	 * 启动元素提示气泡，根据元素 title 即时显示，（兼容手机端的提示）
	 * @param target
	 */
	tooltip<T extends HTMLElement>(target: T) {
		target.setAttribute('data-title', target.title);
		// 油猴环境下，取消默认title，避免系统默认事件重复显示
		if (typeof $gm.unsafeWindow !== 'undefined') {
			target.removeAttribute('title');
		}

		const onMouseMove = (e: MouseEvent) => {
			$elements.tooltip.style.top = e.y + 'px';
			$elements.tooltip.style.left = e.x + 'px';
		};
		const showTitle = (e: MouseEvent) => {
			const dataTitle = target.getAttribute('data-title');
			if (dataTitle) {
				$elements.tooltip.innerHTML = dataTitle.split('\n').join('<br>') || '';
				$elements.tooltip.style.top = e.y + 'px';
				$elements.tooltip.style.left = e.x + 'px';
				$elements.tooltip.style.display = 'block';
			} else {
				$elements.tooltip.style.display = 'none';
			}

			window.addEventListener('mousemove', onMouseMove);
		};
		const hideTitle = () => {
			$elements.tooltip.style.display = 'none';
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
		text?: string,
		attrs?: Omit<Partial<HTMLInputElement>, 'type'> | undefined,
		handler?: ElementHandler<'input'> | undefined
	) {
		return el('input', { type: 'button', ...attrs }, function (btn) {
			btn.value = text || '';
			btn.classList.add('base-style-button');
			handler?.apply(this, [btn]);
		});
	},
	// 创建脚本面板
	scriptPanel(script: Script, opts: { projectName: string; onload?: (el: ConfigElement) => void }) {
		const scriptPanel = el('script-panel-element', { name: script.name });

		// 监听提示内容改变
		script.onConfigChange('notes', (pre, curr) => {
			scriptPanel.notesContainer.innerHTML = script.cfg.notes || '';
		});
		// 注入 panel 对象 ， 脚本可修改 panel 对象进行面板的内容自定义
		script.panel = scriptPanel;

		scriptPanel.notesContainer.innerHTML = script.configs?.notes?.defaultValue || '';
		const els = $creator.configs(script.namespace, script.configs || {}, opts.onload);
		const elList = [];
		for (const key in els) {
			if (Object.prototype.hasOwnProperty.call(els, key)) {
				elList.push(els[key]);
			}
		}

		scriptPanel.configsBody.append(...elList);
		scriptPanel.configsContainer.append(scriptPanel.configsBody);

		return scriptPanel;
	},
	/** 创建设置区域 */
	configs<T extends Record<string, Config<any>>>(
		namespace: string | undefined,
		configs: T,
		onload?: (el: ConfigElement) => void
	) {
		const elements: { [K in keyof T]: ConfigElement<T[K]['tag']> } = Object.create({});
		for (const key in configs) {
			if (Object.prototype.hasOwnProperty.call(configs, key)) {
				const config = configs[key];
				if (config.label !== undefined) {
					const element = el('config-element', {
						key: $.namespaceKey(namespace, key),
						tag: config.tag,
						sync: config.sync,
						attrs: config.attrs,
						_onload: config.onload,
						defaultValue: config.defaultValue
					});
					onload?.(element);
					element.label.textContent = config.label;
					elements[key] = element;
				}
			}
		}

		return elements;
	},
	/**
	 * 生成一个复制按钮
	 * @param name 按钮名
	 * @param value 复制内容
	 */
	copy(name: string, value: string) {
		return el('span', '📄' + name, (btn) => {
			btn.className = 'copy';

			btn.addEventListener('click', () => {
				btn.innerText = '已复制√';
				navigator.clipboard.writeText(value);
				setTimeout(() => {
					btn.innerText = '📄' + name;
				}, 500);
			});
		});
	},
	/**
	 * 创建一个取消默认事件的文字按钮，如果不点击，则执行默认事件
	 * @param  opts 参数
	 */
	preventText(opts: PreventTextOptions) {
		const { name, delay = 3, autoRemove = true, ondefault, onprevent } = opts;
		const span = el('span', name);

		span.style.textDecoration = 'underline';
		span.style.cursor = 'pointer';
		span.onclick = () => {
			clearTimeout(id);
			if (autoRemove) {
				span.remove();
			}
			onprevent?.(span);
		};
		const id = setTimeout(() => {
			if (autoRemove) {
				span.remove();
			}
			ondefault(span);
		}, delay * 1000);

		return span;
	}
};
