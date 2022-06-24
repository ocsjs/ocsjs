import cloneDeep from 'lodash/cloneDeep';
import { reactive, watch } from 'vue';
import { remote } from '../utils/remote';

import defaultsDeep from 'lodash/defaultsDeep';
import { AppStore, UserScripts } from '@ocsjs/app';
import { CommonUserScript } from '../types/user.script';
import { NodeJS } from '../utils/export';
import { showFile } from '../components/file/File';
import { File } from '../core/File';
import { config } from '../config';

const Store = require('electron-store') as typeof import('electron-store');
const localStore = new Store();

export type StoreUserScript = { info: CommonUserScript } & Omit<UserScripts, 'info'>;

export type WebStore = {
	/** 当前文件 */
	currentKey: string;
	/** 打开的文件 */
	openedKeys: string[];
	/** 选中的文件 */
	selectedKeys: string[];
	/** 展开的文件 */
	expandedKeys: string[];
	// 类型增强
	userScripts: StoreUserScript[];
	/** 教程步骤 */
	tutorialStep: number;
	/** 当前的主题 */
	theme: {
		key: string;
		name: string;
	};
};

/** 数据存储对象 */
export const store = reactive<AppStore & WebStore>(
	defaultsDeep(localStore.store, {
		extensionPaths: [],
		currentKey: '',
		openedKeys: [],
		selectedKeys: [],
		expandedKeys: [],
		userScripts: [],
		tutorialStep: 0,
		theme: config.themes[0]
	} as WebStore)
);

/** 根目录 */
export const files = reactive<File[]>([]);

/** 打开的文件 */
export const openedFiles = reactive(new Map<string, File>());

/** 监听主题变化 */
watch(
	() => cloneDeep(store.theme),
	(cur, prev) => {
		document.body.classList.remove(prev.key);
		document.body.classList.add(cur.key);
	}
);

watch(openedFiles, () => {
	store.openedKeys = Array.from(openedFiles.keys());
});

watch(store, (newStore) => {
	localStore.store = JSON.parse(JSON.stringify(newStore));
});

watch(() => store['auto-launch'], setAutoLaunch);
watch(() => store.win.size, setZoomFactor);
watch(() => store.win.alwaysOnTop, setAlwaysOnTop);

export function initTheme() {
	document.body.classList.add(store.theme.key);
}

// 下一步教程
export function nextTutorialStep() {
	store.tutorialStep = store.tutorialStep + 1;
	if (store.tutorialStep > 5) {
		store.tutorialStep = 0;
		store.state.tutorial = false;
	}
}

/**
 * 初始化数据
 */
export function initStoreData() {
	files.push(
		File.from(store.workspace, undefined, {
			encoding: 'utf-8',
			topDirectory: true,
			merge(file) {
				const isFile = file.stats.isFile();
				file.isLeaf = isFile;
				file.slots = {
					icon: isFile ? 'file' : 'dir'
				};
				console.log('merge', file);

				return file;
			}
		})
	);

	for (const key of store.openedKeys) {
		const old = openedFiles.get(key);
		if (old === undefined) {
			const file = files.map((f) => f.find(key, true)).find(Boolean);
			if (file && file.stats.isFile()) {
				openedFiles.set(key, file);
			}
		}
	}
}

export function setAutoLaunch() {
	remote.methods.call('autoLaunch');
}

export function setZoomFactor() {
	remote.webContents.call('setZoomFactor', store.win.size);
}

export function setAlwaysOnTop() {
	remote.win.call('setAlwaysOnTop', store.win.alwaysOnTop);
}

export function handleOpenedFile(path: string) {
	const file = files.map((f) => f.find(path, true)).find(Boolean);

	if (file) {
		showFile(file);
	}
}

/**
 * 处理打开的文件
 */
export function initOpenedFiles() {
	for (const path of store.openedKeys) {
		if (NodeJS.fs.existsSync(String(path))) {
			handleOpenedFile(path);
		}
	}
}
