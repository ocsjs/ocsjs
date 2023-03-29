// @ts-check

import { app } from 'electron';
import { existsSync, mkdirSync } from 'fs';
import { appStore, store } from '../store';
import { valid, coerce, clean, gt, SemVer } from 'semver';
import defaultsDeep from 'lodash/defaultsDeep';
import { Logger } from '../logger';

const logger = Logger('store-init');

/**
 * 初始化配置
 */
export function initStore() {
	const version = store.store.version;
	logger.log('version', version);

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
		const render = store.store.render ? JSON.parse(JSON.stringify(store.store.render)) : {};
		appStore.render = render;
		// 初始化设置
		store.store = appStore;

		logger.log('store', store.store);
	}

	// 强制更新路径
	store.set('paths', appStore.paths);

	if (!existsSync(store.store.paths.userDataDirsFolder)) {
		mkdirSync(store.store.paths.userDataDirsFolder, { recursive: true });
	}
	if (!existsSync(store.store.paths.extensionsFolder)) {
		mkdirSync(store.store.paths.extensionsFolder, { recursive: true });
	}
	if (!existsSync(store.store.paths.downloadFolder)) {
		mkdirSync(store.store.paths.downloadFolder, { recursive: true });
	}
}

/** 字符串转换成版本对象 */
function parseVersion(version: string) {
	return new SemVer(valid(coerce(clean(version, { loose: true }))) || '0.0.0');
}
