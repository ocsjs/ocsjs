import { Instance as Chalk } from 'chalk';
import { LoggerCore } from '../logger.core';
import path, { basename } from 'path';
import fs from 'fs';
import { chromium, BrowserContext, Page, LaunchOptions } from 'playwright-core';
import { AppStore } from '../../types';
import { scripts as PlaywrightScripts } from '../scripts/index';
import { Config } from '../scripts/interface';
const { bgRedBright, bgBlueBright, bgYellowBright, bgGray } = new Chalk({ level: 2 });

type PS = { name: string; configs: Record<string, Config> };

/** 脚本工作线程 */
export class ScriptWorker {
	uid: string = '';
	browser?: BrowserContext;
	logger?: LoggerCore;
	/** 拓展路径 */
	extensionPaths: string[] = [];
	/** 执行的自动化脚本列表 */
	playwrightScripts: PS[] = [];
	store?: AppStore;

	init({
		store,
		uid,
		cachePath,
		playwrightScripts
	}: {
		store: AppStore;
		uid: string;
		cachePath: string;
		playwrightScripts: PS[];
	}) {
		this.debug('正在初始化进程...');

		this.store = store;

		this.uid = uid;
		// 拓展文件夹路径
		this.extensionPaths = fs
			.readdirSync(store.paths.extensionsFolder)
			.map((file) => path.join(store.paths.extensionsFolder, file));

		// 自动化脚本
		this.playwrightScripts = playwrightScripts;

		// 初始化日志
		this.logger = new LoggerCore(store.paths['logs-path'], false, 'script', path.basename(cachePath));

		this.debug('初始化成功');
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
		try {
			await launchScripts({
				onLaunch: (browser) => {
					this.browser = browser;

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
				extensionPaths: this.extensionPaths,
				playwrightScripts: this.playwrightScripts,
				bookmarksPageUrl: this.store
					? `http://localhost:${this.store?.server.port || 15319}/index.html#/bookmarks`
					: undefined,
				serverPort: this.store?.server.port || 15319,
				browserUid: this.uid,
				...options
			});
		} catch (err) {
			// 浏览器异常关闭
			if (err instanceof Error) {
				if (
					err.message.includes('browser has been closed') ||
					err.message.includes('Target closed') ||
					err.message.includes('Browser closed')
				) {
					console.error('异常关闭，请尝试重启任务。', err.message);
					send('browser-closed');
					// 浏览器关闭跟随退出
					process.exit();
				} else {
					console.error('错误 : ', err.message);
				}
			} else {
				console.error('未知错误 : ', err);
			}
		}

		// 浏览器初始化完成
		send('init');
	}

	async close() {
		await this.browser?.close();
		this.browser = undefined;
		send('browser-closed');
		process.exit();
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
				.catch(console.error);
			setTimeout(() => {
				send('webrtc-page-loaded');
			}, 3000);
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

	kill() {
		process.exit();
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
	playwrightScripts,
	bookmarksPageUrl,
	serverPort,
	browserUid,
	onLaunch
}: Required<Pick<LaunchOptions, 'executablePath' | 'headless' | 'args'>> & {
	/** 用户数据目录 */
	userDataDir: string;
	/** 自定义用户脚本URL */
	scripts: string[];
	/** 浏览器拓展路径 */
	extensionPaths: any[];
	/** 自动化脚本 */
	playwrightScripts: PS[];
	/** 初始导航页地址 */
	bookmarksPageUrl?: string;
	/** OCS服务器端口 */
	serverPort: number;
	/** 浏览器UID */
	browserUid: string;
	onLaunch?: (browser: BrowserContext) => void;
}) {
	return new Promise<void>((resolve, reject) => {
		chromium
			.launchPersistentContext('', {
				viewport: null,
				executablePath,
				ignoreDefaultArgs: true,
				ignoreHTTPSErrors: true,
				args: [
					'--window-position=0,0',
					'--no-first-run',
					`--user-data-dir=${userDataDir}`,
					// '--enable-automation',
					'--no-default-browser-check',
					'--remote-debugging-pipe',
					...args
				],
				headless
			})
			.then(async (browser) => {
				browser.once('close', () => {
					send('browser-closed');
					// 浏览器关闭跟随退出
					process.exit();
				});

				// 防检测
				browser.addInitScript({
					content: 'Object.defineProperty(navigator, "webdriver", { get: () => false });console.log(navigator)'
				});

				try {
					const html = async (tips: string | string[], opts?: { loading?: boolean; warn?: boolean }) => {
						const { loading = true, warn = false } = opts || {};
						await blankPage.evaluate(
							(state) => {
								// @ts-ignore OCS官方导航页自带的方法
								const setState = window.setBookmarkLoadingState;
								if (setState) {
									setState(state);
								} else {
									window.document.body.textContent = state.tips.join('\n');
								}
							},
							{ tips: Array.isArray(tips) ? tips : [tips], loading, warn }
						);
					};

					const [blankPage] = browser.pages();
					await blankPage.goto(bookmarksPageUrl || 'about:blank');

					const setup = async () => {
						const warn: string[] = [];
						// 安装用户脚本
						if (scripts.length) {
							await html('【提示】正在安装用户脚本。。。');
							const [page] = browser.pages();
							// 载入本地脚本
							try {
								await initScripts(scripts, browser, page);
							} catch (e) {
								// @ts-ignore
								console.error(e);
								// await html('脚本载入失败，请手动更新，或者忽略。' + e.message);
							}
						} else {
							warn.push('检测到您的软件中并未安装任何用户脚本，或者全部脚本处于不加载状态，可能会导致预期脚本不运行。');
						}

						if (playwrightScripts.length) {
							// 执行自动化脚本
							for (const ps of playwrightScripts) {
								await html(`【提示】正在执行自动化脚本 - ${ps.name} ...`);
								const configs = transformScriptConfigToRaw(ps.configs);

								for (const script of PlaywrightScripts) {
									if (script.name === ps.name) {
										script.on('script-data', console.log);
										script.on('script-error', console.error);
										try {
											await script.run(await browser.newPage(), configs, {
												ocrApiUrl: `http://localhost:${serverPort}/ocr`,
												ocrApiImageKey: 'image',
												detBackgroundKey: 'det_bg',
												detTargetKey: 'det_target'
											});
										} catch (err) {
											console.error(err);
										}
										break;
									}
								}
							}
						}

						await html(['初始化完成。'].concat(warn), { loading: false, warn: !!warn.length });
					};

					if (extensionPaths.length === 0) {
						await html('【警告】浏览器脚本管理拓展为空！将无法运行脚本，如想运行脚本，请在软件左侧浏览器拓展中安装。', {
							loading: false,
							warn: true
						});

						// 触发onLaunch事件
						onLaunch?.(browser);
						// 启动完成
						resolve();
					} else {
						const extensionLoadListener = async (page: Page) => {
							try {
								clearTimeout(extensionLoadListenerInterval);
								await page.close();
								await setup();
							} catch (err) {
								reject(err);
							}

							// 触发onLaunch事件
							onLaunch?.(browser);
							// 启动完成
							resolve();
						};

						// 等待拓展加载完成
						browser.once('page', extensionLoadListener);

						// 一分钟后，如果拓展还没加载完成，提示用户重新启动浏览器
						const extensionLoadListenerInterval = setTimeout(() => {
							browser.off('page', extensionLoadListener);
							html('【警告】浏览器拓展加载超时，请尝试重启浏览器。', { loading: false, warn: true }).catch(reject);
						}, 60 * 1000);

						await html('【提示】正在等待浏览器拓展加载。。。');
					}
				} catch (err) {
					reject(err);
				}
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

/**
 * 将脚本配置转换为可用的对象配置
 * @param configs
 */
function transformScriptConfigToRaw(configs: PS['configs']) {
	const raw = Object.create({});
	for (const key in configs) {
		if (Object.prototype.hasOwnProperty.call(configs, key)) {
			Reflect.set(raw, key, configs[key].value);
		}
	}
	return raw;
}
