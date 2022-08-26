import { ipcMain, app, dialog, BrowserWindow } from 'electron';
import { Logger } from '../logger';
import trash from 'trash';
import { autoLaunch } from './auto.launch';
import axios from 'axios';
import { downloadFile, unzip, zip } from '../utils';

/**
 * 注册主进程远程通信事件
 * @param name 事件前缀名称
 * @param target 事件目标
 */
function registerRemoteEvent(name: string, target: any) {
	const logger = Logger('remote');
	ipcMain
		.on(name + '-get', (event, args) => {
			try {
				logger.info({ event: name + '-get', args });
				const property = args[0];
				event.returnValue = target[property];
			} catch (e) {
				event.returnValue = { error: e };
			}
		})
		.on(name + '-set', (event, args) => {
			try {
				logger.info({ event: name + '-set', args });
				const [property, value] = [args[0], args[1]];
				event.returnValue = target[property] = value;
			} catch (e) {
				event.returnValue = { error: e };
			}
		})

		.on(name + '-call', async (event, args) => {
			const [channel, property, ...value] = [args.shift(), args.shift(), ...args];
			logger.info({ event: name + '-call', args });
			try {
				const result = await target[property](...value);
				event.reply(channel, { data: result });
			} catch (e) {
				event.reply(channel, { error: e });
			}
		});
}

let win: BrowserWindow | undefined;

/** 需远程共享的方法 */
const methods = {
	autoLaunch,
	trash,
	get: (url: string, opts: any) => axios.get(url, opts).then((res) => res.data),
	post: (url: string, opts: any) => axios.post(url, opts).then((res) => res.data),
	download: (channel: string, url: string, dest: string) => {
		/** 下载最新版本 */
		return downloadFile(url, dest, (rate: any, totalLength: any, chunkLength: any) => {
			win?.webContents?.send('download', channel, rate, totalLength, chunkLength);
		});
	},
	zip: zip,
	unzip: unzip
};

/**
 * 初始化远程通信
 */
export function remoteRegister(_win: BrowserWindow) {
	win = _win;
	registerRemoteEvent('win', _win);
	registerRemoteEvent('webContents', _win.webContents);
	registerRemoteEvent('app', app);
	registerRemoteEvent('dialog', dialog);
	registerRemoteEvent('methods', methods);
	registerRemoteEvent('logger', Logger('render'));
}

export type RemoteMethods = typeof methods;

const _registerRemoteEvent = registerRemoteEvent;
export { _registerRemoteEvent as registerRemoteEvent };
