// @ts-check
import { BrowserWindow, app, shell } from 'electron';
import path from 'path';

app.disableHardwareAcceleration();

export function createWindow() {
	const win = new BrowserWindow({
		title: 'ocs',
		icon: path.resolve('./public/favicon.ico'),
		minHeight: 600,
		minWidth: 1000,
		center: true,
		show: false,

		type: 'desktop',
		hasShadow: true,
		autoHideMenuBar: true,
		webPreferences: {
			// 关闭拼写矫正
			spellcheck: false,
			webSecurity: true,
			// 开启node
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	win.webContents.setZoomFactor(1);

	win.webContents.on('will-navigate', (event, url) => {
		event.preventDefault();
		shell.openExternal(url);
	});

	win.webContents.setWindowOpenHandler((detail) => {
		shell.openExternal(detail.url);
		return {
			action: 'deny'
		};
	});

	return win;
}
