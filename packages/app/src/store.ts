import { app } from 'electron';
import path from 'path';
import { getValidBrowsers } from '@ocsjs/common';

export const appStore = {
	name: app.getName(),
	version: app.getVersion(),
	'user-data-path': app.getPath('userData'),
	'exe-path': app.getPath('exe'),
	'logs-path': app.getPath('logs'),
	'config-path': path.resolve(app.getPath('userData'), './config.json'),
	/** 加载拓展路径 */
	extensionsPath: path.resolve(app.getPath('userData'), './extensions'),
	/** 可用浏览器 */
	validBrowsers: getValidBrowsers(),
	/** 浏览器用户数据文件夹 */
	userDataDirsFolder: path.resolve(app.getPath('exe'), '../userDataDirs')
};
