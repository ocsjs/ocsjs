import { getDefinedProjects } from '.';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getAllRawConfigs } from '../utils/common';
import cloneDeep from 'lodash/cloneDeep';
import { $message, $model } from './init';
import { el } from '../utils/dom';
import { getValue, notification, setValue } from '../utils/tampermonkey';
import { parseAnswererWrappers } from '../core/utils/common';
import { AnswererWrapper, defaultAnswerWrapperHandler } from '../core/worker/answer.wrapper.handler';
import debounce from 'lodash/debounce';

export const CommonProject: Project = {
	name: '通用',
	domains: [],
	scripts: [
		new Script({
			name: '在线搜题',
			url: [/.*/],
			namespace: 'common.online-search',
			configs: {
				notes: {
					defaultValue: '查题前请在 “通用-全局设置” 中设置题库配置，才能进行在线搜题。'
				},
				selectSearch: {
					label: '划词搜索',
					defaultValue: true,
					attrs: { type: 'checkbox', title: '使用鼠标滑动选择页面中的题目进行搜索。' }
				},
				selection: {
					defaultValue: ''
				}
			},
			oncomplete() {
				if (this.cfg.selectSearch) {
					document.addEventListener(
						'selectionchange',
						debounce(function () {
							setValue('common.online-search.selection', document.getSelection()?.toString() || '');
						}, 500)
					);
				}
			},
			onrender({ panel }) {
				const content = el('div', '请输入题目进行搜索：', (content) => {
					content.style.marginBottom = '12px';
				});
				const input = el('input', { placeholder: '请尽量保证题目完整，不要漏字哦。' }, (input) => {
					input.className = 'base-style-input';
					input.style.flex = '1';
				});

				const search = async (value: string) => {
					content.replaceChildren(el('span', '搜索中...'));

					if (value) {
						const t = Date.now();
						const results = await defaultAnswerWrapperHandler(getValue('common.settings.answererWrappers'), {
							title: value
						});
						// 耗时计算
						const resume = ((Date.now() - t) / 1000).toFixed(2);

						content.replaceChildren(
							el(
								'div',
								[
									el('div', `搜索到 ${results.map((r) => r.answers).flat().length} 个结果，共耗时 ${resume} 秒`),
									el('search-results-element', { results: results, question: value })
								],
								(div) => {
									div.style.width = '400px';
								}
							)
						);
					} else {
						content.replaceChildren(el('span', '题目不能为空！'));
					}
				};

				const button = el('button', '搜索', (button) => {
					button.className = 'base-style-button';
					button.onclick = () => {
						search(input.value);
					};
				});
				const searchContainer = el('div', [input, button], (div) => {
					div.style.display = 'flex';
				});

				// 监听划词变化
				this.onConfigChange('selection', (curr) => {
					// 判断是否处于搜索页面，搜索框可见
					if (input.isConnected) {
						input.value = curr;
					}
				});

				panel.body.append(
					el('div', [el('hr'), content, searchContainer], (div) => {
						div.className = 'card';
					})
				);
			}
		}),
		new Script({
			name: '全局设置',
			url: [/.*/],
			namespace: 'common.settings',
			configs: {
				notification: {
					label: '开启系统通知',
					defaultValue: true,
					attrs: {
						title:
							'允许脚本发送系统通知，只有重要事情发生时会发送系统通知，尽量避免用户受到骚扰（在电脑屏幕右侧显示通知弹窗，例如脚本执行完毕，版本更新等通知）。',
						type: 'checkbox'
					}
				},
				answererWrappers: {
					defaultValue: []
				},

				answererWrappersButton: {
					label: '题库配置',
					defaultValue: '点击配置',
					attrs: {
						type: 'button'
					},
					onload() {
						const aws: any[] = getValue('common.settings.answererWrappers');
						this.value = `点击重新配置${aws.length ? '，当前有' + aws.length + '个可用题库' : ''}`;

						this.onclick = () => {
							const aw: any[] = getValue('common.settings.answererWrappers');
							const list = el('div', [
								el('div', aw.length ? '以下是已经解析过的题库配置:' : ''),
								...createAnswererWrapperList(aw)
							]);

							const model = $model('prompt', {
								content: el('div', {
									innerHTML:
										'具体配置教程，请查看官网的 <a href="https://docs.ocsjs.com/docs/work" target="_blank">"自动答题教程"</a>' +
										list.innerHTML
								}).innerHTML,
								placeholder: aw.length ? '重新输入' : '输入题库配置',
								cancelButton: el('button', {
									className: 'model-cancel-button',
									innerText: '清空题库配置',
									onclick() {
										$message('success', { content: '已清空，在答题前请记得重新配置。' });
										model?.remove();
										setValue('common.settings.answererWrappers', []);
									}
								}),
								async onConfirm(value) {
									if (value) {
										try {
											const aw = await parseAnswererWrappers(value);
											setValue('common.settings.answererWrappers', aw);
											$model('alert', {
												content: el('div', [
													el('div', '配置成功，打开具有答题脚本的页面后即可自动答题，解析到的题库如下所示:'),
													...createAnswererWrapperList(aw)
												])
											});
										} catch (e: any) {
											$model('alert', {
												content: el('div', [el('div', '解析失败，原因如下 :'), el('div', e.message)])
											});
										}
									} else {
										$model('alert', {
											content: el('div', '不能为空！')
										});
									}
								}
							});
						};
					}
				},
				period: {
					label: '答题间隔（秒）',
					attrs: { min: '3', step: '1', max: '60', title: '每道题的间隔时间，不建议太低，避免增加服务器压力。' },
					defaultValue: 3
				},
				timeout: {
					label: '处理超时时间（秒）',
					attrs: { min: '10', step: '1', max: '60', title: '每道题最多做n秒, 超过则跳过此题。' },
					defaultValue: 30
				},
				retry: {
					label: '超时重试次数',
					attrs: { min: '0', step: '1', max: '3' },
					defaultValue: 1
				}
			},
			onactive() {
				this.onConfigChange('notification', (curr) => {
					if (curr) {
						notification('您已开启系统通知，如果脚本有重要情况需要处理，则会发起通知提示您。', {
							duration: 5
						});
					}
				});
			}
		}),
		new Script({
			name: '使用教程',
			url: [/.*/],
			namespace: 'common.guide',
			configs: {
				notes: {
					defaultValue: ''
				},
				showGuide: { defaultValue: true, label: '显示使用教程', attrs: { type: 'checkbox' } }
			},

			onrender({ panel, header }) {
				const projectSelector = header.projectSelector?.cloneNode(true) as HTMLSelectElement;
				const logo = header.logo?.cloneNode(true) as HTMLDivElement;
				const expandSwitcher = header.expandSwitcher?.cloneNode(true) as HTMLDivElement;
				const visualSwitcher = header.visualSwitcher?.cloneNode(true) as HTMLDivElement;
				const closeButton = header.closeButton?.cloneNode(true) as HTMLDivElement;

				const guide = el('div', [
					el('ol', { className: 'user-guide' }, [
						el('li', [
							'OCS会根据当前的页面自动选择脚本进行运行，如果没有达到您预期的效果，则代表当前页面并没有脚本运行。',
							'以下是全部支持的网课以及包含的脚本（点击下列详情展开查看）:'
						]),
						...getDefinedProjects().map((project) => {
							return el('details', [
								el('summary', project.name),
								el(
									'ul',
									project.scripts.map((script) =>
										el('li', [
											el(
												'span',
												{
													title: [
														'隐藏操作页面:\t' + (script.hideInPanel ? '是' : '否'),
														'在以下页面中运行:\t' + script.url.join(',')
													].join('\n')
												},
												script.name
											)
										])
									),
									(ul) => {
										ul.style.paddingLeft = '42px';
									}
								)
							]);
						}),

						el('li', '以下是窗口顶部菜单栏的按钮说明:', [
							el('ul', { className: 'user-guide' }, [
								el('li', [
									projectSelector || '',
									' ',
									'菜单栏的选择框，可选择脚本操作页面，部分脚本会提供操作页面（包含脚本设置和脚本提示）。'
								]),
								el('li', [logo || '', ' ', '点击查看官网教程']),
								el('li', [expandSwitcher || '', ' ', '可以 展开/收缩 脚本操作页面。']),
								el('li', [visualSwitcher || '', ' ', '可以 最小化/展开 窗口。']),
								el('li', [closeButton || '', ' ', closeButton?.title || closeButton.getAttribute('data-title') || ''])
							])
						]),

						el('li', '最后温馨提示：请将浏览器页面保持最大化，或者缩小窗口，不能最小化，可能导致脚本卡死！')
					])
				]);
				this.cfg.notes = guide.outerHTML;

				if (this.cfg.showGuide) {
					$model('confirm', {
						title: '使用教程',
						content: panel.notesContainer.outerHTML || '',
						confirmButtonText: '我已阅读，不再提示',
						onConfirm: () => {
							this.cfg.showGuide = false;
						}
					});
				}
			}
		}),
		new Script({
			name: '开发者调试页面',
			// 使用时从打包中的代码修改此处为 true
			hideInPanel: true,
			url: [/.*/],
			configs: () => {
				const configs = cloneDeep(
					getAllRawConfigs(
						getDefinedProjects()
							.map((p) => p.scripts)
							.flat()
							.filter((s) => s.name !== '开发者调试页面')
					)
				);

				for (const key in configs) {
					if (Object.prototype.hasOwnProperty.call(configs, key)) {
						const element = configs[key];
						element.sync = true;
						element.attrs = element.attrs || {};
						element.attrs.disabled = true;
					}
				}
				return configs;
			}
		}),
		new Script({
			name: '页面复制粘贴限制解除脚本',
			url: [/.*/],
			hideInPanel: true,
			onactive() {
				enableCopy();
			},
			oncomplete() {
				enableCopy();
				setTimeout(() => enableCopy(), 3000);
			}
		})
	]
};

function enableCopy() {
	try {
		const d = document;
		const b = document.body;
		d.onselectstart = d.oncopy = d.onpaste = d.onkeydown = d.oncontextmenu = () => true;
		b.onselectstart = b.oncopy = b.onpaste = b.onkeydown = b.oncontextmenu = () => true;
	} catch (err) {
		console.error('页面复制粘贴功能开启失败', err);
	}

	const style = document.createElement('style');
	style.innerHTML = `
		html * {
		  -webkit-user-select: text !important;
		  -khtml-user-select: text !important;
		  -moz-user-select: text !important;
		  -ms-user-select: text !important;
		  user-select: text !important;
		}`;

	document.body.appendChild(style);
}

function createAnswererWrapperList(aw: AnswererWrapper[]) {
	return aw.map((item) =>
		el(
			'details',
			[
				el('summary', [item.name]),
				el('ul', [
					el('li', ['名字\t', item.name]),
					el('li', { innerHTML: `官网\t<a target="_blank" href=${item.homepage}>${item.homepage || '无'}</a>` }),
					el('li', ['接口\t', item.url]),
					el('li', ['请求方法\t', item.method]),
					el('li', ['请求类型\t', item.type]),
					el('li', ['请求头\t', JSON.stringify(item.headers, null, 4) || '无']),
					el('li', ['请求体\t', JSON.stringify(item.data, null, 4) || '无'])
				])
			],
			(details) => {
				details.style.paddingLeft = '12px';
			}
		)
	);
}
