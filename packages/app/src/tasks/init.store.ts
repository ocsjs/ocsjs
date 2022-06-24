// @ts-check

import { app } from 'electron';
import Store from 'electron-store';
import { existsSync, mkdirSync } from 'fs';
import { appStore } from '../store';
import { valid, coerce, clean, gt, SemVer } from 'semver';
import defaultsDeep from 'lodash/defaultsDeep';

/**
 * 初始化配置
 */
export function initStore() {
	const store = new Store<typeof appStore>();

	const version = store.get('version');

	// 是否需要初始化
	if (typeof version === 'string') {
		// 当前app版本
		const appVersion = parseVersion(app.getVersion());
		// 本地存储的app版本
		const originVersion = parseVersion(version);
		// 是否需要更新设置
		if (gt(appVersion, originVersion)) {
			store.store = defaultsDeep(store.store, appStore);
		}
	} else {
		// 初始化设置
		store.store = appStore;
	}

	// 初始化可能不存在的目录
	if (!existsSync(store.store.workspace)) {
		mkdirSync(store.store.workspace, { recursive: true });
	}
	if (!existsSync(store.store.extensionsRoot)) {
		mkdirSync(store.store.extensionsRoot, { recursive: true });
	}
}

/** 字符串转换成版本对象 */
function parseVersion(version: string) {
	return new SemVer(valid(coerce(clean(version, { loose: true }))) || '0.0.0');
}
