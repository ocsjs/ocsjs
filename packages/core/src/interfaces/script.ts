import { Config } from './config';

export interface IScriptContext<T> {
	cfg: Record<keyof T, any>;
}

export interface IScript<T> {
	name: string;
	namespace: string;
	url: (string | RegExp)[];
	notes?: string[];
	configs?: T;
	/** 启动脚本 */
	start(opts: IScriptContext<T>): any;
	/** 暂停脚本 */
	stop(opts: IScriptContext<T>): any;
}

export class Script<T extends Record<string, Config> = Record<string, Config>> implements IScript<T> {
	name: string;
	namespace: string;
	url: (string | RegExp)[];
	start: (opts: IScriptContext<T>) => any;
	stop: (opts: IScriptContext<T>) => any;
	notes?: string[];
	configs?: T;
	cfg: Record<keyof T, any> = {} as any;

	constructor({ name, namespace, url, start, stop, notes, configs }: IScript<T>) {
		this.name = name;
		this.namespace = namespace;
		this.url = url;
		this.start = start;
		this.stop = stop;
		this.notes = notes;
		this.configs = configs;
	}
}
