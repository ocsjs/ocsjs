import cloneDeep from 'lodash/cloneDeep';
import { reactive, watch } from 'vue';
import { remote } from '../utils/remote';
import defaultsDeep from 'lodash/defaultsDeep';
import { AppStore, UserScripts } from '@ocsjs/app';
import { CommonUserScript } from '../types/user.script';
import { FolderOptions } from '../fs/interface';
import { Browser } from '../fs/browser';
import { Folder } from '../fs/folder';
import { inBrowser } from '../utils/node';

export type StoreUserScript = { info?: CommonUserScript } & Omit<UserScripts, 'info'>;

export type WebStore = {
	scripts: StoreUserScript[];
	notifies: any[];

	browser: {
		currentFolderUid: string;
		currentBrowserUid: string;
		/** 根目录 */
		root: FolderOptions<'root', Browser | Folder>;
		tags: Record<string, { color: string; count: number }>;
		search: {
			/** 名字或者备注搜素 */
			value: string;
			tags: string[];
		};
	};
	dashboard: {
		/** 显示标签和备注 */
		details: {
			tags: boolean;
			notes: boolean;
		};
		/** 列数控制 */
		num: number;
		/** 视频设置 */
		video: {
			/** 横纵比 */
			aspectRatio?: number;
		};
	};
	setting: {
		browserType: 'diy' | 'local' | 'setup';
		/** 浏览器启动参数 */
		launchOptions: {
			executablePath: string;
		};
		/** 窗口设置 */
		window: {
			alwaysOnTop: boolean;
			autoLaunch: boolean;
		};

		/** 当前的主题 */
		theme: {
			dark: boolean;
		};
		/** ocs 特殊配置 */
		ocs: {
			/** 全局配置 */
			store: any;
		};
	};
	state: {
		/** 是否第一次打开 */
		first: boolean;
		/** 是否展示一键安装  */
		setup: boolean;
		mini: boolean;
		responsive: 'mini' | 'small';
	};
};

/** 数据存储对象 */
export const store = reactive<AppStore & { render: WebStore }>(
	defaultsDeep(
		inBrowser ? JSON.parse(localStorage.getItem('ocs-app-store') || '{}') : remote['electron-store'].get('store'),
		{
			render: {
				scripts: [],
				notifies: [],

				browser: {
					currentFolderUid: '',
					currentBrowserUid: '',
					root: {
						name: '根目录',
						parent: undefined,
						createTime: Date.now(),
						type: 'root',
						uid: 'root-folder',
						children: {},
						renaming: false
					},
					tags: {},
					search: {
						value: '',
						tags: [],
						results: undefined
					}
				},
				dashboard: {
					details: {
						tags: false,
						notes: false
					},
					num: 4,
					video: {
						aspectRatio: 0
					}
				},
				setting: {
					browserType: 'diy',
					launchOptions: {
						executablePath: ''
					},
					theme: {
						dark: false
					},
					window: {
						alwaysOnTop: false,
						autoLaunch: false
					},
					ocs: {
						store: {}
					}
				},
				state: {
					first: true,
					setup: true,
					mini: false,
					responsive: 'small'
				}
			} as WebStore
		}
	)
);

/** 根目录 */
export const files = reactive<File[]>([]);

/** 打开的文件 */
export const openedFiles = reactive(new Map<string, File>());

/** 监听主题变化 */
watch(
	() => cloneDeep(store.render.setting.theme),
	(cur, prev) => {
		if (cur.dark) {
			// 设置为暗黑主题
			document.body.setAttribute('arco-theme', 'dark');
		} else {
			// 恢复亮色主题
			document.body.removeAttribute('arco-theme');
		}
	}
);

watch(
	store,
	(newStore) => {
		if (inBrowser) {
			localStorage.setItem('ocs-app-store', JSON.stringify(newStore));
		} else {
			remote['electron-store'].set('store', JSON.parse(JSON.stringify(newStore)));
		}
	},
	{ deep: true }
);

watch(() => store.render.setting.window.autoLaunch, setAutoLaunch);
watch(() => store.render.setting.window.alwaysOnTop, setAlwaysOnTop);

export function initTheme() {
	if (store.render.setting.theme.dark) {
		// 设置为暗黑主题
		document.body.setAttribute('arco-theme', 'dark');
	} else {
		// 恢复亮色主题
		document.body.removeAttribute('arco-theme');
	}
}

export function setAutoLaunch() {
	remote.methods.call('autoLaunch');
}

export function setAlwaysOnTop() {
	remote.win.call('setAlwaysOnTop', store.render.setting.window.alwaysOnTop);
}
