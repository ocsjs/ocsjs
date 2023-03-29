import { BrowserWindow, App, Dialog, WebContents, DesktopCapturer } from 'electron';
import { notify } from './notify';
import { RemoteMethods } from '@ocsjs/app';
import type fs from 'fs';
import type os from 'os';
import type path from 'path';
import type crypto from 'crypto';
import type Store from 'electron-store';
import { electron } from './node';
import type { OCSApi } from '@ocsjs/common';
const { ipcRenderer } = electron;

/**
 * 注册渲染进程和主进程的远程通信
 * @param eventName
 * @returns
 */
function registerRemote<T>(eventName: string) {
	function sendSync(channel: string, ...args: any[]): any {
		const res = ipcRenderer.sendSync(channel, ...args);
		if (res?.error) {
			console.log(res);

			notify('remote 模块错误', res.error, 'remote', { copy: true, type: 'error' });
		}
		return res;
	}

	function send(channel: string, args: any[]): Promise<any> {
		return new Promise((resolve) => {
			ipcRenderer.once(args[0], (e: any, ...respondArgs) => {
				if (respondArgs[0].error) {
					console.log({ respondArgs, channel, args });
					notify('remote 模块错误', respondArgs[0].error, 'remote', { copy: true, type: 'error' });
				} else {
					resolve(respondArgs[0].data);
				}
				// console.log(args[1], args[2], respondArgs[0].data);
			});
			ipcRenderer.send(channel, JSON.parse(JSON.stringify(args)));
		});
	}

	return {
		/** 获取远程变量 */
		get<K extends keyof T>(property: K): T[K] extends { (...args: any[]): any } ? ReturnType<T[K]> : any {
			return sendSync(eventName + '-get', [property]);
		},
		/** 设置远程变量 */
		set<K extends keyof T>(property: K, value: any): T[K] extends { (...args: any[]): any } ? ReturnType<T[K]> : any {
			return sendSync(eventName + '-set', [property, value]);
		},

		/** 异步调用远程方法 */
		call<K extends keyof T>(
			property: K,
			...args: T[K] extends { (...args: any[]): any } ? Parameters<T[K]> : any[]
		): Promise<Awaited<T[K] extends { (...args: any[]): any } ? ReturnType<T[K]> : any>> {
			// 回调名
			const respondChannel = getRespondChannelId(property.toString());
			return send(eventName + '-call', [respondChannel, property, ...args]);
		}
	};
}

function getRespondChannelId(property: string) {
	return `${property}-${(Math.random() * 1000).toFixed(0)}-${Date.now()}`;
}

export const remote = {
	// nodejs
	'electron-store': registerRemote<Store>('electron-store'),
	fs: registerRemote<typeof fs>('fs'),
	path: registerRemote<typeof path>('path'),
	os: registerRemote<typeof os>('os'),
	crypto: registerRemote<typeof crypto>('crypto'),

	// 公共 api
	OCSApi: registerRemote<typeof OCSApi>('OCSApi'),

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
	logger: registerRemote<Console>('logger'),
	// 截屏录像
	desktopCapturer: registerRemote<DesktopCapturer>('desktopCapturer')
};
