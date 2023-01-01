import { Config } from '../interfaces/config';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getValue, setValue } from './tampermonkey';

/**
 * 构造 config 配置对象， 可进行响应式存储
 * @param script
 * @returns
 */
export function createConfigProxy(script: Script) {
	const proxy = new Proxy(script.cfg, {
		set(target, propertyKey, value) {
			const key = namespaceKey(script.namespace, propertyKey);
			setValue(key, value);
			return Reflect.set(target, propertyKey, value);
		},
		get(target, propertyKey) {
			const value = getValue(namespaceKey(script.namespace, propertyKey));
			Reflect.set(target, propertyKey, value);
			return value;
		}
	});

	// 设置默认值
	for (const key in script.configs) {
		if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
			const element = Reflect.get(script.configs, key);
			Reflect.set(proxy, key, getValue(namespaceKey(script.namespace, key), element.defaultValue));
		}
	}

	if (script.namespace) {
		// 重置特殊的 notes 对象
		proxy.notes = script.configs?.notes?.defaultValue;
	}

	return proxy;
}

/**
 * 获取所有未经处理过的脚本配置
 * @param scripts
 * @returns
 */
export function getAllRawConfigs(scripts: Script[]): Record<string, Config> {
	const object = {};
	for (const script of scripts) {
		for (const key in script.configs) {
			if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
				const { label, ...element } = script.configs[key];
				Reflect.set(object, namespaceKey(script.namespace, key), {
					label: namespaceKey(script.namespace, key),
					...element
				} as Config);
			}
		}
	}
	return object;
}

/**
 * 获取匹配到的程序
 * @param projects 程序列表
 * @returns
 */
export function getMatchedScripts(projects: Project[], urls: string[]) {
	const scripts = [];
	for (const project of projects) {
		for (const key in project.scripts) {
			if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
				const script = project.scripts[key];
				if (script.url.some((u) => urls.some((url) => RegExp(u).test(url)))) {
					scripts.push(script);
				}
			}
		}
	}
	return scripts;
}

/**
 * 获取具名键
 * @param namespace
 * @param key
 * @returns
 */
export function namespaceKey(namespace: string | undefined, key: any) {
	return namespace ? namespace + '.' + key.toString() : key.toString();
}

export function uuid() {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export async function sleep(period: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, period);
	});
}

/**
 * 当前是否处于浏览器环境
 */
export function isInBrowser(): boolean {
	return typeof window !== 'undefined' && typeof window.document !== 'undefined';
}
