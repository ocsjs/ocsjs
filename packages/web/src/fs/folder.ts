import { Browser } from './browser';
import { router } from '../route';
import { store } from '../store';
import { resetSearch } from '../utils/entity';
import { Entity } from './entity';
import { FolderOptions, BrowserType, EntityTypes, FolderType, EntityOptions } from './interface';
import { reactive, watch } from 'vue';

export class Folder<T extends FolderType = FolderType> extends Entity implements FolderOptions<T, Browser | Folder> {
	type: T;
	parent: T extends 'root' ? undefined : string;
	children: Record<string, Browser | Folder> = {};

	constructor(opts: FolderOptions<T, Browser | Folder> & EntityOptions) {
		super(opts);
		this.type = opts.type;
		this.parent = opts.parent;
		this.children = opts.children;

		for (const key in this.children) {
			if (Object.prototype.hasOwnProperty.call(this.children, key)) {
				const child = this.children[key];
				if (child.type === 'browser') {
					this.children[key] = new Browser(child);
				} else {
					this.children[key] = new Folder(child);
				}
			}
		}
	}

	/**
	 *	获取文件夹
	 */
	static from(uid: string) {
		return uid === root().uid ? root() : root().find('folder', uid);
	}

	/** 递归查找 */
	find<T extends BrowserType | FolderType>(type: T, uid: string): T extends BrowserType ? Browser : Folder {
		let target = this.children[uid];
		if (target && target.type === type) {
			return target as any;
		} else {
			for (const key in this.children) {
				if (Object.prototype.hasOwnProperty.call(this.children, key)) {
					const child = this.children[key];
					if (child.type === 'folder') {
						const res = child.find(type, uid);
						target = target || res;
					}
				}
			}
		}

		return target as any;
	}

	findAll<T extends EntityTypes, E = T extends BrowserType ? Browser : Folder>(handler: (entity: E) => boolean): E[] {
		const list: E[] = [];

		for (const key in this.children) {
			if (Object.prototype.hasOwnProperty.call(this.children, key)) {
				const child = this.children[key];
				if (handler(child as any)) {
					list.push(child as any);
				}
				if (child.type === 'folder') {
					list.push(...child.findAll(handler));
				}
			}
		}

		return list;
	}

	/** 返回当前以及所以父文件夹 */
	flatParents(): Folder[] {
		let parents;
		if (this.parent) {
			const parent = Folder.from(this.parent);
			if (parent) {
				parents = parent.flatParents();
			}
		}
		return [...(parents || []), this];
	}

	location(): void {
		// 进入列表页
		router.push('/');
		// 关闭搜索模式
		resetSearch();
		// 设置当前文件夹
		store.render.browser.currentFolderUid = this.uid;
	}

	select(): void {
		store.render.browser.currentFolderUid = this.uid;
	}

	remove(): void {
		if (this.parent) {
			const parent = Folder.from(this.parent);

			if (parent) {
				Reflect.deleteProperty(parent.children, this.uid);
			}
		}
	}

	rename(name: string): void {
		this.name = name;
		this.renaming = false;
	}
}

let _root: Folder | undefined;

/** 根目录 */
export const root = () => {
	if (_root) {
		return _root;
	} else {
		return (_root = reactive(new Folder(store.render.browser.root)));
	}
};

/** 实时存储文件树 */
watch(
	() => _root,
	() => {
		store.render.browser.root = JSON.parse(JSON.stringify(root));
	}
);
