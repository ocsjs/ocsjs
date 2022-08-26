import { app } from 'electron';
import Store from 'electron-store';

/** 配置自动启动 */
export function autoLaunch() {
	if (app.isPackaged) {
		const store = new Store();
		app.setLoginItemSettings({
			openAtLogin: Boolean(store.get('auto-launch') || false)
		});
	}
}
