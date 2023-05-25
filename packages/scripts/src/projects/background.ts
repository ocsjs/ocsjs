import {
	$,
	$creator,
	$gm,
	$message,
	$modal,
	$store,
	Project,
	RenderScript,
	Script,
	StoreListenerType,
	el,
	request
} from '@ocsjs/core';
import gt from 'semver/functions/gt';
import { CommonProject } from './common';
import { definedProjects } from '..';

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

/** 后台进程，处理与PC软件端的通讯，以及其他后台操作 */
export const BackgroundProject = Project.create({
	name: '后台',
	domains: [],
	scripts: {
		console: new Script({
			name: '📄 日志输出',
			url: [['所有', /.*/]],
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
					const item = el(
						'div',
						{
							title: '双击复制日志信息',
							className: 'item'
						},
						[
							el(
								'span',
								{ className: 'time' },
								`${date.getHours().toFixed(0).padStart(2, '0')}:${date.getMinutes().toFixed(0).padStart(2, '0')} `
							),
							el('span', { className: log.type }, `[${getTypeDesc(log.type)}]`),
							el('span', ':' + log.content)
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
					const div = el('div', { className: 'card console' });

					const logs = this.cfg.logs.map((log) => createLog(log));
					if (logs.length) {
						div.replaceChildren(...logs);
					} else {
						div.replaceChildren(
							el('div', '暂无任何日志', (div) => {
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
		app: new Script({
			name: '🔄️ 软件配置同步',
			namespace: 'background.app',
			url: [['所有页面', /./]],
			// 如果是在OCS软件中则不显示此页面
			hideInPanel: $gm.getInfos() === undefined,
			configs: {
				notes: {
					defaultValue: $creator.notes([
						[
							el('span', [
								'如果您使用',
								el('a', { href: 'https://docs.ocsjs.com/docs/app', target: '_blank' }, 'OCS桌面软件'),
								'启动浏览器，并使用此脚本，'
							]),
							'我们会同步软件中的配置到此脚本上，方便多个浏览器的管理。',
							'窗口设置以及后台面板所有设置不会进行同步。'
						],
						'如果不是，您可以忽略此脚本。'
					]).outerHTML
				},
				sync: {
					defaultValue: false
				},
				connected: {
					defaultValue: false
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
					if (this.cfg.sync) {
						const tip = el('div', { className: 'notes card' }, [`已成功同步软件中的配置.`]);
						panel.body.replaceChildren(el('hr'), tip);
					} else if (this.cfg.connected) {
						const tip = el('div', { className: 'notes card' }, [`已成功连接到软件，但配置为空。`]);
						panel.body.replaceChildren(el('hr'), tip);
					}
				};
				update();

				this.offConfigChange(state.app.listenerIds.sync);
				this.offConfigChange(state.app.listenerIds.connected);
				this.offConfigChange(state.app.listenerIds.closeSync);
				state.app.listenerIds.sync = this.onConfigChange('sync', update);
				state.app.listenerIds.connected = this.onConfigChange('connected', update);
				state.app.listenerIds.closeSync = this.onConfigChange('closeSync', (closeSync) => {
					if (closeSync) {
						this.cfg.sync = false;
						this.cfg.connected = false;
						$message('success', { content: '已关闭同步，刷新页面后生效' });
					}
				});
			},
			async oncomplete() {
				if ($.isInTopWindow() && this.cfg.closeSync === false) {
					this.cfg.sync = false;
					try {
						const res = await request('http://localhost:15319/browser', {
							type: 'GM_xmlhttpRequest',
							method: 'get',
							responseType: 'json'
						});

						this.cfg.connected = true;

						if (res && Object.keys(res).length) {
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

							// 同步所有的配置
							for (const key in res) {
								if (Object.prototype.hasOwnProperty.call(res, key)) {
									$store.set(key, res[key]);
								}
							}

							// 锁定面板
							for (const projects of definedProjects()) {
								for (const key in projects.scripts) {
									if (Object.prototype.hasOwnProperty.call(projects.scripts, key)) {
										const script = projects.scripts[key];
										const originalRender = script.onrender;
										// 重新定义渲染函数。在渲染后添加锁定面板的代码
										script.onrender = ({ panel, header }) => {
											originalRender?.({ panel, header });
											if (panel.configsContainer.children.length) {
												panel.configsContainer.classList.add('lock');
												panel.lockWrapper.style.width =
													(panel.configsContainer.clientWidth || panel.clientWidth) + 'px';
												panel.lockWrapper.style.height =
													(panel.configsContainer.clientHeight || panel.clientHeight) + 'px';
												panel.configsContainer.prepend(panel.lockWrapper);

												panel.lockWrapper.title =
													'🚫已同步OCS软件配置，如需修改请在软件设置中修改。或者前往 后台-软件配置同步 关闭配置同步。';
												panel.lockWrapper = $creator.tooltip(panel.lockWrapper);
											}
										};
										// 重新执行渲染
										if (script.panel && script.header) {
											script.onrender({ panel: script.panel, header: script.header });
										}
									}
								}
							}

							this.cfg.sync = true;
						}
					} catch {
						this.cfg.sync = false;
						this.cfg.connected = false;
					}
				}
			}
		}),
		dev: new Script({
			name: '🛠️ 开发者调试',
			namespace: 'background.dev',
			url: [['所有页面', /./]],
			configs: {
				notes: {
					defaultValue: '开发人员调试用。<br>注入OCS_CONTEXT全局变量。用户可忽略此页面。'
				}
			},
			onrender({ panel }) {
				const injectBtn = el('button', { className: 'base-style-button' }, '点击注入全局变量');
				injectBtn.addEventListener('click', () => {
					$gm.unsafeWindow.OCS_CONTEXT = self;
				});
				panel.body.replaceChildren(el('div', { className: 'card' }, [injectBtn]));
			}
		}),
		appLoginHelper: new Script({
			name: '软件登录辅助',
			url: [
				['超星登录', 'passport2.chaoxing.com/login'],
				['智慧树登录', 'passport.zhihuishu.com/login'],
				['职教云登录', 'zjy2.icve.com.cn/portal/login.html'],
				['智慧职教登录', 'sso.icve.com.cn/sso/auth']
			],
			hideInPanel: true,
			oncomplete() {
				// 将面板移动至左侧顶部，防止挡住软件登录
				if ($.isInTopWindow()) {
					CommonProject.scripts.render.cfg.x = 40;
					CommonProject.scripts.render.cfg.y = 60;
					CommonProject.scripts.render.cfg.visual = 'minimize';
				}
			}
		}),
		update: new Script({
			name: '脚本更新检测',
			url: [['所有页面', /.*/]],
			hideInPanel: true,
			namespace: 'background.update',
			configs: {
				notToday: {
					defaultValue: -1
				}
			},
			oncomplete() {
				if ($.isInTopWindow()) {
					if (this.cfg.notToday === -1 || this.cfg.notToday !== new Date().getDate()) {
						const infos = $gm.getInfos();
						if (infos) {
							// 避免阻挡用户操作，这里等页面运行一段时间后再进行更新提示
							setTimeout(async () => {
								const version: { 'last-version': string; resource: Record<string, string>; notes: string[] } =
									await request('https://cdn.ocsjs.com/ocs-version.json?t=' + Date.now(), {
										method: 'get',
										type: 'GM_xmlhttpRequest'
									});
								if (gt(version['last-version'], infos.script.version)) {
									const modal = $modal('confirm', {
										width: 600,
										content: $creator.notes([
											`检测到新版本发布 ${version['last-version']} ：`,
											[...(version.notes || [])]
										]),
										cancelButton: el(
											'button',
											{ className: 'base-style-button-secondary', innerText: '今日不再提示' },
											(btn) => {
												btn.onclick = () => {
													this.cfg.notToday = new Date().getDate();
													modal?.remove();
												};
											}
										),
										confirmButton: el('button', { className: 'base-style-button', innerText: '前往更新' }, (btn) => {
											btn.onclick = () => {
												window.open(version.resource[infos.scriptHandler], '_blank');
												modal?.remove();
											};
										})
									});
								}
							}, 5 * 1000);
						}
					}
				}
			}
		}),
		errorHandle: new Script({
			name: '全局错误捕获',
			url: [['', /.*/]],
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
			logs = logs.concat({
				type: key.toString() as LogType,
				content: msg.join(' '),
				time: Date.now(),
				stack: (Error().stack || '').replace('Error', '')
			});

			BackgroundProject.scripts.console.cfg.logs = logs;
		};
	}
});
