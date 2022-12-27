// @ts-check

import { app, ipcMain, Menu } from 'electron';
import { handleOpenFile } from './src/tasks/handle.open';
import { remoteRegister } from './src/tasks/remote.register';
import { initStore } from './src/tasks/init.store';
import { autoLaunch } from './src/tasks/auto.launch';
import { createWindow } from './src/main';
import { globalListenerRegister } from './src/tasks/global.listener';
import { task } from './src/utils';
import { handleError } from './src/tasks/error.handler';
import { updater } from './src/tasks/updater';
import { startupServer } from './src/tasks/startup.server';

/** 获取单进程锁 */
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	app.quit();
} else {
	bootstrap();
}

/** 启动渲染进程 */
function bootstrap() {
	task('OCS启动程序', () =>
		Promise.all([
			task('初始化错误处理', () => handleError()),
			task('初始化本地设置', () => initStore()),
			task('初始化自动启动', () => autoLaunch()),
			task('处理打开文件', () => handleOpenFile(process.argv)),
			task('启动接口服务', () => startupServer()),

			task('启动渲染进程', async () => {
				await app.whenReady();
				const window = createWindow();

				app.on('quit', (e) => {
					e.preventDefault();
					// 交给渲染层去关闭浏览器
					window.webContents.send('close');
				});

				window.on('close', (e) => {
					e.preventDefault();
					window.webContents.send('close');
				});

				task('初始化远程通信模块', () => remoteRegister(window));
				task('注册app事件监听器', () => globalListenerRegister(window));

				if (app.isPackaged) {
					await window.loadFile('./public/index.html');
				} else {
					await window.loadURL('http://localhost:3000');
					window.webContents.openDevTools();
				}

				window.show();

				if (app.isPackaged) {
					task('软件更新', () => updater(window));
				}
			})
		])
	);
}
