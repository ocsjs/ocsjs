import { ConfigElement } from '../elements/config';
import { Script } from '../interfaces';
import { Config } from '../interfaces/config';
import { $ } from './common';
import { CustomElementStyleAttrs, ElementChildren, ElementHandler, el } from './dom';
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

let popupWin: Window | null;
window.addEventListener('beforeunload', () => {
	popupWin?.close();
});

/**
 * 元素创建器
 */
export const $creator = {
	/** 创建多行的文本，支持 字符串，元素，以及包含字符串元素的列表，最多二维数组 */
	notes(lines: (string | HTMLElement | (string | HTMLElement)[])[], tag: 'ul' | 'ol' = 'ul') {
		return el(
			tag,
			lines.map((line) =>
				el(
					'li',
					Array.isArray(line)
						? line.map((node) => (typeof node === 'string' ? el('div', { innerHTML: node }) : node))
						: [typeof line === 'string' ? el('div', { innerHTML: line }) : line]
				)
			)
		);
	},
	/**
	 * 启动元素提示气泡，根据元素 title 即时显示，（兼容手机端的提示）
	 * @param target
	 */
	tooltip<T extends HTMLElement>(target: T) {
		target.setAttribute('data-title', target.title);
		// 油猴环境下，取消默认title，避免系统默认事件重复显示
		if (typeof $gm.getInfos() !== 'undefined') {
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
		attrs?: CustomElementStyleAttrs<Omit<Partial<HTMLInputElement>, 'type'>> | undefined,
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

		let configs = Object.create({});
		const elList = [];
		for (const key in script.configs) {
			if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
				const cfg = script.configs[key];
				// 如果存在分隔符
				if (cfg.separator) {
					// 将之前的配置项生成配置区域，并添加到列表中
					elList.push($creator.configsArea($creator.configs(script.namespace, configs || {}, opts.onload)));
					// 添加分隔符
					elList.push(el('div', { className: 'separator', style: { margin: '0px 8px' } }, cfg.separator));
					// 清空配置项
					configs = Object.create({});
				}

				configs[key] = cfg;
			}
		}
		// 如果还有剩余的配置项，生成配置区域，并添加到列表中
		if (Object.keys(configs).length > 0) {
			elList.push($creator.configsArea($creator.configs(script.namespace, configs || {}, opts.onload)));
		}

		scriptPanel.configsContainer.replaceChildren(...elList);

		return scriptPanel;
	},
	/** 创建独立的设置区域 */
	configsArea(configElements: Record<string, ConfigElement<any>>) {
		/** 创建设置板块 */
		const configsContainer: HTMLDivElement = el('div', { className: 'configs card' });
		/** 设置区域主体 */
		const configsBody: HTMLDivElement = el('div', { className: 'configs-body' });
		configsBody.append(...Object.entries(configElements).map(([key, el]) => el));
		configsContainer.append(configsBody);
		return configsContainer;
	},
	/** 创建设置元素 */
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
	},
	/**
	 * 创建关于问题题目的拓展功能按钮，包括复制和百度一下
	 * @param question 问题
	 */
	createQuestionTitleExtra(question: string) {
		const space = $creator.space(
			[
				$creator.copy('复制', question),
				el('span', { className: 'question-title-extra-btn', innerText: '🌏百度一下' }, (btn) => {
					btn.onclick = () => {
						popupWin?.close();
						popupWin = $.createCenteredPopupWindow(`https://www.baidu.com/s?wd=${question}`, '百度搜索', {
							width: 1000,
							height: 800,
							resizable: true,
							scrollbars: true
						});
					};
				})
			],
			{ x: 4 }
		);
		space.style.marginTop = '6px';
		space.style.textAlign = 'right';
		return el('div', { style: { textAlign: 'right' } }, [space]);
	},
	/**
	 * 将所有子元素隔开
	 * x: 默认 12
	 * y: 默认 0
	 * separator: 默认 ' '
	 */
	space(children: HTMLElement[], options?: { x?: number; y?: number; separator?: string }) {
		return el('div', { className: 'space' }, (div) => {
			for (let index = 0; index < children.length; index++) {
				const child = el('span', { className: 'space-item' }, [children[index]]);
				child.style.display = 'inline-block';
				const x = options?.x ?? 12;
				const y = options?.y ?? 0;
				if (index > 0) {
					child.style.marginLeft = x / 2 + 'px';
					child.style.marginRight = x / 2 + 'px';
					child.style.marginTop = y / 2 + 'px';
					child.style.marginBottom = y / 2 + 'px';
				} else {
					child.style.marginRight = x / 2 + 'px';
					child.style.marginBottom = y / 2 + 'px';
				}

				div.append(child);
				if (index !== children.length - 1) {
					div.append(el('span', [options?.separator ?? ' ']));
				}
			}
		});
	}
};
