import { Config } from '../interfaces/config';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';

/**
 * 通过key获取存储的值
 * @param key 键
 * @param defaultValue 默认值
 * @returns
 */
export function getConfig(key: string, defaultValue?: any) {
	// eslint-disable-next-line no-undef
	return GM_getValue(key, defaultValue);
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
 * 存储值
 * @param key 键
 * @param value 值
 * @returns
 */
export function setConfig(key: string, value: any) {
	// eslint-disable-next-line no-undef
	GM_setValue(key, value);
}

export function onConfigChange(key: string, handler: (pre: any, curr: any, remote: boolean) => any) {
	// eslint-disable-next-line no-undef
	GM_addValueChangeListener(key, (_, pre, curr, remote) => {
		handler(pre, curr, remote);
	});
}

/**
 * 获取匹配到的程序
 * @param projects 程序列表
 * @returns
 */
export function getMatchedScripts(projects: Project[]) {
	const scripts = [];
	for (const project of projects) {
		for (const script of project.scripts) {
			if (script.url.some((u) => RegExp(u).test(document.location.href))) {
				scripts.push(script);
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

/**
 * 构造 config 配置对象， 可进行响应式存储
 * @param script
 * @returns
 */
export function createConfigProxy<T extends Record<string, Config> = Record<string, Config>>(script: Script<T>) {
	const proxy = new Proxy(script.cfg, {
		set(target, propertyKey, value) {
			const key = namespaceKey(script.namespace, propertyKey);
			setConfig(key, value);
			return Reflect.set(target, propertyKey, value);
		},
		get(target, propertyKey) {
			const value = getConfig(namespaceKey(script.namespace, propertyKey));
			Reflect.set(target, propertyKey, value);
			return value;
		}
	});

	// 设置默认值
	for (const key in script.configs) {
		if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
			const element = Reflect.get(script.configs, key);
			Reflect.set(proxy, key, getConfig(namespaceKey(script.namespace, key), element.defaultValue));
		}
	}

	return proxy;
}
