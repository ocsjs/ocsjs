import debounce from 'lodash/debounce';
import {
	el,
	defaultAnswerWrapperHandler,
	$model,
	$message,
	AnswerWrapperParser,
	$gm,
	$store,
	Project,
	Script,
	request,
	$creator,
	SimplifyWorkResult,
	$script,
	RenderScript,
	$
} from '@ocsjs/core';

import type { ScriptPanelElement, HeaderElement, AnswererWrapper } from '@ocsjs/core';
import { definedProjects } from '../index';
import { $console } from './background';
import { markdown } from '../utils/markdown';
import { workConfigs } from '../utils/configs';

export const CommonProject = Project.create({
	name: '通用',
	domains: [],
	scripts: {
		guide: new Script({
			name: '📖 使用教程',
			url: [['所有页面', /.*/]],
			namespace: 'common.guide',
			onrender({ panel, header }) {
				const guide = createGuide({ panel, header });

				const home = el('button', { className: 'base-style-button-secondary' }, '🏡官网教程');
				home.onclick = () => window.open('https://docs.ocsjs.com', '_blank');

				const notify = el('button', { className: 'base-style-button-secondary' }, '✨查看通知提示');
				notify.onclick = () => $script.pin(CommonProject.scripts.notify);

				const changeLog = el('button', { className: 'base-style-button-secondary' }, '📄查看更新日志');
				changeLog.onclick = () => $script.pin(CommonProject.scripts.changelog);

				changeLog.style.marginBottom = '12px';
				guide.style.width = '400px';
				panel.body.replaceChildren(home, notify, changeLog, guide);
			}
		}),
		notify: new Script({
			name: '📢 通知提示',
			url: [['', /.*/]],
			namespace: 'common.notify',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'此页面实时更新，大家遇到问题可以看看通知',
						'或者进入上方官网里的交流群进行反馈'
					]).outerHTML
				}
			},
			async onrender({ panel }) {
				panel.body.replaceChildren('加载中...');
				const md = await request('https://cdn.ocsjs.com/articles/ocs/notify.md', {
					type: 'fetch',
					contentType: 'text',
					method: 'get'
				});
				panel.body.replaceChildren(el('div', { className: 'card markdown', innerHTML: markdown(md) }));
			}
		}),
		settings: new Script({
			name: '⚙️ 全局设置',
			url: [['所有页面', /.*/]],
			namespace: 'common.settings',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'✨鼠标移动到按钮或者输入框，可以看到提示！',
						'想要自动答题必须设置 “题库配置” ',
						'设置后进入章节测试，作业，考试页面即可自动答题。'
					]).outerHTML
				},
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
						const aws: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];
						this.value = aws.length ? '当前有' + aws.length + '个可用题库' : '点击配置';

						this.onclick = () => {
							const aw: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];
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
									onclick: () => {
										$message('success', { content: '已清空，在答题前请记得重新配置。' });
										model?.remove();
										CommonProject.scripts.settings.cfg.answererWrappers = [];
										this.value = '点击配置';
									}
								}),
								onConfirm: async (value) => {
									if (value) {
										try {
											const aw = await AnswerWrapperParser.from(value);
											if (aw.length) {
												CommonProject.scripts.settings.cfg.answererWrappers = aw;
												this.value = '当前有' + aw.length + '个可用题库';
												$model('alert', {
													content: el('div', [
														el('div', '配置成功，打开具有答题脚本的页面后即可自动答题，解析到的题库如下所示:'),
														...createAnswererWrapperList(aw)
													])
												});
											} else {
												$model('alert', { content: '题库配置不能为空，请重新配置。' });
											}
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
				upload: workConfigs.upload,
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
						min: 1,
						step: 1,
						max: 3,
						title:
							'同一时间内答题线程工作的数量（例子：三个线程则代表一秒内同时搜索三道题），过多可能导致题库服务器压力过大，请适当调低。'
					},
					defaultValue: 1
				},
				period: {
					label: '答题间隔（秒）',
					attrs: {
						type: 'number',
						min: 0,
						step: 1,
						max: 60,
						title: '每道题的间隔时间，不建议太低，避免增加服务器压力。'
					},
					defaultValue: 3
				},
				timeout: {
					label: '处理超时时间（秒）',
					attrs: { type: 'number', min: 3, step: 1, max: 60, title: '每道题最多做n秒, 超过则跳过此题。' },
					defaultValue: 30
				},
				retry: {
					label: '超时重试次数',
					attrs: { type: 'number', min: 0, step: 1, max: 3 },
					defaultValue: 1
				},
				forceWork: {
					label: '(仅超星)强制答题',
					defaultValue: false,
					attrs: {
						type: 'checkbox',
						title:
							'当章节测试不是任务点时，强制自动答题。\n(左上角有黄点的代表此小节是任务点)\n(一般来说不是任务点的章节测试是不计分的)'
					}
				},
				'randomWork-choice': {
					defaultValue: false,
					label: '(仅超星)随机选择',
					attrs: { type: 'checkbox', title: '随机选择任意一个选项' }
				},
				'randomWork-complete': {
					defaultValue: false,
					label: '(仅超星)随机填空',
					attrs: { type: 'checkbox', title: '随机填写以下任意一个文案' }
				},
				'randomWork-completeTexts-textarea': {
					defaultValue: ['不会', '不知道', '不清楚', '不懂', '不会写'].join('\n'),
					label: '(仅超星)随机填空文案',
					tag: 'textarea',
					attrs: { title: '每行一个，随机填入' }
				}
			},
			oncomplete() {
				if ($.isInTopWindow()) {
					this.onConfigChange('notification', (open) => {
						if (open) {
							$gm.notification('您已开启系统通知，如果脚本有重要情况需要处理，则会发起通知提示您。', {
								duration: 5
							});
						}
					});
				}
			}
		}),
		onlineSearch: new Script({
			name: '🔎 在线搜题',
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

				panel.body.append(el('div', [el('hr'), content, searchContainer]));
			}
		}),
		workResults: new Script({
			name: '📄 搜索结果',
			url: [['所有页面', /.*/]],
			namespace: 'common.work-results',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						['警告：禁止与其他脚本一起使用，', '否则出现答案选不上或者其他问题一律后果自负。'],
						'点击题目序号，查看搜索结果',
						'每次自动答题开始前，都会清空上一次的搜索结果。'
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
					const results: SimplifyWorkResult[] | undefined = await $store.getTab('common.work-results.results');

					if (results?.length) {
						// 如果序号指向的结果为空，则代表已经被清空，则重新让index变成0
						if (results[this.cfg.currentResultIndex] === undefined) {
							this.cfg.currentResultIndex = 0;
						}

						// 渲染序号或者题目列表
						if (this.cfg.type === 'numbers') {
							const resultContainer = el('div', {}, (res) => {
								res.style.width = '400px';
							});

							list.style.width = '400px';
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

							list.style.width = '400px';
							list.style.overflow = 'auto';
							list.style.maxHeight = window.innerHeight / 2 + 'px';

							/** 右侧结果 */
							const resultContainer = el('div', { className: 'work-result-question-container' });
							const nums: HTMLSpanElement[] = [];
							/** 左侧渲染题目列表 */
							const questions = results.map((result, index) => {
								/** 左侧序号 */
								const num = el(
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
								);

								nums.push(num);

								return el(
									'div',

									[num, result.question],
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
											for (const n of nums) {
												n.classList.remove('active');
											}
											for (const q of questions) {
												q.classList.remove('active');
											}
											nums[index].classList.add('active');
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

					const tip = el('div', [
						el('div', { className: 'search-results-num requesting' }, 'n'),
						'表示搜索中 ',
						el('br'),
						el('div', { className: 'search-results-num resolving' }, 'n'),
						'表示已搜索但未开始答题 ',
						el('br'),
						el('div', { className: 'search-results-num' }, 'n'),
						'表示已搜索已答题 '
					]);

					/** 添加信息 */
					panel.body.prepend(
						el('hr'),
						el(
							'div',
							[
								`当前搜题: ${this.cfg.requestIndex + 1}/${this.cfg.totalQuestionCount}`,
								' , ',
								`当前答题: ${this.cfg.resolverIndex + 1}/${this.cfg.totalQuestionCount}`,
								' , ',
								el('a', '查看提示', (btn) => {
									btn.addEventListener('click', () => {
										$model('confirm', {
											content: tip
										});
									});
								})
							],
							(div) => {
								div.style.marginBottom = '12px';
							}
						),

						el('hr')
					);
				};

				/** 渲染结果列表 */
				const createResult = (result: SimplifyWorkResult | undefined) => {
					if (result) {
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
					} else {
						return el('div', 'undefined');
					}
				};

				render();
				this.onConfigChange('type', render);
				this.onConfigChange('resolverIndex', render);
				$store.addChangeListener('common.work-results.result', debounce(render, 1000, { maxWait: 1000 }));
			}
		}),
		changelog: new Script({
			name: '📦 版本更新',
			url: [['', /.*/]],
			namespace: 'common.changelog',
			configs: {
				notes: {
					defaultValue: $creator.notes(['此页面实时更新，遇到问题可以查看最新版本是否修复。']).outerHTML
				}
			},
			async onrender({ panel }) {
				panel.body.replaceChildren('加载中...');
				const md = await request('https://cdn.ocsjs.com/articles/ocs/changelog.md', {
					type: 'fetch',
					contentType: 'text',
					method: 'get'
				});
				panel.body.replaceChildren(el('div', { className: 'markdown card', innerHTML: markdown(md) }));
			}
		}),
		/** 渲染脚本，窗口渲染主要脚本 */
		render: RenderScript,
		hack: new Script({
			name: '页面复制粘贴限制解除',
			url: [['所有页面', /.*/]],
			hideInPanel: true,
			onactive() {
				enableCopy();
			},
			oncomplete() {
				enableCopy();
				setTimeout(() => enableCopy(), 3000);
			}
		}),
		disableDialog: new Script({
			name: '禁止弹窗',
			url: [],
			onstart() {
				try {
					$gm.unsafeWindow.alert = (msg) => $console.warn(`已拦截弹窗: ${msg}`);
					window.alert = self.alert = (msg) => $console.warn(`已拦截弹窗: ${msg}`);
				} catch (e) {}
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

const createGuide = ({ panel, header }: { panel: ScriptPanelElement; header: HeaderElement }) => {
	return el('div', { className: 'user-guide card' }, [
		$creator.notes(
			[
				'打开任意网课平台，等待脚本加载，',
				'脚本加载后查看每个网课不同的使用提示。',
				'如果不支持当前网课，则不会有相应的提示以及设置面板。',
				[
					'以下是全部支持的网课以及包含的脚本（点击下列详情展开查看）:',
					...definedProjects()
						.filter((p) => p.studyProject)
						.map((project) => {
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
					'最后温馨提示: ',
					'- 禁止与其他脚本一起使用，否则出现答案选不上或者页面卡死，无限刷新，等问题一律后果自负。',
					'- 任何其他疑问请前往官网查看交流群，进入交流群后带截图进行反馈。',
					'- 请将浏览器页面保持最大化，或者缩小窗口，不能最小化，否则可能导致脚本卡死！'
				]
			],
			'ol'
		)
	]);
};
