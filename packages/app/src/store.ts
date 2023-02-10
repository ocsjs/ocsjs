import { app } from 'electron';
import path from 'path';

export const appStore = {
	name: app.getName(),
	version: app.getVersion(),
	/** 路径数据 */
	paths: {
		'app-path': app.getAppPath(),
		'user-data-path': app.getPath('userData'),
		'exe-path': app.getPath('exe'),
		'logs-path': app.getPath('logs'),
		'config-path': path.resolve(app.getPath('userData'), './config.json'),
		/** 加载拓展路径 */
		extensionsFolder: path.resolve(app.getPath('exe'), '../extensions'),
		/** 浏览器用户数据文件夹 */
		userDataDirsFolder: path.resolve(app.getPath('exe'), '../userDataDirs'),
		/** 浏览器下载文件夹 */
		downloadFolder: path.resolve(app.getPath('exe'), '../downloads')
	},
	/** 本地服务器数据 */
	server: {
		port: 15319
	},
	/** 渲染进程数据 */
	render: {
		/** 渲染进程浏览器数据 */
		browser: {}
	}
};
