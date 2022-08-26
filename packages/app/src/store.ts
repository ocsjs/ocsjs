import { getValidBrowsers } from '@ocsjs/common';
import { UserScripts } from '../types';

export const appStore = {
	name: '',
	version: '',
	'user-data-path': '',
	'exe-path': '',
	'logs-path': '',
	'config-path': '',
	// 文件路径
	workspace: '',
	/** 加载拓展路径 */
	extensionsRoot: '',
	/** 拓展路径 */
	extensionsPaths: [] as string[],
	'auto-launch': false,
	win: {
		/** 窗口置顶 */
		alwaysOnTop: false,
		/** 窗口大小 */
		size: 1
	},
	notify: [] as any[],
	/** 脚本启动设置 */
	script: {
		/** 是否使用 --user-data-dir (false 为无痕浏览) */
		userDataDir: false,
		launchOptions: {
			/** 无头浏览 */
			headless: false,
			/** 浏览器路径 */
			executablePath: ''
		}
	},
	/** 脚本默认设置 */
	setting: {
		answererWrappers: [] as any[]
	},
	/** 用户脚本列表 */
	userScripts: [] as UserScripts[],
	/** 可用浏览器 */
	validBrowsers: getValidBrowsers(),
	/** 状态 */
	state: {
		/** 新手教程 */
		tutorial: true
	}
};
