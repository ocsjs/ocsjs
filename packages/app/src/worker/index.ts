import EventEmitter from 'events';
import { Instance as Chalk } from 'chalk';
import { LoggerCore } from '../logger.core';
import { ScriptWorkerAction, ScriptWorkerActions } from './types';
import { basename } from 'path';
import { chromium, BrowserContext, Page, LaunchOptions } from 'playwright-core';
import { PageScreencaster } from '../screencast.browser';
const { bgRedBright, bgBlueBright, bgYellowBright, bgGray } = new Chalk({ level: 2 });

/** 动作集合 */
const actions: Map<keyof ScriptWorkerActions, ScriptWorkerAction> = new Map();

/** 脚本工作线程 */
export class ScriptWorker extends EventEmitter {
	browser?: BrowserContext;
	logger?: LoggerCore;
	/** 拓展路径 */
	extensionPaths: string[] = [];
	screencaster = new PageScreencaster(
		{ everyNthFrame: 5, quality: 100, format: 'png', maxHeight: 920, maxWidth: 1080 },
		async ({ base64 }) => {
			this.emit('page-image', base64);
		}
	);
	pageId: string = '';
	pages: Record<string, Page> = {};

	constructor({ extensionPaths }: { extensionPaths: string[] }) {
		super();
		this.extensionPaths = extensionPaths;
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
	async launch(
		options: Required<Pick<LaunchOptions, 'executablePath' | 'headless' | 'args'>> & {
			userDataDir: string;
			scripts: string[];
		}
	) {
		if (this.extensionPaths.length) {
			this.debug(
				'加载拓展：',
				this.extensionPaths.map((p) => basename(p))
			);
		} else {
			this.debug('浏览器拓展为空');
		}

		/** 添加拓展启动参数 */
		options.args = formatExtensionArguments(this.extensionPaths);

		/** 启动脚本 */
		await launchScripts({
			onLaunch: (browser) => {
				this.browser = browser;
				// 浏览器启动完成
				this.emit('launched');
			},
			...options
		});

		// 开始传递图像

		const listenPage = async (page: Page) => {
			if (this.browser) {
				const id = Date.now().toString();
				this.pages[id] = page;
				await this.pageSwitch(id);
				page.on('load', async () => {
					this.emit('page-load', { id, url: page.url(), title: await page.title() });
				});
				// 当页面关闭时
				page.once('close', async () => {
					this.pageClose(id);
				});
			}
		};

		if (this.browser) {
			listenPage(this.browser.pages()[0]);
			this.browser.on('page', listenPage);
		}
	}

	@Action('page-close', { name: '关闭标签页' })
	async pageClose(pageId: string) {
		const page = this.pages[pageId];
		if (this.browser && page) {
			// 如果关闭的是当前页，则切换，并重新传递影像
			if (this.pageId === pageId) {
				const newId = Object.keys(this.pages).at(-1);
				if (newId) {
					// 改变当前 id
					this.pageId = newId;
					// 删除浏览器记录
					Reflect.deleteProperty(this.pages, pageId);
					// 传递事件
					this.emit('page-switch', newId);
					await this.pageSwitch(newId);
				}
			}
			// 关闭浏览器
			if (!page.isClosed()) {
				await page.close();
			}
			this.emit('page-close', { id: pageId });
		}
	}

	@Action('browser-close', { name: '关闭浏览器' })
	browserClose() {
		this.destroy();
	}

	@Action('page-switch', { name: '页面切换' })
	async pageSwitch(pageId: string) {
		const page = this.pages[pageId];
		if (page) {
			await this.screencaster.stop();
			await this.screencaster.start(page);
			this.pageId = pageId;
		}
	}

	destroy() {
		this.browser?.close();
		this.browser = undefined;
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
	const paths = extensionPaths.map((p) => p.replace(/\\/g, '/')).join(',');
	return [`--disable-extensions-except=${paths}`, `--load-extension=${paths}`];
}

function loggerPrefix() {
	return `[OCS] ${new Date().toLocaleTimeString()}`;
}

/**
 * 运行脚本
 */
export async function launchScripts({
	executablePath,
	headless,
	args,
	userDataDir,
	scripts,
	onLaunch
}: Required<Pick<LaunchOptions, 'executablePath' | 'headless' | 'args'>> & {
	userDataDir: string;
	scripts: string[];
	onLaunch?: (browser: BrowserContext) => void;
}) {
	return new Promise<void>(async (resolve) => {
		const browser = await chromium.launchPersistentContext(userDataDir, {
			viewport: null,
			executablePath,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-accelerated-2d-canvas',
				'--no-first-run',
				'--disable-gpu',
				...args
			],
			headless
		});
		onLaunch?.(browser);

		const [blankPage] = browser.pages();

		blankPage.setContent('正在等待浏览器插件加载。。。');

		// 等待插件加载完成
		browser.once('page', async (extensionPage) => {
			await blankPage.setContent('正在安装脚本。。。');
			await extensionPage.close();
			const [page] = browser.pages();
			// 载入本地脚本
			for (const url of scripts) {
				try {
					await initScript(url, page);
				} catch (e) {
					// @ts-ignore
					await blankPage.setContent('脚本载入失败，请手动更新，或者忽略。' + e.message);
				}
			}
			await blankPage.setContent('初始化进程完毕。');
			resolve();
		});
	});
}

/**
 * 安装/更新脚本
 *
 */
function initScript(url: string, page: Page) {
	console.log('install ', url);

	return new Promise<void>(async (resolve) => {
		/** 获取最新资源信息 */
		const [installPage] = await Promise.all([
			page.context().waitForEvent('page'),
			page.evaluate((url) => (window.location.href = url), url)
		]);
		// 检测脚本是否安装/更新完毕
		const interval = setInterval(async () => {
			if (installPage.isClosed()) {
				clearInterval(interval);
				setTimeout(resolve, 1000);
			} else {
				// 置顶页面，防止点击安装失败
				await installPage.bringToFront();
				await installPage.evaluate(() => {
					const input = (document.querySelector('button.primary') || document.querySelector('input')) as HTMLElement;
					input?.click();
				});
			}
		}, 3000);
	});
}
