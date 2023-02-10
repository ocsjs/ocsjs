import { createWindow } from '../window';
import { app, BrowserWindow } from 'electron';
import { existsSync, statSync } from 'fs';

export function globalListenerRegister(win: BrowserWindow) {
	app.on('second-instance', (e, argv) => {
		if (win && process.platform === 'win32') {
			if (win.isMinimized()) {
				win.restore();
			}
			if (win.isVisible()) {
				win.focus();
			} else {
				win.show();
			}
			const file = getFileInArguments(argv);
			win.webContents.send('open-file', file);
		}
	});

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
}

/**
 *
 * 获取命令行参数中的url信息
 * @param {string[]} argv
 * @returns
 */
export function getFileInArguments(argv: any[]) {
	argv.shift();
	for (const arg of argv) {
		if (!arg.startsWith('-')) {
			if (existsSync(arg) && statSync(arg).isFile()) {
				return arg;
			}
		}
	}
}
