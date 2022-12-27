import { ChildProcess } from 'child_process';
import { message } from 'ant-design-vue';
import { remote } from './remote';
import { store } from '../store';
import { NodeJS } from './/export';
import { LaunchOptions } from 'playwright-core';
import { reactive, Ref, ref } from 'vue';

const childProcess = require('child_process') as typeof import('child_process');
export const processes: Record<string, Process> = reactive({});

/**
 * 运行进程
 */
export class Process {
	private shell: ChildProcess | undefined;
	launched: boolean = false;
	/** 浏览器启动参数 */
	options?: LaunchOptions;
	/** 浏览器用户数据缓存文件夹路径 */
	cachePath: string;
	/** 浏览器信息 */
	pages: Record<
		string,
		{
			url: string;
			title: string;
		}
	> = {};
	onImage?: (pageId: string, base64: string) => void;
	pageId: string = '';
	base64 = '';

	constructor(cachePath: string, options: LaunchOptions, onImage?: (pageId: string, base64: string) => void) {
		this.cachePath = cachePath;
		this.options = options;
		this.onImage = onImage;
	}

	pageSwitch(pageId: string) {
		this.pageId = pageId;
		this.send('page-switch', pageId);
	}

	/**
	 * 使用 child_process 运行 ocs 命令
	 */
	async init(onConsole?: (data: any) => void) {
		const target = NodeJS.path.join(await remote.app.call('getAppPath'), './script.js');
		process.env.store = JSON.stringify(store);
		const shell = childProcess.fork(target, {
			stdio: ['ipc'],
			env: process.env
		});
		shell.stdout?.on('data', (data: any) => onConsole?.(data.toString()));
		shell.stderr?.on('data', (data: any) => onConsole?.(data.toString()));
		shell.stderr?.on('data', (data: any) => remote.logger.call('error', String(data)));
		shell.on('message', (message: { action: string; data: any }) => {
			// 浏览器启动
			if (message.action === 'launched') {
				this.launched = true;
			}
			// 页面被切换（新建页面，页面跳转等）
			else if (message.action === 'page-switch') {
				this.pageId = message.data;
			}
			// 页面创建
			else if (message.action === 'page-load') {
				this.pages[message.data.id] = message.data;
			}
			// 页面关闭
			else if (message.action === 'page-close') {
				Reflect.deleteProperty(this.pages, message.data.id);
			}
			// 页面图像
			else if (message.action === 'page-image') {
				console.log('image');

				this.base64 = message.data;
			} else {
				console.error('unknown action: ' + message.action);
			}
		});
		this.shell = shell;

		// 初始化进程数据
		this.shell?.send(
			JSON.stringify({
				init: true,
				data: store,
				cachePath: this.cachePath
			})
		);
	}

	/**
	 * 给子进程发送信息
	 * @param action 事件名
	 * @param data 数据
	 */
	send(action: string, data: any) {
		console.log('process send :', { action, data });
		this.shell?.send(
			JSON.stringify({
				action,
				data: data,
				cachePath: this.cachePath
			})
		);
	}

	/** 启动文件 */
	launch() {
		this.send('launch', {
			userDataDir: this.cachePath,
			scripts: store.scripts.filter((s) => s.enable).map((s) => s.url),
			...this.options
		});
	}

	/** 关闭进程 */
	close() {
		this.send('browser-close', undefined);
		this.launched = false;
	}

	closePage(pageId: string) {
		this.send('page-close', pageId);
		Reflect.deleteProperty(this.pages, pageId);
	}

	/** 显示当前的浏览器  */
	bringToFront() {
		if (this.launched && this.options) {
			childProcess.exec(`"${this.options.executablePath}" --user-data-dir="${this.cachePath}" "about:blank"`);
		} else {
			message.warn('必须先启动文件');
		}
	}

	toString() {
		return '[Process]';
	}
}
