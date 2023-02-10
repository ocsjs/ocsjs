import { inBrowser } from '../utils/node';
import { remote } from '../utils/remote';
import { EntityOptions, EntityTypes } from './interface';

export abstract class Entity implements EntityOptions {
	/** 原响应式对象 */
	abstract type: EntityTypes;
	uid: string;
	name: string;
	createTime: number;
	renaming: boolean;

	constructor(opts: EntityOptions) {
		this.uid = opts.uid;
		this.name = opts.name;
		this.createTime = opts.createTime;
		this.renaming = opts.renaming;
	}

	static async uuid() {
		return (
			inBrowser ? Date.now().toFixed(0) + (Math.random() * 1000).toFixed(0) : await remote.crypto.call('randomUUID')
		).replace(/-/g, '');
	}

	/** 定位 */
	abstract location(...args: any[]): void;
	/** 重命名 */
	abstract rename(...args: any[]): void;
	/** 删除 */
	abstract remove(...args: any[]): void;
	/** 选择 */
	abstract select(...args: any[]): void;
}
