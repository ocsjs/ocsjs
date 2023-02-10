import debounce from 'lodash/debounce';
import { Config } from '../interfaces/config';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { SimplifyWorkResult, WorkResult } from '../core/worker/interface';
import { $string } from './string';
import { $store } from './store';

/**
 * 公共的工具库
 */
export const $ = {
	/**
	 * 构造 config 配置对象， 可进行响应式存储
	 * @param script 脚本
	 */
	createConfigProxy(script: Script) {
		const proxy = new Proxy(script.cfg, {
			set(target, propertyKey, value) {
				const key = $.namespaceKey(script.namespace, propertyKey);
				$store.set(key, value);
				return Reflect.set(target, propertyKey, value);
			},
			get(target, propertyKey) {
				const value = $store.get($.namespaceKey(script.namespace, propertyKey));
				Reflect.set(target, propertyKey, value);
				return value;
			}
		});

		// 为 proxy 创建属性，并设置默认值
		for (const key in script.configs) {
			if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
				const element = Reflect.get(script.configs, key);
				Reflect.set(proxy, key, $store.get($.namespaceKey(script.namespace, key), element.defaultValue));
			}
		}

		if (script.namespace) {
			// 重置特殊的 notes 对象
			proxy.notes = script.configs?.notes?.defaultValue;
		}

		return proxy;
	},

	/**
	 * 获取所有原生（未处理的）脚本配置
	 * @param scripts 脚本列表
	 */
	getAllRawConfigs(scripts: Script[]): Record<string, Config> {
		const object = {};
		for (const script of scripts) {
			for (const key in script.configs) {
				if (Object.prototype.hasOwnProperty.call(script.configs, key)) {
					const { label, ...element } = script.configs[key];
					Reflect.set(object, $.namespaceKey(script.namespace, key), {
						label: $.namespaceKey(script.namespace, key),
						...element
					} as Config);
				}
			}
		}
		return object;
	},

	/**
	 * 获取匹配到的脚本
	 * @param projects 程序列表
	 */
	getMatchedScripts(projects: Project[], urls: string[]) {
		const scripts = [];

		for (const project of projects) {
			for (const key in project.scripts) {
				if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
					const script = project.scripts[key];
					// 被排除的网页
					if (script.excludes?.some((u) => urls.some((url) => RegExp(u[1]).test(url)))) {
						continue;
					}

					if (script.url.some((u) => urls.some((url) => RegExp(u[1]).test(url)))) {
						scripts.push(script);
					}
				}
			}
		}
		return scripts;
	},

	/**
	 * 获取具名键
	 * @param namespace 命名空间
	 * @param key 键
	 */
	namespaceKey(namespace: string | undefined, key: any) {
		return namespace ? namespace + '.' + key.toString() : key.toString();
	},

	/** 创建唯一id ， 不带横杠 */
	uuid() {
		return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	},

	/**
	 * 生成随机数， 使用 Math.round 取整
	 * @param min 最小值
	 * @param max 最大值
	 */
	random(min: number, max: number) {
		return Math.round(Math.random() * (max - min)) + min;
	},

	/**
	 * 暂停
	 * @param period 毫秒
	 */
	async sleep(period: number): Promise<void> {
		return new Promise((resolve) => {
			setTimeout(resolve, period);
		});
	},

	/**
	 * 当前是否处于浏览器环境
	 */
	isInBrowser(): boolean {
		return typeof window !== 'undefined' && typeof window.document !== 'undefined';
	},

	/**
	 * 使元素变成纯文本对象，（跨域时对象上下文会被销毁）
	 * @param el 元素
	 */
	elementToRawObject(el: HTMLElement | undefined | null) {
		return {
			innerText: el?.innerText,
			innerHTML: el?.innerHTML,
			textContent: el?.textContent
		} as any;
	},
	/**
	 * 监听页面宽度变化
	 */
	onresize<E extends HTMLElement>(el: E, handler: (el: E) => void) {
		const resize = debounce(() => {
			if (el.parentElement === null) {
				window.removeEventListener('reset', resize);
			} else {
				handler(el);
			}
		}, 200);
		resize();
		window.addEventListener('resize', resize);
	},
	/** 将 {@link WorkResult} 转换成 {@link SimplifyWorkResult} */
	simplifyWorkResult(results: WorkResult<any>[]): SimplifyWorkResult[] {
		const res: SimplifyWorkResult[] = [];

		for (const wr of results) {
			res.push({
				requesting: wr.requesting,
				resolving: wr.resolving,
				error: wr.error,
				question: (
					wr.ctx?.elements.title
						?.map((t) => t?.innerText || '')
						.filter(Boolean)
						.join(',') || '无'
				)
					/** cx新版题目冗余 */
					.replace(/\d+\.\s*\((.+题|名词解释|完形填空|阅读理解), .+分\)/, '')
					/** cx旧版题目冗余 */
					.replace(/[[|(|【|（]..题[\]|)|】|）]/, ''),
				finish: wr.result?.finish,
				searchResults:
					wr.ctx?.searchResults.map((sr) => ({
						error: sr.error?.message,
						name: sr.name,
						homepage: sr.homepage,
						results: sr.answers.map((ans) => [ans.question, ans.answer])
					})) || []
			});
		}

		return res;
	},
	/** 加载自定义元素 */
	loadCustomElements(elements: { new (): HTMLElement }[]) {
		for (const element of elements) {
			const name = $string.humpToTarget(element.name, '-');
			// 不能重复加载
			if (customElements.get(name) === undefined) {
				customElements.define(name, element);
			}
		}
	}
};
