import cloneDeep from 'lodash/cloneDeep';
import { reactive, watch } from 'vue';
import { remote } from '../utils/remote';

import defaultsDeep from 'lodash/defaultsDeep';
import { AppStore, UserScripts } from '@ocsjs/app';
import { CommonUserScript } from '../types/user.script';
import { config } from '../config';
import { Browser, BrowserFolder, Tag } from '../types/browser';

const Store = require('electron-store') as typeof import('electron-store');
const localStore = new Store();

export type StoreUserScript = { info?: CommonUserScript } & Omit<UserScripts, 'info'>;

export type WebStore = {
	scripts: StoreUserScript[];
	notifies: any[];
	browser: {
		currentFolderUid: string;
		currentBrowserUid: string;
		list: Browser[];
		folders: BrowserFolder[];
		tags: Record<string, { color: string; count: number }>;
	};
	setting: {
		/** 浏览器启动参数 */
		launchOptions: {
			executablePath: string;
		};
		/** 窗口设置 */
		window: {
			zoom: number;
			alwaysOnTop: boolean;
			autoLaunch: boolean;
		};

		/** 当前的主题 */
		theme: {
			key: string;
			name: string;
		};
	};
};

/** 数据存储对象 */
export const store = reactive<AppStore & WebStore>(
	defaultsDeep(localStore.store, {
		scripts: [],
		notifies: [],
		browser: {
			currentFolderUid: '',
			currentBrowserUid: '',
			list: [],
			folders: [],
			tags: {}
		},
		setting: {
			launchOptions: {
				executablePath: ''
			},
			theme: config.themes[0],
			window: {
				zoom: 1,
				alwaysOnTop: false,
				autoLaunch: false
			}
		}
	} as WebStore)
);

/** 根目录 */
export const files = reactive<File[]>([]);

/** 打开的文件 */
export const openedFiles = reactive(new Map<string, File>());

/** 监听主题变化 */
watch(
	() => cloneDeep(store.setting.theme),
	(cur, prev) => {
		document.body.classList.remove(prev.key);
		document.body.classList.add(cur.key);
	}
);

watch(
	store,
	(newStore) => {
		localStore.store = JSON.parse(JSON.stringify(newStore));
	},
	{ deep: true }
);

watch(() => store.setting.window.autoLaunch, setAutoLaunch);
watch(() => store.setting.window.zoom, setZoomFactor);
watch(() => store.setting.window.alwaysOnTop, setAlwaysOnTop);

export function initTheme() {
	document.body.classList.add(store.setting.theme.key);
}

export function setAutoLaunch() {
	remote.methods.call('autoLaunch');
}

export function setZoomFactor() {
	remote.webContents.call('setZoomFactor', store.setting.window.zoom);
}

export function setAlwaysOnTop() {
	remote.win.call('setAlwaysOnTop', store.setting.window.alwaysOnTop);
}
