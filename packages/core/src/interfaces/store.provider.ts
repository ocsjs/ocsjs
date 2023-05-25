/* global GM_getValue GM_setValue GM_deleteValue GM_listValues GM_getTab GM_addValueChangeListener GM_saveTab EventListener  */

import { $const } from '../utils/const';

/**
 * 存储器提供类
 *
 * 在油猴环境下 getTab 指的是获取当前标签页的唯一全局对象，如果在普通浏览器环境中， getTab 则为 localStorage 里的一个对象
 */
export interface StoreProvider {
	get(key: string, defaultValue?: any): any;
	set(key: string, value: any): void;
	delete(key: string): any;
	list(): string[];
	/** 在使用 OCS.start 后，每个页面会自动分配一个 uid */
	getTab(key: string): Promise<any>;
	setTab(key: string, value: any): Promise<any>;
	addChangeListener(key: string, listener: (curr: any, pre: any, remote?: boolean) => void): number | void;
	removeChangeListener(listener: number | void | EventListener): void;
	addTabChangeListener(key: string, listener: (curr: any, pre: any) => void): void | Promise<number>;
	removeTabChangeListener(key: string, listener: number | EventListener): void;
}

export type StoreListenerType = number | void | EventListener;

export class LocalStoreChangeEvent extends Event {
	key: string = '';
	value: any;
	previousValue: any;
}

/**
 * 本地存储提供器
 */
export class ObjectStoreProvider implements StoreProvider {
	static _source: { store: object; tab: object } = { store: {}, tab: {} };
	static storeListeners = new Map<string, { (curr: any, pre: any): void }[]>();
	static tabListeners = new Map<string, { (curr: any, pre: any): void }[]>();

	get(key: string, defaultValue?: any) {
		return Reflect.get(ObjectStoreProvider._source.store, key) ?? defaultValue;
	}

	set(key: string, value: any) {
		const pre = Reflect.get(ObjectStoreProvider._source.store, key);
		Reflect.set(ObjectStoreProvider._source.store, key, value);
		ObjectStoreProvider.storeListeners.get(key)?.forEach((lis) => lis(value, pre));
	}

	delete(key: string) {
		Reflect.deleteProperty(ObjectStoreProvider._source.store, key);
	}

	list(): string[] {
		return Object.keys(ObjectStoreProvider._source.store);
	}

	async getTab(key: string) {
		return Reflect.get(ObjectStoreProvider._source.tab, key);
	}

	async setTab(key: string, value: any) {
		Reflect.set(ObjectStoreProvider._source.tab, key, value);
		ObjectStoreProvider.tabListeners.get(key)?.forEach((lis) => lis(value, this.getTab(key)));
	}

	addChangeListener(key: string, listener: (curr: any, pre: any, remote?: boolean | undefined) => void): void {
		const listeners = ObjectStoreProvider.storeListeners.get(key) || [];
		listeners.push(listener);
		ObjectStoreProvider.storeListeners.set(key, listeners);
	}

	removeChangeListener(listener: EventListener): void {
		ObjectStoreProvider.tabListeners.forEach((lis, key) => {
			const index = lis.findIndex((l) => l === listener);
			if (index !== -1) {
				lis.splice(index, 1);
				ObjectStoreProvider.tabListeners.set(key, lis);
			}
		});
	}

	addTabChangeListener(key: string, listener: (curr: any, pre: any) => void) {
		const listeners = ObjectStoreProvider.tabListeners.get(key) || [];
		listeners.push(listener);
		ObjectStoreProvider.tabListeners.set(key, listeners);
	}

	removeTabChangeListener(key: string, listener: EventListener): void {
		const listeners = ObjectStoreProvider.tabListeners.get(key) || [];
		const index = listeners.findIndex((l) => l === listener);
		if (index !== -1) {
			listeners.splice(index, 1);
			ObjectStoreProvider.tabListeners.set(key, listeners);
		}
	}
}

/**
 * 油猴存储器
 */
export class GMStoreProvider implements StoreProvider {
	constructor() {
		// 当页面首次加载时删除之前的监听数据
		if (self === top && typeof globalThis.GM_listValues !== 'undefined') {
			for (const val of GM_listValues()) {
				if (val.startsWith('_tab_change_')) {
					GM_deleteValue(val);
				}
			}
		}
	}

	/** 获取本地能够触发 tab 监听的key */
	getTabChangeHandleKey(tabUid: string, key: string) {
		return `_tab_change_${tabUid}_${key}`;
	}

	get(key: string, defaultValue?: any) {
		return GM_getValue(key, defaultValue);
	}

	set(key: string, value: any) {
		GM_setValue(key, value);
	}

	delete(key: string) {
		GM_deleteValue(key);
	}

	list(): string[] {
		return GM_listValues();
	}

	getTab(key: string) {
		return new Promise((resolve, reject) => {
			GM_getTab((tab = {}) => resolve(Reflect.get(tab, key)));
		});
	}

	setTab(key: string, value: any) {
		return new Promise<void>((resolve, reject) => {
			GM_getTab((tab = {}) => {
				Reflect.set(tab, key, value);
				GM_saveTab(tab);
				this.set(this.getTabChangeHandleKey(Reflect.get(tab, $const.TAB_UID), key), value);
				resolve();
			});
		});
	}

	addChangeListener(key: string, listener: (curr: any, pre: any, remote?: boolean) => void): number {
		return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
			listener(pre, curr, remote);
		});
	}

	removeChangeListener(listenerId: number | void): void {
		if (typeof listenerId === 'number') {
			// eslint-disable-next-line no-undef
			GM_removeValueChangeListener(listenerId);
		}
	}

	async addTabChangeListener(key: string, listener: (curr: any, pre: any) => void) {
		const uid: string = (await this.getTab($const.TAB_UID)) as string;
		return GM_addValueChangeListener(this.getTabChangeHandleKey(uid, key), (_, pre, curr) => {
			listener(curr, pre);
		});
	}

	removeTabChangeListener(key: string, listener: number): void {
		return this.removeChangeListener(listener);
	}
}
