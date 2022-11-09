import { HeaderElement } from '../elements/header';
import { ScriptPanelElement } from '../elements/script.panel';
import { getValue, namespaceKey, setValue } from '../utils/common';
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
	/** 名字 */
	name: string;
	/** 匹配路径 */
	url: (string | RegExp)[];
	/** 唯一命名空间，用于避免 config 重名 */
	namespace?: string;
	/** 后台脚本（不提供管理页面） */
	hideInPanel?: boolean;
	/** 通过 configs 映射并经过解析后的配置对象 */
	cfg: Record<keyof T, any> & { notes?: string } = {} as any;
	/** 经过初始化页面脚本注入的页面元素，如果初始化脚本未运行，则此元素为空 */
	panel?: ScriptPanelElement;
	header?: HeaderElement;
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
		oncomplete,
		onbeforeunload
	}: ScriptOptions<T> & {
		onstart?: (this: Script<T>, ...args: any) => any;
		onactive?: (this: Script<T>, ...args: any) => any;
		oncomplete?: (this: Script<T>, ...args: any) => any;
		onbeforeunload?: (this: Script<T>, ...args: any) => any;
	}) {
		super();
		this.name = name;
		this.namespace = namespace;
		this.url = url;
		this._configs = configs;
		this.hideInPanel = hideInPanel;
		this.onstart = onstart as any;
		this.onactive = onactive as any;
		this.oncomplete = oncomplete as any;
		this.onbeforeunload = onbeforeunload as any;

		const _onstart = this.onstart;
		this.onstart = (...args: any) => {
			_onstart?.call(this, ...args);
			const urls: string[] = Array.from(getValue('_urls_'));
			const urlHasInRecord = urls.find((u) => u === location.href);
			if (!urlHasInRecord) {
				setValue('_urls_', urls.concat(location.href));
			}
		};

		const _onbeforeunload = this.onbeforeunload;
		this.onbeforeunload = (...args: any) => {
			_onbeforeunload?.call(this, ...args);
			const urls: string[] = Array.from(getValue('_urls_'));
			const urlIndex = urls.findIndex((u) => u === location.href);
			if (urlIndex !== -1) {
				setValue('_urls_', urls.splice(urlIndex, 1));
			}
		};
	}

	onConfigChange(key: keyof T, handler: (pre: any, curr: any, remote: boolean) => any) {
		// eslint-disable-next-line no-undef
		GM_addValueChangeListener(namespaceKey(this.namespace, key.toString()), (_, pre, curr, remote) => {
			handler(pre, curr, remote);
		});
	}
}
