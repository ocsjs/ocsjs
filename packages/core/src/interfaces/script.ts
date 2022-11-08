import { namespaceKey } from '../utils/common';
import { Config } from './config';

export type ScriptConfigsProvider<T extends Record<string, Config>> = T | { (): T };

export interface ScriptOptions<T extends Record<string, Config>> {
	name: string;
	url: (string | RegExp)[];
	namespace?: string;
	notes?: string[];
	configs?: ScriptConfigsProvider<T>;
	/** 不显示脚本页 */
	hideInPanel?: boolean;
}

export class BaseScript {
	/** 在脚本加载时立即运行的钩子 */
	onstart?: (...args: any) => any;
	/** 在页面初始化完成时（元素可被访问）时运行的钩子 */
	onactive?: (...args: any) => any;
	/** 在页面完全加载时运行的钩子 */
	oncomplete?: (...args: any) => any;
	/** 在页面离开时执行的钩子 */
	onbeforeunload?: (...args: any) => any;
}

export interface ScriptEvent {
	[name: string]: any;
}

/**
 * 脚本
 */
export class Script<T extends Record<string, Config> = Record<string, Config>> extends BaseScript {
	/** 名字 */
	name: string;
	/** 匹配路径 */
	url: (string | RegExp)[];
	/** 唯一命名空间，用于避免 config 重名 */
	namespace?: string;
	/** 脚本提示 */
	notes: string[];
	/** 后台脚本（不提供管理页面） */
	hideInPanel?: boolean;
	/** 通过 configs 映射并经过解析后的配置对象 */
	cfg: Record<keyof T, any> = {} as any;
	/** 未经处理的 configs 原对象 */
	private _configs?: ScriptConfigsProvider<T>;
	/** 存储已经处理过的 configs 对象，避免重复调用方法 */
	private _resolvedConfigs?: T;

	get configs() {
		if (!this._resolvedConfigs) {
			this._resolvedConfigs = typeof this._configs === 'function' ? this._configs() : this._configs;
		}
		return this._resolvedConfigs;
	}

	set configs(c) {
		this._configs = c;
	}

	constructor({
		name,
		namespace,
		url,
		notes,
		configs,
		hideInPanel,
		onstart,
		onactive,
		oncomplete
	}: ScriptOptions<T> & {
		onstart?: (this: Script<T>, ...args: any) => any;
		onactive?: (this: Script<T>, ...args: any) => any;
		oncomplete?: (this: Script<T>, ...args: any) => any;
	}) {
		super();
		this.name = name;
		this.namespace = namespace;
		this.url = url;
		this.notes = notes || [];
		this._configs = configs;
		this.hideInPanel = hideInPanel;
		this.onstart = onstart as any;
		this.onactive = onactive as any;
		this.oncomplete = oncomplete as any;
	}

	onConfigChange(key: keyof T, handler: (pre: any, curr: any, remote: boolean) => any) {
		// eslint-disable-next-line no-undef
		GM_addValueChangeListener(namespaceKey(this.namespace, key.toString()), (_, pre, curr, remote) => {
			handler(pre, curr, remote);
		});
	}
}
