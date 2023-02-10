import { Instance as Chalk } from 'chalk';
import { LoggerCore } from '../logger.core';
import path, { basename } from 'path';
import fs from 'fs';
import { chromium, BrowserContext, Page, LaunchOptions } from 'playwright-core';
import { AppStore } from '../../types';
const { bgRedBright, bgBlueBright, bgYellowBright, bgGray } = new Chalk({ level: 2 });

/** 脚本工作线程 */
export class ScriptWorker {
	uid: string = '';
	browser?: BrowserContext;
	logger?: LoggerCore;
	/** 拓展路径 */
	extensionPaths: string[] = [];
	store?: AppStore;

	init({ store, uid, cachePath }: { store: AppStore; uid: string; cachePath: string }) {
		console.log('正在初始化进程...');

		this.store = store;

		this.uid = uid;
		// 拓展文件夹路径

		this.extensionPaths = fs
			.readdirSync(store.paths.extensionsFolder)
			.map((file) => path.join(store.paths.extensionsFolder, file));

		// 初始化日志
		this.logger = new LoggerCore(store.paths['logs-path'], false, 'script', path.basename(cachePath));

		console.log('初始化成功');
	}

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
			extensionPaths: this.extensionPaths,
			onLaunch: (browser) => {
				this.browser = browser;

				browser.route(`**/*`, (route) => {
					const headers = route.request().headers();
					headers['browser-uid'] = this.uid;
					route.continue({ headers });
				});

				/** URL事件解析器 */
				this.browser?.on('page', (page) => {
					const match = page.url().match(/ocs-action_(.+)/);
					if (match?.[1]) {
						const action = match[1];

						const actions: any = {
							'bring-to-top': () => {
								// 通过命令行打开此页面后会置顶浏览器，并自动关闭当前事件页面
								page.close();
							}
						};

						actions[action]();
					}
				});

				// 浏览器启动完成
				send('launched');
			},
			uid: this.uid,
			...options
		});

		// 浏览器初始化完成
		send('init');
	}

	async close() {
		await this.browser?.close();
		this.browser = undefined;
		send('browser-closed');
	}

	/** 跳转到特殊图像共享浏览器窗口 */
	async gotoWebRTCPage() {
		const page = await this.browser?.newPage();
		if (page) {
			await page
				.evaluate((uid) => {
					document.title = uid;
					document.body.innerHTML = `正在获取图像中，请勿操作。`;
				}, this.uid)
				.catch(() => {});
			setTimeout(() => {
				send('webrtc-page-loaded');
			}, 1000);
		}
	}

	/** 关闭特殊图像共享浏览器窗口 */
	async closeWebRTCPage() {
		const pages = this.browser?.pages() || [];
		for (const page of pages) {
			const title = await page.title();
			if (title === this.uid) {
				await page.close();
			}
		}
		send('webrtc-page-closed');
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
	extensionPaths,
	uid,
	onLaunch
}: Required<Pick<LaunchOptions, 'executablePath' | 'headless' | 'args'>> & {
	userDataDir: string;
	scripts: string[];
	extensionPaths: any[];
	uid: string;
	onLaunch?: (browser: BrowserContext) => void;
}) {
	return new Promise<void>((resolve, reject) => {
		chromium
			.launchPersistentContext(userDataDir, {
				viewport: null,
				executablePath,
				args: [
					'--no-sandbox',
					'--window-position=0,0',
					/** 自动播放无需用户点击页面 */
					'--no-user-gesture-required',
					/** 允许拓展访问本地文件 */
					// '--disable-extensions-file-access-check',
					'--no-first-run',
					'--disable-popup-blocking',
					...args
				],
				headless
			})
			.then(async (browser) => {
				browser.once('close', () => {
					send('browser-closed');
				});

				const [blankPage] = browser.pages();
				await blankPage.goto('http://localhost:15319/index.html#/bookmarks');

				const html = (tip: string, loading: boolean = true) =>
					blankPage.evaluate(
						(state) =>
							// @ts-ignore
							window.setBookmarkLoadingState(state),
						{ tip, loading }
					);

				onLaunch?.(browser);

				// 等待一秒后才开始执行操作， 因为需要根据 title 进行影像传输。
				setTimeout(async () => {
					const setup = async () => {
						await html('正在安装脚本。。。');
						const [page] = browser.pages();
						// 载入本地脚本
						try {
							await initScripts(scripts, browser, page);
						} catch (e) {
							// @ts-ignore
							console.error(e);
							// await html('脚本载入失败，请手动更新，或者忽略。' + e.message);
						}
						await html('初始化进程完毕。', false);
						resolve();
					};

					if (extensionPaths.length === 0) {
						await html('浏览器脚本管理拓展为空！将无法运行脚本，如想运行脚本，请在软件左侧浏览器拓展中安装。', false);
					} else {
						await html('正在等待浏览器拓展加载。。。');

						// 等待拓展加载完成
						browser.once('page', async (extensionPage) => {
							await extensionPage.close();
							setup();
						});
					}
				}, 1000);
			})
			.catch((err) => {
				reject(err);
			});
	});
}

/**
 * 安装/更新脚本
 *
 */
async function initScripts(urls: string[], browser: BrowserContext, page: Page) {
	console.log('install ', urls);
	let installCont = 0;

	for (const url of urls) {
		try {
			await page.goto(url);
		} catch {}
	}

	// 检测脚本是否安装/更新完毕
	const tryInstall = async () => {
		if (browser.pages().length !== 0) {
			const installPage = browser.pages().find((p) => /extension:\/\//.test(p.url()));
			if (installPage) {
				// 置顶页面，防止点击安装失败
				await installPage.bringToFront();
				await installPage.evaluate(() => {
					const btn = (document.querySelector('[class*="primary"]') ||
						document.querySelector('[type*="button"]')) as HTMLElement;
					btn?.click();
				});

				await sleep(1000);

				if (installPage.isClosed()) {
					installCont++;
				}
				if (installCont !== urls.length) {
					await tryInstall();
				}
			} else if (installCont === urls.length) {
				//
			} else {
				await sleep(1000);
				await tryInstall();
			}
		}
	};

	await tryInstall();
}

function send(event: string, ...args: any[]) {
	process.send?.({ event, args });
}

function sleep(t: number) {
	return new Promise((resolve, reject) => setTimeout(resolve, t));
}
