import { BrowserWindow, App, Dialog, WebContents } from 'electron';
import { notify } from './notify';
import { RemoteMethods } from '@ocsjs/app';
const { randomUUID } = require('crypto');
const { ipcRenderer } = require('electron');

/**
 * 注册渲染进程远程通信
 * @param eventName
 * @returns
 */
function registerRemote<T>(eventName: string) {
	function sendSync(channel: string, ...args: any[]): any {
		const res = ipcRenderer.sendSync(channel, ...args);
		if (res?.error) {
			notify('remote 模块错误', res.error, 'remote', { copy: true, type: 'error' });
		}
		return res;
	}

	function send(channel: string, args: any[]): any {
		return new Promise((resolve) => {
			ipcRenderer.once(args[0], (e: any, ...respondArgs) => {
				if (respondArgs[0].error) {
					notify('remote 模块错误', respondArgs[0].error, 'remote', { copy: true, type: 'error' });
				} else {
					resolve(respondArgs[0].data);
				}
				console.log(args[1], args[2], respondArgs[0].data);
			});
			ipcRenderer.send(channel, args);
		});
	}

	return {
		// 获取远程变量
		get(property: keyof T) {
			return sendSync(eventName + '-get', [property]);
		},
		// 设置远程变量
		set(property: keyof T, value: any) {
			return sendSync(eventName + '-set', [property, value]);
		},
		// 调用远程方法
		call(property: keyof T, ...args: any[]) {
			// 通信名
			const channel = [eventName, 'call'].join('-');
			// 回调名
			const respondChannel = randomUUID().replace(/-/g, '');
			return send(channel, [respondChannel, property, ...args]);
		}
	};
}

export const remote = {
	// 注册 window 通信
	win: registerRemote<BrowserWindow>('win'),
	// 注册 window 通信
	webContents: registerRemote<WebContents>('webContents'),
	// 注册 app 通信
	app: registerRemote<App>('app'),
	// 注册 dialog 通信
	dialog: registerRemote<Dialog>('dialog'),
	// 暴露方法
	methods: registerRemote<RemoteMethods>('methods'),
	// 日志
	// eslint-disable-next-line no-undef
	logger: registerRemote<Console>('logger')
};
