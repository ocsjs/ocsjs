// @ts-check
import { BrowserWindow, app, shell } from 'electron';
import os from 'os';
import path from 'path';

app.disableHardwareAcceleration();

export function createWindow() {
	const win = new BrowserWindow({
		title: 'ocs',
		icon: path.resolve('./public/favicon.ico'),
		minHeight: 500,
		minWidth: 800,
		center: true,
		frame: os.platform() === 'darwin',
		show: false,
		backgroundColor: '#fff',
		hasShadow: true,
		webPreferences: {
			// 关闭拼写矫正
			spellcheck: false,
			webSecurity: true,
			// 开启node
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	win.on('new-window-for-tab', (event: any, url: any) => {
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
