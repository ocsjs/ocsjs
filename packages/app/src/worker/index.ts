import { BrowserContext, Page } from 'playwright';
import { launchScripts, LaunchScriptsOptions } from '@ocsjs/scripts';
import EventEmitter from 'events';
import { Instance as Chalk } from 'chalk';
import { LoggerCore } from '../logger.core';
import { ScriptWorkerAction, ScriptWorkerActions } from './types';
import { basename } from 'path';
const { bgRedBright, bgBlueBright, bgYellowBright, bgGray } = new Chalk({ level: 2 });

/** 动作集合 */
const actions: Map<keyof ScriptWorkerActions, ScriptWorkerAction> = new Map();

/** 脚本工作线程 */
export class ScriptWorker extends EventEmitter {
	browser?: BrowserContext;
	page?: Page;
	logger?: LoggerCore;
	/** 拓展路径 */
	extensionPaths: string[] = [];
	/** 截图间隔 */
	screenshotPeriod: number = 1000 * 60;

	constructor({ extensionPaths, screenshotPeriod }: { extensionPaths: string[]; screenshotPeriod: number }) {
		super();
		this.extensionPaths = extensionPaths;
		this.screenshotPeriod = screenshotPeriod;
		process.on('unhandledRejection', (e) => this.error('未处理的错误!', e));
		process.on('uncaughtException', (e) => this.error('未处理的错误!', e));
	}

	/** 任务调度 */
	dispatch(actionName: keyof ScriptWorkerActions, data: any) {
		actions.get(actionName)?.target.call(this, data);
	}

	@Action('launch', {
		name: '启动',
		destroyWhenError: true,
		enableLogger: true
	})
	async launch(options: LaunchScriptsOptions) {
		if (this.extensionPaths.length) {
			this.debug(
				'加载拓展：',
				this.extensionPaths.map((p) => basename(p))
			);
		} else {
			this.warn('浏览器拓展为空，请确保拓展已安装，并尝试重启软件。');
		}

		/** 添加拓展启动参数 */
		options.launchOptions.args = formatExtensionArguments(this.extensionPaths);
		/** 启动脚本 */
		await launchScripts({
			onLaunch: (...args) => {
				// 初始化浏览器变量
				[this.browser, this.page] = args;
				// 开始记录图像
				const interval = setInterval(async () => {
					if (this.browser) this.screenshot(this.browser);
				}, this.screenshotPeriod);
				this.browser.once('close', () => clearInterval(interval));
			},
			onError: this.error,
			...options
		});

		if (this.browser === undefined || this.page === undefined || this.page?.isClosed()) {
			throw new Error('启动失败，请重试。');
		} else {
			// 置顶页面
			await this.page.bringToFront();
			// 截图
			if (this.browser) this.screenshot(this.browser);
		}
	}

	@Action('close', {
		name: '关闭'
	})
	close() {
		this.destroy();
	}

	/**
	 * 定时截图
	 */
	async screenshot(browser: BrowserContext) {
		const screenshots = await Promise.all(
			browser.pages().map(async (page) => {
				try {
					const buffer = await page.screenshot();
					return { title: await page.title(), url: page.url(), base64: buffer.toString('base64') };
				} catch {
					return undefined;
				}
			})
		);

		this.emit(
			'screenshot',
			screenshots.filter((s) => s)
		);
	}

	destroy() {
		this.browser?.close();
		this.browser = undefined;
		this.page = undefined;
	}

	debug(...msg: any[]) {
		console.log(bgGray(loggerPrefix()), ...msg);
	}

	warn(...msg: any[]) {
		console.log(bgYellowBright(loggerPrefix()), ...msg);
	}

	info(...msg: any[]) {
		console.log(bgBlueBright(loggerPrefix()), ...msg);
	}

	error(...msg: any[]) {
		console.log(bgRedBright(loggerPrefix()), ...msg);
	}
}

/**
 * 动作装饰器，通过反射自动分配动作
 * @param actionName 动作名称，对应进程传递的 action 参数
 * @param options 动作附加参数
 */
function Action(actionName: keyof ScriptWorkerActions, options: Omit<ScriptWorkerAction, 'target'>): MethodDecorator {
	return (target: any, key: any, descriptor: TypedPropertyDescriptor<any>) => {
		// @ts-ignore
		const original: Function = descriptor.value;
		// @ts-ignore
		descriptor.value = async function (opts: any) {
			try {
				target.info(`${options.name}任务开始`);
				await original.call(this, opts || undefined);
				target.info(`${options.name}任务完成`);
			} catch (err) {
				// @ts-ignore
				target.error(`${options.name}任务错误：${err}`);
				if (options.destroyWhenError) {
					target.destroy.call(this);
				}
			}
		};

		actions.set(actionName, {
			// @ts-ignore
			target: descriptor.value,
			...options
		});
	};
}

/** 格式化浏览器拓展启动参数 */
function formatExtensionArguments(extensionPaths: string[]) {
	if (extensionPaths.length) {
		const paths = extensionPaths.map((p) => p.replace(/\\/g, '/')).join(',');
		return [`--disable-extensions-except=${paths}`, `--load-extension=${paths}`];
	} else {
		return [];
	}
}

function loggerPrefix() {
	return `[OCS] ${new Date().toLocaleTimeString()}`;
}
