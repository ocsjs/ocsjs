import { app } from 'electron';
import { store } from '../store';

/** 配置自动启动 */
export function autoLaunch() {
	if (app.isPackaged) {
		app.setLoginItemSettings({
			openAtLogin: store.store.window.autoLaunch
		});
	}
}
