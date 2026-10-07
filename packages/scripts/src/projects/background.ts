import { RemotePlaywright, request } from '@ocsjs/core';
import type { SearchInformation, SimplifyWorkResult } from '@ocsjs/core';
import { markdown } from '../utils/markdown';
import {
	$ui,
	$gm,
	$message,
	$modal,
	$store,
	Project,
	Script,
	StoreListenerType,
	h,
	$,
	MessageElement,
	$menu
} from 'easy-us';
import semver_gt from 'semver/functions/gt';
import semver_valid from 'semver/functions/valid';
import { CommonProject } from './common';
import { CXProject, definedProjects, ICourseProject, IcveMoocProject, YKTProject, ZHSProject, ZJYProject } from '..';
import { RenderScript } from '../render';
import { SearchInfosElement } from '../elements/search.infos';
import { $render } from '../utils/render';

const state = {
	console: {
		listenerIds: {
			logs: 0 as StoreListenerType
		}
	},
	app: {
		listenerIds: {
			sync: 0 as StoreListenerType,
			connected: 0 as StoreListenerType,
			closeSync: 0 as StoreListenerType
		}
	}
};

export type LogType = 'log' | 'info' | 'debug' | 'warn' | 'error';

type RequestList = {
	id: string;
	url: string;
	method: string;
	type: string;
	data: any;
	headers: any;
	response?: string;
	error?: string;
	time: number;
}[];

/**
 * 题库缓存类型
 */
type QuestionCache = { title: string; answer: string; from: string; homepage: string; ai?: boolean };

/**
 * 监听网页开发者工具打开事件（仅触发一次，多种方式组合检测）。
 * 浏览器没有标准的开发者工具开关事件，以下为业界常用方案的组合：
 * 1. 快捷键监听：F12 / Ctrl(⌘)+Shift+I / Ctrl(⌘)+Shift+J / Ctrl(⌘)+Shift+C
 * 2. 视口差值检测：dock（内嵌）模式打开时挤压页面视口，outer 与 inner 差值变大（兜底，覆盖菜单/右键“检查”打开的情况）
 * 3. console 对象嗅探：Chrome 等浏览器仅在控制台打开时才会为 console.log 的对象求值，
 *    利用 id getter 是否被调用来判断（可覆盖独立窗口模式，控制台面板需处于可见状态）
 */
function onDevtoolsOpen(callback: () => void) {
	let triggered = false;
	const trigger = () => {
		if (triggered) return;
		triggered = true;
		window.removeEventListener('keydown', onKeydown, true);
		clearInterval(timer);
		callback();
	};

	// 方式一：监听打开开发者工具的快捷键
	const onKeydown = (e: KeyboardEvent) => {
		if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))) {
			trigger();
		}
	};
	window.addEventListener('keydown', onKeydown, true);

	// 方式三探针：控制台打开时 console.log 会对对象求值，从而触发 id getter
	const probe = h('div');
	Object.defineProperty(probe, 'id', {
		get: () => {
			trigger();
			return 'devtools-probe';
		}
	});

	const timer = setInterval(() => {
		// 方式二：dock 模式视口差值检测（阈值 160px）
		const widthDiff = window.outerWidth - window.innerWidth;
		const heightDiff = window.outerHeight - window.innerHeight;
		if (widthDiff > 160 || heightDiff > 160) {
			trigger();
			return;
		}
		// 方式三：console 对象嗅探（周期性记录，控制台打开时求值触发 getter）
		console.log(probe);
	}, 1000);
}

/** 后台进程，处理与PC软件端的通讯，以及其他后台操作 */
export const BackgroundProject = Project.create({
	name: '其他',
	domains: [],
	scripts: {
		elementRegister: new Script({
			name: '🔗 元素注册',
			hideInPanel: true,
			matches: [['所有页面', /.*/]],
			onstart() {
				// 注册自定义元素
				$.loadCustomElements([SearchInfosElement]);
			}
		}),
		console: new Script({
			name: '📄 日志输出',
			matches: [['所有', /.*/]],
			namespace: 'render.console',
			configs: {
				logs: {
					defaultValue: [] as { type: LogType; content: string; time: number; stack: string }[]
				}
			},
			onrender({ panel }) {
				const getTypeDesc = (type: LogType) =>
					type === 'info'
						? '信息'
						: type === 'error'
						? '错误'
						: type === 'warn'
						? '警告'
						: type === 'debug'
						? '调试'
						: '日志';

				const createLog = (log: { type: LogType; content: string; time: number; stack: string }) => {
					const date = new Date(log.time);
					const item = h(
						'div',
						{
							title: '双击复制日志信息',
							className: 'item'
						},
						[
							h(
								'span',
								{ className: 'time' },
								`${date.getHours().toFixed(0).padStart(2, '0')}:${date.getMinutes().toFixed(0).padStart(2, '0')} `
							),
							h('span', { className: log.type }, `[${getTypeDesc(log.type)}]`),
							h('span', ':' + log.content)
						]
					);

					item.addEventListener('dblclick', () => {
						navigator.clipboard.writeText(
							Object.keys(log)
								.map((k) => `${k}: ${(log as any)[k]}`)
								.join('\n')
						);
					});

					return item;
				};

				const showLogs = () => {
					const div = h('div', { className: 'card console' });

					const logs = this.cfg.logs.map((log) => createLog(log));
					if (logs.length) {
						div.replaceChildren(...logs);
					} else {
						div.replaceChildren(
							h('div', '暂无任何日志', (div) => {
								div.style.textAlign = 'center';
							})
						);
					}

					return { div, logs };
				};

				/**
				 * 判断滚动条是否滚到底部
				 */
				const isScrollBottom = (div: HTMLElement) => {
					const { scrollHeight, scrollTop, clientHeight } = div;
					return scrollTop + clientHeight + 50 > scrollHeight;
				};

				const { div, logs } = showLogs();

				this.offConfigChange(state.console.listenerIds.logs);
				state.console.listenerIds.logs = this.onConfigChange('logs', (logs) => {
					const log = createLog(logs[logs.length - 1]);
					div.append(log);
					setTimeout(() => {
						if (isScrollBottom(div)) {
							log.scrollIntoView();
						}
					}, 10);
				});

				const show = () => {
					panel.body.replaceChildren(div);
					setTimeout(() => {
						logs[logs.length - 1]?.scrollIntoView();
					}, 10);
				};

				show();
			}
		}),
		/** 渲染脚本，窗口渲染主要脚本（从 通用 迁移至 其他） */
		render: RenderScript,
		data: new Script({
			name: '拓展数据',
			hideInPanel: true,
			matches: [['', /.*/]],
			namespace: 'background.data',
			configs: {
				notes: {
					defaultValue: '这里是一些其他的应用或者拓展功能。'
				},
				/**
				 * 题库缓存
				 */
				localQuestionCaches: {
					defaultValue: [] as QuestionCache[],
					extra: {
						appConfigSync: false
					}
				}
			},
			methods() {
				return {
					/**
					 * 添加题库缓存
					 */
					addQuestionCache: async (...questionCacheItems: QuestionCache[]) => {
						const questionCaches: QuestionCache[] = this.cfg.localQuestionCaches;
						for (const item of questionCacheItems) {
							// 去重
							if (questionCaches.find((c) => c.title === item.title && c.answer === item.answer) === undefined) {
								questionCaches.unshift(item);
							}
						}

						// 限制数量
						questionCaches.splice(200);
						this.cfg.localQuestionCaches = questionCaches;
					},
					addQuestionCacheFromWorkResult(swr: SimplifyWorkResult[]) {
						BackgroundProject.scripts.data.methods.addQuestionCache(
							...swr
								.map((r) =>
									r.searchInfos
										.map((i) =>
											i.results
												.filter((res) => res[1])
												.map((res) => ({
													title: r.question,
													answer: res[1],
													from: i.name.replace(/【题库缓存】/g, ''),
													homepage: i.homepage || ''
												}))
												.flat()
										)
										.flat()
								)
								.flat()
						);
					},
					/**
					 * 将题库缓存作为题库并进行题目搜索
					 * @param title 题目
					 * @param whenSearchEmpty 当搜索结果为空，或者题库缓存功能被关闭时执行的函数
					 */
					searchAnswerInCaches: async (
						title: string,
						whenSearchEmpty: () => SearchInformation[] | Promise<SearchInformation[]>
					): Promise<SearchInformation[]> => {
						if (CommonProject.scripts.settings.cfg.enableQuestionCaches === false) {
							return await whenSearchEmpty();
						}

						let results: SearchInformation[] = [];
						const caches = this.cfg.localQuestionCaches;
						for (const cache of caches) {
							if (cache.title.trim() === title.trim()) {
								results.push({
									name: cache.from,
									homepage: cache.homepage,
									results: [{ answer: cache.answer, question: cache.title, extra_data: { ai: cache.ai, cache: true } }]
								});
							}
						}
						if (results.length === 0) {
							results = await whenSearchEmpty();
						}
						return results;
					},
					/**
					 * 展示题库缓存管理弹窗
					 */
					showQuestionCaches: () => {
						const questionCaches = this.cfg.localQuestionCaches;

						const list = questionCaches.map((c) =>
							h(
								'div',
								{
									className: 'question-cache',
									style: {
										margin: '8px',
										border: '1px solid lightgray',
										borderRadius: '4px',
										padding: '8px'
									}
								},
								[
									h('div', { className: 'title' }, [
										$ui.tooltip(
											h(
												'span',
												{
													title: `来自：${c.from || '未知题库'}\n主页：${c.homepage || '未知主页'}`,
													style: { fontWeight: 'bold' }
												},
												c.title
											)
										)
									]),
									h('div', { className: 'answer', style: { marginTop: '6px' } }, c.answer)
								]
							)
						);

						const countEl = h('span', ['当前缓存数量：' + questionCaches.length]);

						$modal.simple({
							width: 800,
							content: h('div', [
								h('div', { className: 'notes card' }, [
									$ui.notes([
										'题库缓存是将题库的题目和答案保存在内存，在重复使用时可以直接从内存获取，不需要再次请求题库。',
										'以下是当前存储的题库，默认存储200题，当前页面关闭后会自动清除。'
									])
								]),
								h('div', { className: 'card' }, [
									$ui.space(
										[
											countEl,
											$ui.button('清空题库缓存', {}, (btn) => {
												btn.onclick = () => {
													this.cfg.localQuestionCaches = [];
													countEl.innerText = '当前缓存数量：0';
													list.forEach((el) => el.remove());
												};
											})
										],
										{ separator: '|' }
									)
								]),

								h(
									'div',
									questionCaches.length === 0 ? [h('div', { style: { textAlign: 'center' } }, '暂无题库缓存')] : list
								)
							])
						});
					}
				};
			}
		}),
		appConfigSync: new Script({
			name: '🔄️ 软件配置同步',
			namespace: 'background.app',
			matches: [['所有页面', /./]],
			// 如果是在OCS软件中则不显示此页面
			hideInPanel: $gm.getInfos() === undefined,
			configs: {
				notes: {
					defaultValue: $ui.notes([
						[
							h('span', [
								'如果您使用',
								h('a', { href: 'https://docs.ocsjs.com/docs/app', target: '_blank' }, 'OCS桌面软件'),
								'启动浏览器，并使用此脚本，'
							]),
							'我们会同步软件中的配置到此脚本上，方便多个浏览器的管理。',
							'窗口设置以及后台面板所有设置不会进行同步。'
						],
						'如果不是，您可以忽略此脚本。'
					]).outerHTML
				},
				sync_status: {
					defaultValue: 'unconnect' as 'not_playwright_environment' | 'unconnect' | 'not_open_sync' | 'synced'
				},
				closeSync: {
					defaultValue: false,
					label: '关闭同步',
					attrs: {
						type: 'checkbox'
					}
				}
			},

			onrender({ panel }) {
				// 同步面板不会被锁定
				panel.lockWrapper.remove();
				panel.configsContainer.classList.remove('lock');

				const update = () => {
					if (this.cfg.closeSync) {
						const tip = h('div', { className: 'notes card' }, ['已关闭同步。']);
						panel.body.replaceChildren(h('hr'), tip);
					} else if (this.cfg.sync_status === 'synced') {
						const tip = h('div', { className: 'notes card' }, [`已成功同步软件中的配置.`]);
						panel.body.replaceChildren(h('hr'), tip);
					} else if (this.cfg.sync_status === 'unconnect') {
						const tip = h('div', { className: 'notes card' }, ['未同步软件配置，可能是桌面软件未启动。']);
						panel.body.replaceChildren(h('hr'), tip);
					} else if (this.cfg.sync_status === 'not_playwright_environment') {
						const tip = h('div', { className: 'notes card' }, ['当前浏览器不是由桌面端软件启动，无法同步配置。']);
						panel.body.replaceChildren(h('hr'), tip);
					} else if (this.cfg.sync_status === 'not_open_sync') {
						const tip = h('div', { className: 'notes card' }, ['桌面端软件未开启配置同步功能']);
						panel.body.replaceChildren(h('hr'), tip);
					} else if (this.cfg.sync_status === 'empty_config') {
						const tip = h('div', { className: 'notes card' }, ['已成功连接到软件，但配置为空。']);
						panel.body.replaceChildren(h('hr'), tip);
					} else {
						const tip = h('div', { className: 'notes card' }, ['同步状态未知，请稍后重试。']);
						panel.body.replaceChildren(h('hr'), tip);
					}
				};
				update();

				this.offConfigChange(state.app.listenerIds.sync);
				this.offConfigChange(state.app.listenerIds.connected);
				this.offConfigChange(state.app.listenerIds.closeSync);
				state.app.listenerIds.connected = this.onConfigChange('sync_status', update);
				state.app.listenerIds.closeSync = this.onConfigChange('closeSync', (closeSync) => {
					if (closeSync) {
						this.cfg.sync_status = 'not_open_sync';
						$message.success({ content: '已关闭同步，刷新页面后生效' });
					}
				});
			},
			async onactive() {
				if ($.isInTopWindow()) {
					if (this.cfg.closeSync) {
						$console.log('配置同步已关闭');
						return;
					}
					this.cfg.sync_status = 'unconnect';
					try {
						const res = await request('http://localhost:15319/browser', {
							type: 'GM_xmlhttpRequest',
							method: 'get',
							responseType: 'json'
						});
						if (!res) {
							this.cfg.sync_status = 'unconnect';
							return;
						}
						const open_sync = await request('http://localhost:15319/is-browser-config-sync', {
							type: 'GM_xmlhttpRequest',
							method: 'get',
							responseType: 'text'
						});

						if (open_sync !== 'true') {
							this.cfg.sync_status = 'not_open_sync';
							return;
						}

						if (Object.keys(res).length === 0) {
							this.cfg.sync_status = 'not_open_sync';
							return;
						}

						// 自OCS软件 2.8.21 版本后特殊字段，用于标记不进行同步的字段
						// 通过OCS playwright 启动的浏览器会自动返回数据
						// 不使用 http 防止某些 Content-Security-Policy 限制
						const environment_res = await request('/ocs-environment', {
							type: 'fetch',
							method: 'get'
						});
						const environment = environment_res?.environment;
						if (!environment || environment !== 'playwright') {
							this.cfg.sync_status = 'not_playwright_environment';
							return;
						}

						// 排除几个特殊的设置
						for (const key in res) {
							if (Object.prototype.hasOwnProperty.call(res, key)) {
								// 排除渲染脚本的设置
								if (RenderScript.namespace && key.startsWith(RenderScript.namespace)) {
									Reflect.deleteProperty(res, key);
								}
								// 排除后台脚本的设置
								for (const scriptKey in BackgroundProject.scripts) {
									if (Object.prototype.hasOwnProperty.call(BackgroundProject.scripts, scriptKey)) {
										const script: Script = Reflect.get(BackgroundProject.scripts, scriptKey);
										if (script.namespace && key.startsWith(script.namespace)) {
											Reflect.deleteProperty(res, key);
										}
									}
								}
							}
						}

						// 排除那些不用同步的配置
						for (const project of definedProjects()) {
							for (const key in project.scripts) {
								if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
									const script = project.scripts[key];
									for (const ck in script.configs) {
										if (Object.prototype.hasOwnProperty.call(script.configs, ck)) {
											if (script.configs[ck].extra?.appConfigSync === false) {
												Reflect.deleteProperty(res, $.namespaceKey(script.namespace, ck));
											}
										}
									}
								}
							}
						}

						// 同步所有的配置
						for (const key in res) {
							if (Object.prototype.hasOwnProperty.call(res, key)) {
								$store.set(key, res[key]);
							}
						}

						// 锁定面板
						for (const project of definedProjects()) {
							// 排除后台脚本的锁定
							if (project.name === BackgroundProject.name) {
								continue;
							}
							for (const key in project.scripts) {
								if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
									const script = project.scripts[key];
									const originalRender = script.onrender;
									// 重新定义渲染函数。在渲染后添加锁定面板的代码
									script.onrender = ({ panel, header }) => {
										originalRender?.({ panel, header });
										if (panel.configsContainer.children.length) {
											panel.configsContainer.classList.add('lock');
											panel.lockWrapper.style.width = (panel.configsContainer.clientWidth ?? panel.clientWidth) + 'px';
											panel.lockWrapper.style.height =
												(panel.configsContainer.clientHeight ?? panel.clientHeight) + 'px';
											panel.configsContainer.prepend(panel.lockWrapper);

											panel.lockWrapper.title =
												'🚫已同步OCS桌面版软件配置，如需修改请在桌面版软件的左侧栏设置-通用设置-OCS配置，中进行修改。\n\n或者前往脚本悬浮窗:后台-软件配置同步 关闭配置同步功能。\n\n可双击强制修改，并关闭同步配置';
											panel.lockWrapper = $ui.tooltip(panel.lockWrapper);
											panel.lockWrapper.addEventListener('dblclick', () => {
												panel.configsContainer.classList.remove('lock');
												panel.lockWrapper.remove();
												script.onrender = originalRender;
												$message.warn({
													content: '已解除配置同步，可正常修改配置。想开启同步请前往：后台-软件配置同步',
													duration: 10
												});
												this.cfg.closeSync = true;
												if (script.panel && script.header) {
													script.onrender?.({ panel: script.panel, header: script.header });
												}
											});
										}
									};
									// 重新执行渲染
									if (script.panel && script.header) {
										script.onrender({ panel: script.panel, header: script.header });
									}
								}
							}
						}

						this.cfg.sync_status = 'synced';
					} catch (e) {
						console.error(e);
						this.cfg.sync_status = 'unconnect';
						// 可能是桌面软件未启动，或者未开启配置同步功能，此时直接隐藏脚本面板，防止用户误操作
						this.hidePanel();
					}
				}
			}
		}),
		update: new Script({
			name: '📥 更新模块',
			matches: [['所有页面', /.*/]],
			namespace: 'background.update',
			configs: {
				notes: {
					defaultValue: '脚本自动更新模块，如果有新的版本会自动通知。'
				},
				autoNotify: {
					defaultValue: true,
					label: '开启更新通知',
					attrs: { type: 'checkbox', title: '当有最新的版本时自动弹窗通知，默认开启' }
				},
				notToday: {
					defaultValue: -1
				},
				ignoreVersions: {
					defaultValue: [] as string[]
				}
			},
			methods() {
				return {
					getLastVersion: async () => {
						return (await request('https://cdn.ocsjs.com/ocs-version.json?t=' + Date.now(), {
							method: 'get',
							type: 'GM_xmlhttpRequest'
						})) as { 'last-version': string; resource: Record<string, string>; notes: string[] };
					},
					/**
					 * 查看更新日志
					 */
					showChangelog: async () => {
						const changelog = h('div', {
							className: 'markdown card',
							innerHTML: '加载中...',
							style: { maxWidth: '600px' }
						});
						$modal.simple({
							width: 600,
							content: h('div', [
								h('div', { className: 'notes card' }, [
									$ui.notes(['此页面实时更新，遇到问题可以查看最新版本是否修复。'])
								]),
								changelog
							])
						});
						const md = await request('https://cdn.ocsjs.com/articles/ocs/changelog.md?t=' + Date.now(), {
							type: 'GM_xmlhttpRequest',
							responseType: 'text',
							method: 'get'
						});
						changelog.innerHTML = markdown(md);
					}
				};
			},
			async onrender({ panel }) {
				const version = await this.methods.getLastVersion();
				const infos = $gm.getInfos();

				if (!infos) {
					return;
				}

				const changeLog = h('button', { className: 'base-style-button-secondary' }, '📄查看更新日志');
				changeLog.onclick = () => this.methods.showChangelog();
				const updatePage = this.startConfig?.updatePage || '';
				panel.body.replaceChildren(
					h('div', { className: 'card' }, [
						h('hr'),
						h('div', ['最新版本：' + version['last-version'] + ' - ', changeLog]),
						h('hr'),
						h('div', '当前版本：' + infos.script.version),
						h('div', '脚本管理器：' + infos.scriptHandler),
						h('div', ['脚本更新链接：', h('a', { target: '_blank', href: updatePage }, [updatePage || '无'])])
					])
				);
				console.log('versions', {
					notToday: this.cfg.notToday,
					ignoreVersions: this.cfg.ignoreVersions,
					version: version
				});
			},
			oncomplete() {
				if (this.cfg.autoNotify && $.isInTopWindow()) {
					if (this.cfg.notToday === -1 || this.cfg.notToday !== new Date().getDate()) {
						const infos = $gm.getInfos();
						if (infos) {
							// 版本表达式验证
							if (!!semver_valid(infos.script.version) === false) {
								$message.error(`当前版本号 (${infos.script.version}) 不符合semver版本书写规范，请重新修改版本。`);
								return;
							}

							// 避免阻挡用户操作，这里等页面运行一段时间后再进行更新提示
							setTimeout(async () => {
								const version = await this.methods.getLastVersion();
								const last = version['last-version'];

								if (
									// 跳过主动忽略的版本
									this.cfg.ignoreVersions.includes(last) === false &&
									// 版本比较
									semver_gt(last, infos.script.version)
								) {
									const updatePage = this.startConfig?.updatePage || '';
									const modal = $modal.confirm({
										maskCloseable: false,
										width: 600,
										content: $ui.notes([`检测到新版本发布 ${last} ：`, [...(version.notes || [])]]),
										footer: h('div', [
											h('button', { className: 'base-style-button-secondary', innerText: '跳过此版本' }, (btn) => {
												btn.onclick = () => {
													this.cfg.ignoreVersions = [...this.cfg.ignoreVersions, last];
													modal?.remove();
												};
											}),
											h('button', { className: 'base-style-button-secondary', innerText: '今日不再提示' }, (btn) => {
												btn.onclick = () => {
													this.cfg.notToday = new Date().getDate();
													modal?.remove();
												};
											}),
											h('button', { className: 'base-style-button', innerText: '前往更新' }, (btn) => {
												btn.onclick = () => {
													if (updatePage) {
														window.open(updatePage, '_blank');
														modal?.remove();
													} else {
														$message.error({ content: '无法前往更新页面，更新链接为空' });
													}
												};
											})
										])
									});
								}
							}, 5 * 1000);
						}
					}
				}
			}
		}),
		dev: new Script({
			name: '🛠️ 开发者调试',
			namespace: 'background.dev',
			matches: [['所有页面', /./]],
			onstart() {
				if (self !== top) return;

				// 默认隐藏开发者相关面板，监听开发者工具（F12）打开后再显示
				const devScripts = [this, BackgroundProject.scripts.requestList];
				for (const script of devScripts) {
					script.hidePanel();
				}
				onDevtoolsOpen(() => {
					for (const script of devScripts) {
						script.showPanel();
					}
					$message.info({ content: '检测到开发者工具已打开，已显示 开发者调试/请求记录 面板。', duration: 5 });
				});
			},
			configs: {
				notes: {
					defaultValue: '开发人员调试用。<br>注入OCS_CONTEXT全局变量。用户可忽略此页面。'
				},
				show_debug_cursor: {
					defaultValue: true,
					label: '软件辅助点击时显示鼠标位置',
					attrs: { type: 'checkbox' }
				},
				enable_answerer_debug: {
					defaultValue: true,
					label: '开启答题日志输出',
					attrs: { type: 'checkbox' }
				}
			},
			methods() {
				return {
					getRemotePlaywrightCurrentPage: () => {
						return RemotePlaywright.getRemotePage(this.cfg.show_debug_cursor, console.debug);
					}
				};
			},
			onrender({ panel }) {
				const injectBtn = h('button', { className: 'base-style-button' }, '点击注入全局变量');
				injectBtn.addEventListener('click', () => {
					$gm.unsafeWindow.OCS_CONTEXT = self;
				});

				const showTabDataBtn = h('button', { className: 'base-style-button' }, '显示Tab存储');
				$gm.getTab((tab) => {
					const els: HTMLElement[] = [];
					for (const key in tab) {
						if (Object.prototype.hasOwnProperty.call(tab, key)) {
							els.push(h('div', [h('b', key + ' : '), h('code', JSON.stringify(tab[key]))]));
						}
					}
					showTabDataBtn.addEventListener('click', () => {
						$modal.simple({
							content: h('div', els),
							width: window.document.documentElement.clientWidth / 2
						});
					});
				});

				panel.body.replaceChildren(h('div', { className: 'card' }, [h('hr'), injectBtn, showTabDataBtn]));
			}
		}),
		appLoginHelper: new Script({
			name: '软件登录辅助',
			matches: [
				['超星登录', 'passport2.chaoxing.com/login'],
				['智慧树登录', 'passport.zhihuishu.com/login'],
				['职教云登录', 'zjy2.icve.com.cn/portal/login.html'],
				['智慧职教登录', 'sso.icve.com.cn/sso/auth']
			],
			hideInPanel: true,
			oncomplete() {
				// 将面板移动至左侧顶部，防止挡住软件登录
				if ($.isInTopWindow()) {
					$render.moveToEdge();
				}
			}
		}),

		errorHandle: new Script({
			name: '全局错误捕获',
			matches: [['', /.*/]],
			hideInPanel: true,
			onstart() {
				const projects = definedProjects();
				for (const project of projects) {
					for (const key in project.scripts) {
						if (Object.prototype.hasOwnProperty.call(project.scripts, key)) {
							const script = project.scripts[key];
							script.on('scripterror', (err) => {
								const msg = `[${project.name} - ${script.name}] : ${err}`;
								console.error(msg);
								$console.error(msg);
							});
						}
					}
				}
			}
		}),
		requestList: new Script({
			name: '📄 请求记录',
			matches: [['', /.*/]],
			priority: 99,
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'开发人员请求调试记录页面，小白勿入，最多只记录最近的100个请求数据',
						'可打开F12控制台查看请求日志，或者下方的请求列表'
					]).outerHTML
				},
				enable: {
					label: '开启请求记录',
					attrs: { type: 'checkbox' },
					defaultValue: false
				},
				methodFilter: {
					label: '方法过滤',
					tag: 'select',
					attrs: { placeholder: '选择选项' },
					options: [['none', '无'], ['GET'], ['POST'], ['OPTIONS'], ['HEAD']],
					defaultValue: 'none'
				},
				typeFilter: {
					label: '类型过滤',
					tag: 'select',
					attrs: { placeholder: '选择选项' },
					options: [
						['none', '无'],
						['gmxhr', '油猴API请求（gmxhr）'],
						['fetch', '普通请求（fetch）']
					],
					defaultValue: 'none'
				},
				searchValue: {
					label: '内容搜索',
					attrs: { placeholder: '搜索 URL/请求体/响应' },
					defaultValue: ''
				},
				list: {
					defaultValue: [] as RequestList
				}
			},
			methods() {
				const render = (list: RequestList) => {
					this.panel?.body.replaceChildren();
					this.panel?.body.append(
						h('div', { className: 'card' }, [
							h('div', { style: { padding: '8px 0px', textAlign: 'end' } }, [
								h(
									'button',
									{
										className: 'base-style-button-secondary',
										style: { marginRight: '12px' },
										innerText: '🗑️清空记录'
									},
									(btn) => {
										btn.onclick = () => {
											this.cfg.list = [];
											render(this.cfg.list);
										};
									}
								),
								h('button', { className: 'base-style-button', innerText: '🔍执行搜索' }, (btn) => {
									btn.onclick = () => {
										if (
											this.cfg.methodFilter === 'none' &&
											this.cfg.typeFilter === 'none' &&
											this.cfg.searchValue === ''
										) {
											render(this.cfg.list);
										} else {
											const list = this.cfg.list
												.filter((item) => {
													if (
														this.cfg.methodFilter !== 'none' &&
														item.method.toLowerCase() !== this.cfg.methodFilter.toLowerCase()
													) {
														return false;
													}
													return true;
												})
												.filter((item) => {
													if (this.cfg.typeFilter !== 'none' && item.type !== this.cfg.typeFilter) {
														return false;
													}
													return true;
												})
												.filter((item) => {
													if (
														(this.cfg.searchValue && item.url.includes(this.cfg.searchValue)) ||
														item.data?.includes(this.cfg.searchValue) ||
														item.response?.includes(this.cfg.searchValue)
													) {
														return true;
													}

													return false;
												});
											render(list);
										}
									};
								})
							]),
							h(
								'div',
								{ style: { backgroundColor: '#292929', overflow: 'auto', maxHeight: window.innerHeight / 2 + 'px' } },
								[
									...(list.length === 0
										? [h('div', { style: { color: 'white', textAlign: 'center' } }, '暂无数据')]
										: []),
									...list.map((item) =>
										// @ts-ignore
										h(
											'div',
											{
												title: Object.entries(item)
													.map(([key, val]) =>
														key === 'time'
															? `${key} : ${new Date(val).toLocaleString().replace(/\//g, '-')}`
															: `${key} : ${val}`
													)
													.join('\n'),
												style: {
													maxWidth: '800px',
													padding: '4px 0px',
													margin: '4px 0px',
													// @ts-ignore
													textWrap: 'nowrap'
												}
											},
											[
												h('div', [
													h('span', { style: { marginRight: '8px' } }, new Date(item.time).toLocaleTimeString()),
													h(
														'span',
														{
															style: {
																backgroundColor: '#2196f3a3',
																color: '#ececec',
																marginRight: '8px',
																padding: '0px 2px'
															}
														},
														item.method
													),
													h(
														'span',
														{ style: { color: item.response ? '#4eb74e' : '#eb6262', marginRight: '8px' } },
														'●'
													),
													h(
														'div',
														{ style: { display: 'inline-block', color: '#ececec' } },
														item.url ? (item.url.length > 100 ? item.url.slice(0, 100) + '...' : item.url) : '-'
													)
												]),
												h(
													'div',
													{ style: { overflow: 'hidden', fontSize: '12px', color: '#8f8f8f' } },
													item.data ? 'data: ' + item.data : ''
												),
												h(
													'div',
													{ style: { overflow: 'hidden', fontSize: '12px', color: '#8f8f8f' } },
													item.response ? 'resp: ' + item.response : item.error ? 'err : ' + item.error : ''
												)
											]
										)
									)
								]
							)
						])
					);
				};
				return {
					render: render
				};
			},
			onrender() {
				this.methods.render(this.cfg.list);
			},
			onstart() {
				// 兼容其他环境
				if ($gm.isInGMContext() === false) {
					return;
				}
				/* global GM_xmlhttpRequest  RequestInfo RequestInit */
				/* eslint-disable no-global-assign */
				const gmRequest = GM_xmlhttpRequest;
				const originalFetch = fetch;

				const getId = () => Math.random().toString(16).slice(2);

				const addRecord = (item: (typeof this.cfg.list)[number]) => {
					this.cfg.list = [item, ...this.cfg.list];
					if (this.cfg.list.length > 100) {
						this.cfg.list = this.cfg.list.slice(0, 100);
					}
				};

				const setItem = (id: string, response: string | undefined, error: string | undefined) => {
					const list: typeof this.cfg.list = JSON.parse(JSON.stringify(this.cfg.list));
					const index = list.findIndex((item) => item.id === id);
					if (index !== -1) {
						list[index].response = response;
						list[index].error = error;
					}
					this.cfg.list = list;
				};

				// @ts-ignore
				GM_xmlhttpRequest = (details: any) => {
					if (this.cfg.enable) {
						const id = getId();
						const data = {
							id: id,
							url: details.url,
							method: details.method || 'unknown',
							type: 'gmxhr',
							data: details.data,
							headers: details.headers,
							response: '',
							error: '',
							time: Date.now()
						};
						addRecord(data);
						const onload = details.onload;
						const onerror = details.onerror;

						details.onload = function (response: any) {
							setItem(id, response.responseText, '');
							data.response = details.responseType === 'json' ? response.response : response.responseText;
							console.log('%c [请求成功]', 'color: green; font-weight: bold', data.url, data);
							onload?.apply(this, [response]);
						};
						details.onerror = function (response: any) {
							setItem(id, '', response.error);
							data.error = response.error;
							console.log('%c [请求失败]', 'color: red; font-weight: bold', data.url, data);
							onerror?.apply(this, [response]);
						};
					}

					return gmRequest.apply(this, [details as any]);
				};
				// @ts-ignore
				fetch = (input: URL | RequestInfo, init?: RequestInit | undefined) => {
					if (this.cfg.enable) {
						const id = getId();
						const data = {
							id: id,
							url: typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
							method: init?.method || 'unknown',
							type: 'fetch',
							data: init?.body,
							headers: init?.headers,
							response: '',
							error: '',
							time: Date.now()
						};
						addRecord(data);
						const res = originalFetch.apply(this, [input, init]);
						res
							.then((result) => {
								return result.clone().text();
							})
							.then((result) => {
								setItem(id, result, '');
								data.response = result;
								console.log('%c [请求成功]', 'color: green; font-weight: bold', data.url, data);
							});

						res.catch((err) => {
							setItem(id, '', String(err));
							data.error = String(err);
							console.log('%c [请求失败]', 'color: red; font-weight: bold', data.url, data);
						});
						return res;
					} else {
						return originalFetch.apply(this, [input, init]);
					}
				};
			}
		}),
		environmentDetect: new Script({
			name: '🤖 环境检测',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			oncomplete() {
				if (self !== top) return;

				const matches = [
					CXProject.scripts.studyDispatcher.matches,
					ZHSProject.scripts['gxk-study'].matches,
					ZHSProject.scripts.hike.matches,
					ZHSProject.scripts['smart-study'].matches,
					ZHSProject.scripts['wisdom-study'].matches,
					ZHSProject.scripts['xnk-study'].matches,
					ICourseProject.scripts.study.matches,
					IcveMoocProject.scripts.study.matches,
					ZJYProject.scripts.study.matches
				]
					.flat()
					.map((m) => (Array.isArray(m) ? m[1] : m));

				const url = window.location.href;
				const match = matches.some((regex) => {
					return typeof regex === 'string' ? url.includes(regex) : regex.test(url);
				});
				if (!match) {
					return;
				}

				let messageElement: MessageElement | undefined;
				visibleDetect();

				function visibleDetect() {
					setTimeout(() => {
						if (!messageElement?.isConnected) messageElement = undefined;

						if (document.visibilityState === 'hidden' && !messageElement) {
							messageElement = $message.warn({
								content:
									'⚠️检测到浏览器最小化/切屏，脚本可能无法正常运行，请保持网课页面在前台！（如果您正在全屏游戏中可以忽略此警告）',
								duration: 0
							});
						}
						visibleDetect();
					}, 1000);
				}
			}
		}),
		menus: new Script({
			name: '📁 菜单管理',
			hideInPanel: true,
			matches: [['所有页面', /.*/]],
			async oncomplete() {
				// 注册快捷菜单
				await $menu('🏠', { scriptPanelLink: CommonProject.scripts.guide });
				await $menu('🔎', { scriptPanelLink: CommonProject.scripts.workResults });
				await $menu('⚙️', { scriptPanelLink: CommonProject.scripts.settings });
				await $menu('📄', { scriptPanelLink: BackgroundProject.scripts.console });

				const currentStudyScript = [
					[CXProject.scripts.studyDispatcher, CXProject.scripts.study],
					CXProject.scripts.work,
					CXProject.scripts.autoRead,
					ZHSProject.scripts['study-center'],
					ZHSProject.scripts['work-center'],
					[ICourseProject.scripts.dispatcher, ICourseProject.scripts.study],
					ICourseProject.scripts.work,
					[ZJYProject.scripts.dispatcher, ZJYProject.scripts.study],
					ZJYProject.scripts.work,
					IcveMoocProject.scripts.study,
					IcveMoocProject.scripts.work,
					YKTProject.scripts.ai,
					YKTProject.scripts.v2_study
				]
					.map((m) => {
						const url = window.location.href;

						const data = {
							matches: Array.isArray(m) ? m[0].matches : m.matches,
							target: Array.isArray(m) ? m[1] : m
						};

						if (
							data.matches.some((regexp) => {
								const r = Array.isArray(regexp) ? regexp[1] : regexp;
								return typeof r === 'string' ? url.includes(r) : r.test(url);
							})
						) {
							return data.target;
						}

						return undefined;
					})
					.find((m) => m !== undefined);

				if (currentStudyScript) {
					// 注册当前学习脚本的快捷菜单
					await $menu('🖥️', { scriptPanelLink: currentStudyScript });
					// 置顶面板
					BackgroundProject.scripts.render.methods.pin(currentStudyScript);
				}
			}
		})
	}
});

type Console = Record<LogType, (...msg: any[]) => void>;

/** 日志对象，存储日志并显示在日志面板 */
export const $console: Console = new Proxy({} as Console, {
	get(target, key) {
		return (...msg: any[]) => {
			let logs = BackgroundProject.scripts.console.cfg.logs;
			if (logs.length > 50) {
				logs = logs.slice(-50);
			}

			const stack_str = Error().stack || '';

			// 简化堆栈信息
			const stacks = stack_str
				.replace('Error', '')
				.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/g)
				?.map((s) => {
					const match = s.match(/at (.*) \(.+:\/\/.+:(.+):(.+)\)/) || [];
					return [match[1], match[2], match[3]];
				});

			logs = logs.concat({
				type: key.toString() as LogType,
				content: msg.join(' '),
				time: Date.now(),
				stack: JSON.stringify([stack_str.split('\n')[0], ...(stacks || [])])
			});

			BackgroundProject.scripts.console.cfg.logs = logs;
		};
	}
});
