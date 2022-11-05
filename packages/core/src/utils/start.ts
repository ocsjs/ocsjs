import { definedCustomElements } from '../elements';

import { definedScripts } from '../scripts';

import { el } from './dom';
import { humpToTarget } from './string';

interface StartOptions {
	mount: HTMLElement;
}

export function start(options: StartOptions) {
	const container = el('container-element');

	for (const element of definedCustomElements) {
		customElements.define(humpToTarget(element.name, '-'), element, { extends: 'div' });
	}
	for (const script of definedScripts) {
		if (script.url.some((u) => RegExp(u).test(document.location.href))) {
			/** 创建头部 */
			container.header.append(...createNotes(script.notes || []));
			/** 创建设置区域 */
			container.body.append(...createConfigs(script.configs || []));
			/**
			 * 构造配置对象
			 */
			for (const key in script.configs) {
				if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
					const element = Reflect.get(script.configs, key);
					Reflect.set(script.cfg, key, element.defaultValue);
				}
			}
			/** 执行脚本 */
			script.start({ cfg: script.cfg });
		}
	}

	options.mount.appendChild(container);
}

export function createConfigs(configs: Record<string, any>) {
	const elements = [];
	for (const key in configs) {
		if (Object.prototype.hasOwnProperty.call(configs, key)) {
			const cfg = configs[key];
			const element = el('config-element');
			element.key = cfg.key;
			element.type = cfg.type;
			element.label.textContent = cfg.label;
			element.provider.value = cfg(cfg.key, cfg.defaultValue);
			element.cors = cfg.cors;
			elements.push(element);
		}
	}

	return elements;
}

export function createNotes(notes: string[]) {
	const elements = [];
	for (const note of notes) {
		const element = el('div');
		element.textContent = note;
		elements.push(element);
	}
	return elements;
}
