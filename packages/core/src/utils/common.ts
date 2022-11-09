import { Config } from '../interfaces/config';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';

/**
 * 通过key获取存储的值
 * @param key 键
 * @param defaultValue 默认值
 * @returns
 */
export function getValue(key: string, defaultValue?: any) {
	// eslint-disable-next-line no-undef
	return GM_getValue(key, defaultValue);
}

export function deleteValue(key: string) {
	// eslint-disable-next-line no-undef
	GM_deleteValue(key);
}

export function listValues() {
	// eslint-disable-next-line no-undef
	return GM_listValues();
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
export function setValue(key: string, value: any) {
	// eslint-disable-next-line no-undef
	GM_setValue(key, typeof value === 'undefined' ? '' : value);
}

export function addConfigChangeListener(key: string, handler: (pre: any, curr: any, remote: boolean) => any) {
	// eslint-disable-next-line no-undef
	return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
		handler(pre, curr, remote);
	});
}

export function removeConfigChangeListener(listenerId: number) {
	// eslint-disable-next-line no-undef
	GM_removeValueChangeListener(listenerId);
}

/**
 * 获取匹配到的程序
 * @param projects 程序列表
 * @returns
 */
export function getMatchedScripts(projects: Project[], urls: string[]) {
	const scripts = [];
	for (const project of projects) {
		for (const script of project.scripts) {
			if (script.url.some((u) => urls.some((url) => RegExp(u).test(url)))) {
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
			const value = getValue(namespaceKey(script.namespace, key));
			Reflect.set(proxy, key, value === '' ? element.defaultValue : value);
		}
	}

	if (script.namespace) {
		// 重置特殊的 notes 对象
		proxy.notes = script.configs?.notes?.defaultValue;
	}

	return proxy;
}