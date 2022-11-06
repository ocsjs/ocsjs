import { namespaceKey } from '../utils/common';
import { Config } from './config';

export type ScriptConfigsProvider<T extends Record<string, Config>> = T | { (): T };

export interface ScriptOptions<T extends Record<string, Config>> {
	name: string;
	url: (string | RegExp)[];
	namespace?: string;
	notes?: string[];
	configs?: ScriptConfigsProvider<T>;
	/** 关闭响应式配置 */
	disableConfigProxy?: boolean;
	/** 不显示脚本页 */
	hideInPanel?: boolean;
}

export class Script<T extends Record<string, Config> = Record<string, Config>> {
	name: string;
	url: (string | RegExp)[];
	namespace?: string;
	notes?: string[];
	disableConfigProxy?: boolean;
	hideInPanel?: boolean;
	cfg: Record<keyof T, any> = {} as any;
	private _configs?: ScriptConfigsProvider<T>;
	private _resolvedConfigs?: T;
	onstart?: (...args: any) => any;
	onactive?: (...args: any) => any;
	oncomplete?: (...args: any) => any;

	get configs() {
		if (!this._resolvedConfigs) {
			this._resolvedConfigs = typeof this._configs === 'function' ? this._configs() : this._configs;
		}
		return this._resolvedConfigs;
	}

	constructor({
		name,
		namespace,
		url,
		notes,
		configs,
		disableConfigProxy,
		hideInPanel,
		onstart,
		onactive,
		oncomplete
	}: ScriptOptions<T> & {
		onstart?: (this: Script<T>, ...args: any) => any;
		onactive?: (this: Script<T>, ...args: any) => any;
		oncomplete?: (this: Script<T>, ...args: any) => any;
	}) {
		this.name = name;
		this.namespace = namespace;
		this.url = url;
		this.notes = notes;
		this._configs = configs;
		this.disableConfigProxy = disableConfigProxy;
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
