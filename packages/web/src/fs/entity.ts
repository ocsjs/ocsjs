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

	static uuid() {
		return uuid().replace(/-/g, '');
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

function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
