/* eslint-disable no-unused-vars */
import { definedCustomElements } from '../elements';
import { ConfigElement } from '../elements/config';
import { Config } from '../interfaces/config';
import { Script } from '../interfaces/script';

import { definedProjects } from '../projects';
import { getConfig, setConfig } from './common';

import { el } from './dom';
import { humpToTarget } from './string';

export function start() {
	for (const element of definedCustomElements) {
		const name = humpToTarget(element.name, '-');
		console.log({ name, element });

		customElements.define(name, element);
	}
	const container = el('container-element');
	let notes: HTMLDivElement[];
	let configs: ConfigElement[];

	for (const project of definedProjects) {
		for (const script of project.scripts) {
			if (script.url.some((u) => RegExp(u).test(document.location.href))) {
				/** 创建头部 */
				notes = createNotes(script.notes || []);
				configs = createConfigs(script.namespace, script.configs || {});
				/** 创建设置区域 */
				/** 执行脚本 */
				script.start({ cfg: createConfigProxy(script) });
			}
		}
	}

	document.onreadystatechange = () => {
		if (document.readyState === 'interactive') {
			document.body.appendChild(container);
			container.header.append(...notes);
			container.body.append(...configs);
		}
	};
}

export function createConfigs(namespace: string, configs: Record<string, Config>) {
	const elements = [];
	for (const key in configs) {
		if (Object.prototype.hasOwnProperty.call(configs, key)) {
			const cfg = configs[key];
			const element = el('config-element');
			element.key = uniqueKey(namespace, key);
			element.tag = cfg.tag;
			element.label.textContent = cfg.label;

			element.cors = cfg.cors;
			element.attrs = cfg.attrs;
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

/**
 * 构造 config 配置对象， 可进行响应式存储
 * @param script
 * @returns
 */
export function createConfigProxy(script: Script) {
	const proxy = new Proxy(script.cfg, {
		set(target, propertyKey, value) {
			setConfig(uniqueKey(script.namespace, propertyKey), value);
			return Reflect.set(target, propertyKey, value);
		},
		get(target, propertyKey) {
			const value = getConfig(uniqueKey(script.namespace, propertyKey));
			Reflect.set(target, propertyKey, value);
			return value;
		}
	});

	for (const key in script.configs) {
		if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
			const element = Reflect.get(script.configs, key);
			Reflect.set(proxy, key, getConfig(uniqueKey(script.namespace, key), element.defaultValue));
		}
	}

	return proxy;
}

function uniqueKey(namespace: string, key: any) {
	return namespace + '.' + key.toString();
}
