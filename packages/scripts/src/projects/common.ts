import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/cloneDeep';
import {
	el,
	$,
	defaultAnswerWrapperHandler,
	$model,
	$message,
	parseAnswererWrappers,
	$gm,
	$store,
	Project,
	Script,
	$creator,
	SimplifyWorkResult
} from '@ocsjs/core';

import type { ScriptPanelElement, HeaderElement, AnswererWrapper } from '@ocsjs/core';
import { definedProjects } from '../index';

export const CommonProject = Project.create({
	name: '通用',
	domains: [],
	scripts: {
		onlineSearch: new Script({
			name: '在线搜题',
			url: [['所有页面', /.*/]],
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
									el('search-results-element', {
										results: results.map((res) => ({
											results: res.answers.map((ans) => [ans.question, ans.answer] as [string, string]),
											homepage: res.homepage,
											name: res.name
										})),
										question: value
									})
								],
								(div) => {
									div.style.width = window.outerWidth < 1000 ? '400px' : '600px';
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

				panel.body.append(el('div', [el('hr'), content, searchContainer]));
			}
		}),
		workResults: new Script({
			name: '搜索结果',
			url: [['所有页面', /.*/]],
			namespace: 'common.work-results',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'点击题目序号，查看搜索结果',
						'每次自动答题开始前，都会清空上一次的搜索结果。',
						'点击下列题目或者序号进行固定显示。'
					]).outerHTML
				},
				/**
				 * 显示类型
				 * list: 显示为题目列表
				 * numbers: 显示为序号列表
				 */
				type: {
					label: '显示类型',
					tag: 'select',
					attrs: { title: '使用题目列表可能会造成页面卡顿。' },
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
				totalQuestionCount: {
					defaultValue: 0
				},
				requestIndex: {
					defaultValue: 0
				},
				resolverIndex: {
					defaultValue: 0
				},
				currentResultIndex: {
					defaultValue: 0
				}
			},
			onrender({ panel }) {
				/** 记录滚动高度 */
				let scrollPercent = 0;

				/** 列表 */
				const list = el('div');

				/** 是否悬浮在题目上 */
				let mouseoverIndex = -1;

				list.onscroll = () => {
					scrollPercent = list.scrollTop / list.scrollHeight;
				};

				/** 给序号设置样式 */
				const setNumStyle = (result: SimplifyWorkResult, num: HTMLElement, index: number) => {
					if (result.requesting) {
						num.classList.add('requesting');
					} else if (result.resolving) {
						num.classList.add('resolving');
					} else if (result.error || result.searchResults.length === 0 || result.finish === false) {
						num.classList.add('error');
					} else if (index === this.cfg.currentResultIndex) {
						num.classList.add('active');
					}
				};

				/** 渲染结果面板 */
				const render = async () => {
					const results: SimplifyWorkResult[] = await $store.getTab('common.work-results.results');

					if (results.length) {
						// 如果序号指向的结果为空，则代表已经被清空，则重新让index变成0
						if (results[this.cfg.currentResultIndex] === undefined) {
							this.cfg.currentResultIndex = 0;
						}

						// 渲染序号或者题目列表
						if (this.cfg.type === 'numbers') {
							const resultContainer = el('div', {}, (res) => {
								res.style.width = window.outerWidth < 1000 ? '400px' : '600px';
							});

							list.style.width = window.outerWidth < 1000 ? '400px' : '600px';
							list.style.marginBottom = '12px';
							list.style.maxHeight = window.innerHeight / 2 + 'px';

							/** 渲染序号 */
							const nums = results.map((result, index) => {
								return el('span', { className: 'search-results-num', innerText: (index + 1).toString() }, (num) => {
									setNumStyle(result, num, index);

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
							resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));

							panel.body.replaceChildren(list, resultContainer);
						} else {
							/** 左侧题目列表 */

							list.style.width = window.outerWidth < 1000 ? '400px' : '600px';
							list.style.overflow = 'auto';
							list.style.maxHeight = window.innerHeight / 2 + 'px';

							/** 右侧结果 */
							const resultContainer = el('div', { className: 'work-result-question-container' });

							/** 左侧渲染题目列表 */
							const questions = results.map((result, index) => {
								return el(
									'div',

									[
										/** 左侧序号 */
										el(
											'span',
											{
												className: 'search-results-num',
												innerHTML: (index + 1).toString()
											},
											(num) => {
												num.style.marginRight = '12px';
												num.style.display = 'inline-block';
												setNumStyle(result, num, index);
											}
										),

										result.question
									],
									(question) => {
										question.className = 'search-results-question';

										if (
											result.requesting === false &&
											result.resolving === false &&
											(result.error || result.searchResults.length === 0 || result.finish === false)
										) {
											question.classList.add('error');
										} else if (index === this.cfg.currentResultIndex) {
											question.classList.add('active');
										}

										question.onmouseover = () => {
											mouseoverIndex = index;
											question.classList.add('hover');
											// 重新渲染结果列表
											resultContainer.replaceChildren(createResult(result));
										};

										question.onmouseleave = () => {
											mouseoverIndex = -1;
											question.classList.remove('hover');
											// 重新显示指定序号的结果
											resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
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
							if (mouseoverIndex === -1) {
								resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));
							} else {
								resultContainer.replaceChildren(createResult(results[mouseoverIndex]));
							}

							panel.body.replaceChildren(
								el('div', [list, el('div', {}, [resultContainer])], (div) => {
									div.style.display = 'flex';
								})
							);
						}
					} else {
						panel.body.replaceChildren(
							el('div', '⚠️暂无任何搜索结果', (div) => {
								div.style.textAlign = 'center';
							})
						);
					}

					/** 恢复高度 */
					list.scrollTo({
						top: scrollPercent * list.scrollHeight,
						behavior: 'auto'
					});

					/** 添加信息 */
					panel.body.prepend(
						el('hr'),
						el(
							'div',
							[
								`当前搜题: ${this.cfg.requestIndex + 1}/${this.cfg.totalQuestionCount}`,
								' , ',
								`当前答题: ${this.cfg.resolverIndex + 1}/${this.cfg.totalQuestionCount}`
							],
							(div) => {
								div.style.marginBottom = '12px';
							}
						),
						el('div', [
							'提示：',
							el('span', { className: 'search-results-num requesting' }, '1'),
							'表示搜索中 ',
							el('span', { className: 'search-results-num resolving' }, '1'),
							'表示已搜索但未开始答题 ',
							el('span', { className: 'search-results-num' }, '1'),
							'表示已搜索已答题 '
						]),
						el('hr')
					);
				};

				/** 渲染结果列表 */
				const createResult = (result: SimplifyWorkResult) => {
					const error = el('span', {}, (el) => (el.style.color = 'red'));

					if (result.requesting && result.resolving) {
						return el('div', [result.question, el('hr'), '当前题目还未开始搜索，请稍等。']);
					} else {
						if (result.error) {
							error.innerText = result.error;
							return el('div', [result.question, el('hr'), error]);
						} else if (result.searchResults.length === 0) {
							error.innerText = '此题未搜索到答案';
							return el('div', [result.question, el('hr'), error]);
						} else {
							error.innerText = '此题未完成, 可能是没有匹配的选项。';
							return el('div', [
								...(result.finish ? [] : [result.resolving ? '正在等待答题中，请稍等。' : error]),
								el('search-results-element', {
									results: result.searchResults,
									question: result.question
								})
							]);
						}
					}
				};

				render();
				this.onConfigChange('type', render);
				this.onConfigChange('resolverIndex', render);
				$store.addChangeListener('common.work-results.result', debounce(render, 1000, { maxWait: 1000 }));
			}
		}),
		settings: new Script({
			name: '全局设置',
			url: [['所有页面', /.*/]],
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
				skipAnswered: {
					label: '跳过已经完成的题目',
					attrs: { type: 'checkbox', title: '当题目中的选项大于一个已经被选中，则将跳过此题的答题。' },
					defaultValue: true
				},
				uncheckAllChoice: {
					label: '清空答案',
					attrs: { type: 'checkbox', title: '在考试开始前，清空所有已经选择过的答案。' },
					defaultValue: false
				},
				thread: {
					label: '线程数量（个）',
					attrs: {
						type: 'number',
						min: '1',
						step: '1',
						max: '3',
						title: '同一时间内答题线程工作的数量，过多可能导致题库服务器压力过大，请适当调低。'
					},
					defaultValue: 1
				},
				period: {
					label: '答题间隔（秒）',
					attrs: {
						type: 'number',
						min: '0',
						step: '1',
						max: '60',
						title: '每道题的间隔时间，不建议太低，避免增加服务器压力。'
					},
					defaultValue: 3
				},
				timeout: {
					label: '处理超时时间（秒）',
					attrs: { type: 'number', min: '10', step: '1', max: '60', title: '每道题最多做n秒, 超过则跳过此题。' },
					defaultValue: 30
				},
				retry: {
					label: '超时重试次数',
					attrs: { type: 'number', min: '0', step: '1', max: '3' },
					defaultValue: 1
				}
			},
			oncomplete() {
				this.onConfigChange('notification', (open) => {
					if (open) {
						$gm.notification('您已开启系统通知，如果脚本有重要情况需要处理，则会发起通知提示您。', {
							duration: 5
						});
					}
				});
			},
			onbeforeunload() {}
		}),
		guide: new Script({
			name: '使用教程',
			url: [['所有页面', /.*/]],
			namespace: 'common.guide',
			configs: {
				showGuide: { defaultValue: true, label: '进入页面，显示使用教程', attrs: { type: 'checkbox' } }
			},

			oncomplete() {
				const createGuide = ({ panel, header }: { panel: ScriptPanelElement; header: HeaderElement }) => {
					const projectSelector = header.projectSelector?.cloneNode(true) as HTMLSelectElement;
					const logo = header.logo?.cloneNode(true) as HTMLDivElement;
					const expandSwitcher = header.expandSwitcher?.cloneNode(true) as HTMLDivElement;
					const visualSwitcher = header.visualSwitcher?.cloneNode(true) as HTMLDivElement;
					const closeButton = header.closeButton?.cloneNode(true) as HTMLDivElement;
					projectSelector.style.display = 'inline-block';
					projectSelector.querySelectorAll('select').forEach((el) => (el.disabled = true));
					logo.style.cursor = 'default';
					expandSwitcher.style.cursor = 'default';
					visualSwitcher.style.cursor = 'default';
					closeButton.style.cursor = 'default';

					return el('div', { className: 'user-guide card' }, [
						$creator.notes(
							[
								[
									'OCS会根据当前的页面自动选择脚本进行运行，如果没有达到您预期的效果，则代表当前页面并没有脚本运行。',
									'以下是全部支持的网课以及包含的脚本（点击下列详情展开查看）:',
									...definedProjects().map((project) => {
										return el('details', [
											el('summary', project.name),
											el(
												'ul',
												Object.keys(project.scripts).map((key) => {
													const script = project.scripts[key];

													return el(
														'li',
														[
															el('b', script.name),
															$creator.notes([
																el('span', ['操作面板：', script.hideInPanel ? '隐藏' : '显示']),

																[
																	'运行页面：',
																	el(
																		'ul',
																		script.url.map((i) =>
																			el('li', [
																				i[0],
																				'：',
																				i[1] instanceof RegExp
																					? i[1].toString().replace(/\\/g, '').slice(1, -1)
																					: el('a', { href: i[1], target: '_blank' }, i[1])
																			])
																		)
																	)
																]
															])
														],
														(li) => {
															li.style.marginBottom = '12px';
														}
													);
												}),
												(ul) => {
													ul.style.paddingLeft = '42px';
												}
											)
										]);
									}),
									el('br')
								],

								[
									'以下是窗口顶部菜单栏的按钮说明:',
									$creator.notes([
										el('span', [
											projectSelector,
											' 部分脚本会提供操作页面（包含脚本设置和脚本提示）。此按钮可以选择指定的脚本页面进行显示。'
										]),
										el('span', [logo, ' 点击查看官网教程']),
										el('span', [expandSwitcher, ' 可以 展开/收缩 脚本操作页面。']),
										el('span', [visualSwitcher, ' 可以 展开/收缩 窗口。']),
										el('span', [closeButton, ' ', closeButton.getAttribute('data-title') || ''])
									]),
									el('br')
								],

								'最后温馨提示：请将浏览器页面保持最大化，或者缩小窗口，不能最小化，可能导致脚本卡死！'
							],
							'ol'
						)
					]);
				};
				this.on('render', ({ panel, header }) => {
					const guide = createGuide({ panel, header });
					guide.style.width = '600px';
					panel.body.replaceChildren(el('hr'), guide);
				});

				if (this.cfg.showGuide && this.panel && this.header) {
					$model('confirm', {
						title: '使用教程',
						content: createGuide({ panel: this.panel, header: this.header }),
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
			url: [['所有页面', /.*/]],
			configs: () => {
				const configs = cloneDeep(
					$.getAllRawConfigs(
						definedProjects()
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
			url: [['所有页面', /.*/]],
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
