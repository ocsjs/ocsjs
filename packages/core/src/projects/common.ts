import { getDefinedProjects } from '.';
import { Project } from '../interfaces/project';
import { Script } from '../interfaces/script';
import { getAllRawConfigs } from '../utils/common';
import cloneDeep from 'lodash/cloneDeep';
import { $message, $model } from './init';
import { el } from '../utils/dom';
import { notification } from '../utils/tampermonkey';
import { parseAnswererWrappers } from '../core/utils/common';
import { AnswererWrapper, defaultAnswerWrapperHandler } from '../core/worker/answer.wrapper.handler';
import debounce from 'lodash/debounce';
import { WorkResult } from '../core/worker/interface';
import { $creator } from '../utils/creator';

export const CommonProject = Project.create({
	name: '通用',
	domains: [],
	scripts: {
		onlineSearch: new Script({
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
						debounce(() => {
							this.cfg.selection = document.getSelection()?.toString() || '';
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
						const results = await defaultAnswerWrapperHandler(CommonProject.scripts.settings.cfg.answererWrappers, {
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
					if (input.parentElement) {
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
		workResults: new Script({
			name: '搜索结果',
			url: [/.*/],
			namespace: 'common.work-results',
			configs: {
				notes: {
					defaultValue: '点击题目序号，查看搜索结果<br>每次自动答题开始前，都会清空上一次的搜索结果。'
				},
				/**
				 * 显示类型
				 * list: 显示为题目列表
				 * numbers: 显示为序号列表
				 */
				type: {
					label: '显示类型',
					tag: 'select',
					defaultValue: 'numbers' as 'questions' | 'numbers',
					onload() {
						this.append(
							...$creator.selectOptions(this.getAttribute('value'), [
								['numbers', '序号列表'],
								['questions', '题目列表']
							])
						);
					}
				},
				results: {
					defaultValue: [] as WorkResult<any>[]
				},
				currentResultIndex: {
					defaultValue: 0
				}
			},
			onrender({ panel }) {
				/** 渲染结果面板 */
				const render = () => {
					if (this.cfg.results.length) {
						// 如果序号指向的结果为空，则代表已经被清空，则重新让index变成0
						if (this.cfg.results[this.cfg.currentResultIndex] === undefined) {
							this.cfg.currentResultIndex = 0;
						}

						// 渲染序号或者题目列表
						if (this.cfg.type === 'numbers') {
							const resultContainer = el('div', {}, (res) => {
								res.style.width = '400px';
							});
							const list = el('div', {}, (list) => {
								list.style.maxWidth = '400px';
								list.style.marginBottom = '12px';
							});
							/** 渲染序号 */
							const nums = this.cfg.results.map((result, index) => {
								return el('span', { className: 'search-results-num', innerText: (index + 1).toString() }, (num) => {
									if (result.error) {
										num.classList.add('error');
									} else if (index === this.cfg.currentResultIndex) {
										num.classList.add('active');
									}

									num.onclick = () => {
										for (const n of nums) {
											n.classList.remove('active');
										}
										num.classList.add('active');
										// 更新显示序号
										this.cfg.currentResultIndex = index;
										// 重新渲染结果列表
										resultContainer.replaceChildren(createResult(result));
									};
								});
							});

							list.replaceChildren(...nums);
							// 初始显示指定序号的结果
							resultContainer.replaceChildren(createResult(this.cfg.results[this.cfg.currentResultIndex]));

							panel.body.replaceChildren(el('hr'), list, resultContainer);
						} else {
							const resultContainer = el('div', {}, (res) => {
								res.style.width = '50%';
							});
							const list = el('div', {}, (list) => {
								list.style.width = '50%';

								const resize = () => {
									if (list.parentElement === null) {
										window.removeEventListener('reset', resize);
									} else {
										list.style.maxHeight = window.innerHeight / 2 + 'px';
									}
								};
								resize();
								window.addEventListener('resize', resize);
							});

							/** 渲染题目列表 */
							const questions = this.cfg.results.map((result, index) => {
								return el(
									'span',

									[
										el('span', { innerHTML: (index + 1 < 10 ? index + 1 + '&nbsp;' : index + 1).toString() }, (num) => {
											num.style.marginRight = '12px';
											num.style.display = 'inline-block';
										}),
										result.ctx?.elements.title?.map((t) => t.innerText || '题目为空').join(',') || '题目为空'
									],
									(question) => {
										question.className = 'search-results-question';

										if (result.error) {
											question.classList.add('error');
										} else if (index === this.cfg.currentResultIndex) {
											question.classList.add('active');
										}

										question.onmouseover = () => {
											question.classList.add('hover');
											// 重新渲染结果列表
											resultContainer.replaceChildren(createResult(result));
										};

										question.onmouseleave = () => {
											question.classList.remove('hover');
											// 重新显示指定序号的结果
											resultContainer.replaceChildren(createResult(this.cfg.results[this.cfg.currentResultIndex]));
										};

										question.onclick = () => {
											for (const q of questions) {
												q.classList.remove('active');
											}
											question.classList.add('active');
											// 更新显示序号
											this.cfg.currentResultIndex = index;
											// 重新渲染结果列表
											resultContainer.replaceChildren(createResult(result));
										};
									}
								);
							});

							list.replaceChildren(...questions);
							// 初始显示指定序号的结果
							resultContainer.replaceChildren(createResult(this.cfg.results[this.cfg.currentResultIndex]));

							panel.body.replaceChildren(
								el('hr'),
								el(
									'div',
									[
										list,
										el('div', {}, (border) => {
											border.style.borderRight = '1px solid #63636346';
											border.style.margin = '0px 8px';
										}),
										resultContainer
									],
									(div) => {
										div.style.maxWidth = '800px';
										div.style.display = 'flex';
									}
								)
							);
						}
					} else {
						panel.body.replaceChildren('暂无任何搜索结果');
					}
				};

				/** 渲染结果列表 */
				const createResult = (result: WorkResult<any>) => {
					if (result.error) {
						return el(
							'div',
							result.error.message
								? result.error.message
								: result.result?.finish === false
								? '此题未完成, 可能是没有匹配的选项。'
								: result.ctx?.searchResults?.length === 0
								? '此题未搜索到答案'
								: '未知的错误',
							(el) => {
								el.style.textAlign = 'center';
								el.style.color = 'red';
							}
						);
					} else {
						return el('search-results-element', {
							results: result.ctx?.searchResults || [],
							question: result.ctx?.elements.title?.map((t) => t.innerText).join(',')
						});
					}
				};

				render();
				this.onConfigChange('type', render);
				this.onConfigChange('results', render);
			}
		}),
		settings: new Script({
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
					defaultValue: [] as AnswererWrapper[]
				},

				answererWrappersButton: {
					label: '题库配置',
					defaultValue: '点击配置',
					attrs: {
						type: 'button'
					},
					onload() {
						const aws: any[] = CommonProject.scripts.settings.cfg.answererWrappers;
						this.value = `点击重新配置${aws.length ? '，当前有' + aws.length + '个可用题库' : ''}`;

						this.onclick = () => {
							const aw: any[] = CommonProject.scripts.settings.cfg.answererWrappers;
							const copy = $creator.copy('复制题库配置', JSON.stringify(aw));

							const list = el('div', [
								el('div', aw.length ? ['以下是已经解析过的题库配置：', copy] : ''),
								...createAnswererWrapperList(aw)
							]);

							const model = $model('prompt', {
								content: el('div', [
									'具体配置教程，请查看官网：',
									el('a', { href: 'https://docs.ocsjs.com/docs/work' }, '自动答题教程'),
									list
								]),
								placeholder: aw.length ? '重新输入' : '输入题库配置',
								cancelButton: el('button', {
									className: 'model-cancel-button',
									innerText: '清空题库配置',
									onclick() {
										$message('success', { content: '已清空，在答题前请记得重新配置。' });
										model?.remove();
										CommonProject.scripts.settings.cfg.answererWrappers = [];
									}
								}),
								async onConfirm(value) {
									if (value) {
										try {
											const aw = await parseAnswererWrappers(value);
											CommonProject.scripts.settings.cfg.answererWrappers = aw;

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
		guide: new Script({
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
									Object.keys(project.scripts).map((key) =>
										el('li', [
											el(
												'span',
												{
													title: [
														'隐藏操作页面:\t' + (project.scripts[key].hideInPanel ? '是' : '否'),
														'在以下页面中运行:\t' + project.scripts[key].url.join(',')
													].join('\n')
												},
												project.scripts[key].name
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
		dev: new Script({
			name: '开发者调试页面',
			// 使用时从打包中的代码修改此处为 true
			hideInPanel: true,
			url: [/.*/],
			configs: () => {
				const configs = cloneDeep(
					getAllRawConfigs(
						getDefinedProjects()
							.map((p) => Object.keys(p.scripts).map((key) => p.scripts[key]))
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
		hack: new Script({
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
	}
});

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
