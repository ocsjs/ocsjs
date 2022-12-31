import { HeaderElement } from '../elements/header';
import { ScriptPanelElement } from '../elements/script.panel';
import { namespaceKey } from '../utils/common';
import { addConfigChangeListener, getValue, removeConfigChangeListener, setValue } from '../utils/tampermonkey';
import { Config } from './config';

export type ScriptConfigsProvider<T extends Record<string, Config>> = T | { (): T };

export interface ScriptOptions<T extends Record<string, Config>> {
	name: string;
	url: (string | RegExp)[];
	level?: number;
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
	/** 在渲染的时候执行的钩子，（面板之间切换时会重复渲染） */
	onrender?: (elements: { panel: ScriptPanelElement; header: HeaderElement }) => any;
}

export type ScriptConfigs = {
	/** 脚本提示 */
	readonly notes?: {
		defaultValue: string;
	};
} & Record<string, Config>;

/**
 * 脚本
 */
export class Script<T extends ScriptConfigs = ScriptConfigs> extends BaseScript {
	/** 未经处理的 configs 原对象 */
	private _configs?: ScriptConfigsProvider<T>;
	/** 存储已经处理过的 configs 对象，避免重复调用方法 */
	private _resolvedConfigs?: T;

	/** 名字 */
	name: string;
	/** 工程名，如果是独立脚本则为空 */
	projectName?: string;
	/** 匹配路径 */
	url: (string | RegExp)[];
	/** 唯一命名空间，用于避免 config 重名 */
	namespace?: string;
	/** 后台脚本（不提供管理页面） */
	hideInPanel?: boolean;
	level?: number;
	/** 通过 configs 映射并经过解析后的配置对象 */
	cfg: { [K in keyof T]: T[K]['defaultValue'] } & { notes?: string } = {} as any;
	/** 经过初始化页面脚本注入的页面元素，如果初始化脚本未运行，则此元素为空 */
	panel?: ScriptPanelElement;
	/** 操作面板头部元素 */
	header?: HeaderElement;
	/** 监听器，存储每个 key 的监听器，number 是监听器的 id */
	listeners: Map<string, number> = new Map();

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
		oncomplete,
		onbeforeunload,
		onrender
	}: ScriptOptions<T> & {
		onstart?: (this: Script<T>, ...args: any) => any;
		onactive?: (this: Script<T>, ...args: any) => any;
		oncomplete?: (this: Script<T>, ...args: any) => any;
		onbeforeunload?: (this: Script<T>, ...args: any) => any;
		onrender?: (this: Script<T>, elements: { panel: ScriptPanelElement; header: HeaderElement }) => any;
	}) {
		super();
		this.name = name;
		this.namespace = namespace;
		this.url = url;
		this._configs = configs;
		this.hideInPanel = hideInPanel;
		this.onstart = onstart;
		this.onactive = onactive;
		this.oncomplete = oncomplete;
		this.onbeforeunload = onbeforeunload;
		this.onrender = onrender;

		/**
		 * 以下是在每个脚本加载之后，统计每个脚本当前所运行的页面链接，链接不会重复
		 * 初始化页面的脚本可以根据此链接列表，进行脚本页面的生成
		 */

		const _onstart = this.onstart;
		this.onstart = (...args: any) => {
			_onstart?.call(this, ...args);
			const urls: string[] = Array.from(getValue('_urls_', []));
			const urlHasInRecord = urls.find((u) => u === location.href);
			if (!urlHasInRecord) {
				setValue('_urls_', urls.concat(location.href));
			}
		};

		const _onbeforeunload = this.onbeforeunload;
		this.onbeforeunload = (...args: any) => {
			_onbeforeunload?.call(this, ...args);
			const urls: string[] = Array.from(getValue('_urls_', []));
			const urlIndex = urls.findIndex((u) => u === location.href);
			if (urlIndex !== -1) {
				setValue('_urls_', urls.splice(urlIndex, 1));
			}
		};
	}

	onConfigChange<K extends keyof T>(
		key: K,
		handler: (curr: T[K]['defaultValue'], pre: T[K]['defaultValue'], remote: boolean) => any
	) {
		const _key = namespaceKey(this.namespace, key.toString());
		const id = this.listeners.get(_key);
		if (id) {
			removeConfigChangeListener(id);
		}

		this.listeners.set(
			_key,
			addConfigChangeListener(_key, (pre, curr, remote) => {
				handler(curr, pre, remote);
			})
		);
	}

	offConfigChange(key: keyof T) {
		const _key = namespaceKey(this.namespace, key.toString());
		const id = this.listeners.get(_key);
		if (id) {
			removeConfigChangeListener(id);
		}
		this.listeners.delete(_key);
	}
}
