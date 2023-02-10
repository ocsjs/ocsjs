/* global GM_getValue GM_setValue GM_deleteValue GM_listValues GM_getTab GM_addValueChangeListener GM_saveTab EventListener  */

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
	getTab(key: string): any;
	setTab(key: string, value: any): any;
	addChangeListener(key: string, listener: (curr: any, pre: any, remote?: boolean) => void): number | void;
	removeChangeListener(listener: number | EventListener): void;
	addTabChangeListener(key: string, listener: (curr: any, pre: any) => void): void;
	removeTabChangeListener(key: string, listener: number | EventListener): void;
}

export class LocalStoreChangeEvent extends Event {
	key: string = '';
	value: any;
	previousValue: any;
}

/**
 * 本地存储提供器
 */
export class LocalStoreProvider implements StoreProvider {
	static STORE_KEY = '__ocs_store__';
	static TAB_KEY = '__ocs_tab__';
	static storeListeners = new Map<string, { (curr: any, pre: any): void }[]>();
	static tabListeners = new Map<string, { (curr: any, pre: any): void }[]>();

	store() {
		return JSON.parse(localStorage.getItem(LocalStoreProvider.STORE_KEY) ?? '{}');
	}

	tab() {
		return JSON.parse(localStorage.getItem(LocalStoreProvider.TAB_KEY) ?? '{}');
	}

	_setStore(val: any) {
		localStorage.setItem('__ocs_store__', JSON.stringify(val));
	}

	_setTab(val: any) {
		localStorage.setItem('__ocs_tab__', JSON.stringify(val));
	}

	get(key: string, defaultValue?: any) {
		return Reflect.get(this.store(), key) ?? defaultValue;
	}

	set(key: string, value: any) {
		const store = this.store();
		const pre = this.get(key);
		Reflect.set(store, key, value);
		this._setStore(store);
		LocalStoreProvider.storeListeners.get(key)?.forEach((lis) => lis(value, pre));
	}

	delete(key: string) {
		const store = this.store();
		Reflect.deleteProperty(store, key);
		this._setStore(store);
	}

	list(): string[] {
		return Object.keys(this.store());
	}

	getTab(key: string) {
		return Reflect.get(this.tab(), key);
	}

	setTab(key: string, value: any) {
		const tab = this.tab();
		LocalStoreProvider.tabListeners.get(key)?.forEach((lis) => lis(value, this.getTab(key)));
		Reflect.set(tab, key, value);
		this._setTab(tab);
	}

	addChangeListener(key: string, listener: (curr: any, pre: any, remote?: boolean | undefined) => void): void {
		const listeners = LocalStoreProvider.storeListeners.get(key) || [];
		listeners.push(listener);
		LocalStoreProvider.storeListeners.set(key, listeners);
	}

	removeChangeListener(listener: EventListener): void {
		LocalStoreProvider.tabListeners.forEach((lis, key) => {
			const index = lis.findIndex((l) => l === listener);
			if (index !== -1) {
				lis.splice(index, 1);
				LocalStoreProvider.tabListeners.set(key, lis);
			}
		});
	}

	addTabChangeListener(key: string, listener: (curr: any, pre: any) => void) {
		const listeners = LocalStoreProvider.tabListeners.get(key) || [];
		listeners.push(listener);
		LocalStoreProvider.tabListeners.set(key, listeners);
	}

	removeTabChangeListener(key: string, listener: EventListener): void {
		const listeners = LocalStoreProvider.tabListeners.get(key) || [];
		const index = listeners.findIndex((l) => l === listener);
		if (index !== -1) {
			listeners.splice(index, 1);
			LocalStoreProvider.tabListeners.set(key, listeners);
		}
	}
}

/**
 * 对象存储提供器
 */
export class ObjectStoreProvider extends LocalStoreProvider {
	private _source = {
		store: {},
		tab: {}
	};

	constructor(store: object) {
		super();
		this._source.store = store;
	}

	override store() {
		return this._source.store;
	}

	override tab() {
		return this._source.tab;
	}

	override _setStore(val: any) {
		this._source.store = val;
	}

	override _setTab(val: any) {
		this._source.tab = val;
	}
}

/**
 * 油猴存储器
 */
export class GMStoreProvider implements StoreProvider {
	static tabListeners = new Map<string, { (curr: any, pre: any): void }[]>();

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
			GM_getTab((tab) => resolve(Reflect.get(tab, key)));
		});
	}

	setTab(key: string, value: string) {
		return new Promise<void>((resolve, reject) => {
			GM_getTab((tab) => {
				const pre = Reflect.get(tab, key);
				Reflect.set(tab, key, value);

				GMStoreProvider.tabListeners.get(key)?.forEach((lis) => lis(value, pre));

				GM_saveTab(tab);
				resolve();
			});
		});
	}

	addChangeListener(key: string, listener: (curr: any, pre: any, remote?: boolean) => void): number {
		return GM_addValueChangeListener(key, (_, pre, curr, remote) => {
			listener(pre, curr, remote);
		});
	}

	removeChangeListener(listenerId: number): void {
		// eslint-disable-next-line no-undef
		GM_removeValueChangeListener(listenerId);
	}

	addTabChangeListener(key: string, listener: (curr: any, pre: any) => void) {
		const listeners = GMStoreProvider.tabListeners.get(key) || [];
		listeners.push(listener);
		GMStoreProvider.tabListeners.set(key, listeners);
	}

	removeTabChangeListener(key: string, listener: EventListener): void {
		const listeners = GMStoreProvider.tabListeners.get(key) || [];
		const index = listeners.findIndex((l) => l === listener);
		if (index !== -1) {
			listeners.splice(index, 1);
			GMStoreProvider.tabListeners.set(key, listeners);
		}
	}
}
