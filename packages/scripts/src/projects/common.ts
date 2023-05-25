import debounce from 'lodash/debounce';
import {
	el,
	defaultAnswerWrapperHandler,
	$message,
	AnswerWrapperParser,
	$gm,
	$store,
	Project,
	Script,
	request,
	$creator,
	SimplifyWorkResult,
	RenderScript,
	$,
	WorkUploadType,
	$modal
} from '@ocsjs/core';

import type { AnswererWrapper, SearchInformation, StoreListenerType } from '@ocsjs/core';
import { definedProjects } from '../index';
import { markdown } from '../utils/markdown';

const TAB_WORK_RESULTS_KEY = 'common.work-results.results';

const gotoHome = () => {
	const btn = el('button', { className: 'base-style-button-secondary' }, '🏡官网教程');
	btn.onclick = () => window.open('https://docs.ocsjs.com', '_blank');
	return btn;
};

const state = {
	workResult: {
		/**
		 * 题目位置同步处理器
		 */
		questionPositionSyncHandler: {
			cx: (index: number) => {
				const el = document.querySelectorAll<HTMLElement>('[id*="sigleQuestionDiv"], .questionLi')?.item(index);
				if (el) {
					window.scrollTo({
						top: el.getBoundingClientRect().top + window.pageYOffset - 50,
						behavior: 'smooth'
					});
				}
			},
			'zhs-gxk': (index: number) => {
				document.querySelectorAll<HTMLElement>('.answerCard_list ul li').item(index)?.click();
			},
			'zhs-xnk': (index: number) => {
				document.querySelectorAll<HTMLElement>('.jobclassallnumber-div li[questionid]').item(index)?.click();
			},
			icve: (index: number) => {
				document.querySelectorAll<HTMLElement>(`.sheet_nums [id*="sheetSeq"]`).item(index)?.click();
			},
			zjy: (index: number) => {
				document
					.querySelector<HTMLElement>(`.e-q-body[data-num="${index + 1}"]`)
					?.scrollIntoView({ behavior: 'smooth' });
			}
		}
	},
	setting: {
		listenerIds: {
			aw: 0 as StoreListenerType
		}
	}
};

/**
 * 题库缓存类型
 */
type QuestionCache = { title: string; answer: string; from: string; homepage: string };

export const CommonProject = Project.create({
	name: '通用',
	domains: [],
	scripts: {
		guide: new Script({
			name: '🏠 脚本首页',
			url: [['所有页面', /.*/]],
			namespace: 'common.guide',
			onrender({ panel }) {
				const guide = createGuide();

				const contactUs = el('button', { className: 'base-style-button-secondary' }, '🗨️交流群');
				contactUs.onclick = () => window.open('https://docs.ocsjs.com/docs/about#交流方式', '_blank');

				const notify = el('button', { className: 'base-style-button-secondary' }, '✨查看通知提示');
				notify.onclick = () => CommonProject.scripts.apps.methods.showNotify();

				const changeLog = el('button', { className: 'base-style-button-secondary' }, '📄查看更新日志');
				changeLog.onclick = () => CommonProject.scripts.apps.methods.showChangelog();

				changeLog.style.marginBottom = '12px';
				guide.style.width = '480px';
				panel.body.replaceChildren(el('div', { className: 'card' }, [gotoHome(), contactUs, notify, changeLog]), guide);
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
				enableQuestionCaches: {
					label: '题库缓存功能',
					defaultValue: true,
					attrs: { type: 'checkbox', title: '详情请前往 通用-其他应用-题库拓展查看。' }
				},
				answererWrappers: {
					separator: '自动答题设置',
					defaultValue: [] as AnswererWrapper[]
				},
				/**
				 * 禁用的题库
				 */
				disabledAnswererWrapperNames: {
					defaultValue: [] as string[]
				},
				answererWrappersButton: {
					label: '题库配置',
					defaultValue: '点击配置',
					attrs: {
						type: 'button'
					},
					onload() {
						const aws: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];
						this.value = aws.length ? '当前有' + aws.length + '个可用题库，点击重新配置' : '点击配置';

						this.onclick = () => {
							const aw: any[] = CommonProject.scripts.settings.cfg.answererWrappers || [];
							const copy = $creator.copy('复制题库配置', JSON.stringify(aw, null, 4));

							const list = el('div', [
								el('div', aw.length ? ['以下是已经解析过的题库配置：', copy] : ''),
								...createAnswererWrapperList(aw)
							]);

							const modal = $modal('prompt', {
								width: 600,
								modalInputType: 'textarea',
								inputDefaultValue: aw.length === 0 ? '' : JSON.stringify(aw, null, 4),
								content: $creator.notes([
									[
										el('div', [
											'具体配置教程，请查看官网：',
											el('a', { href: 'https://docs.ocsjs.com/docs/work' }, '自动答题教程')
										])
									],
									'如果题库配置无法粘贴，则说明此页面禁止粘贴，请尝试前往其他页面(网课主页或者学习页面)再尝试进行粘贴。',
									...(aw.length ? [list] : [])
								]),
								placeholder: aw.length ? '重新输入' : '输入题库配置',
								cancelButton: el('button', {
									className: 'modal-cancel-button',
									innerText: '清空题库配置',
									onclick: () => {
										$message('success', { content: '已清空，在答题前请记得重新配置。' });
										modal?.remove();
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
												$modal('alert', {
													width: 600,
													content: el('div', [
														el('div', ['🎉 配置成功，刷新网页后重新答题即可。', '解析到的题库如下所示:']),
														...createAnswererWrapperList(aw)
													])
												});
											} else {
												$modal('alert', { content: '题库配置不能为空，请重新配置。' });
											}
										} catch (e: any) {
											$modal('alert', {
												content: el('div', [el('div', '解析失败，原因如下 :'), el('div', e.message)])
											});
										}
									} else {
										$modal('alert', {
											content: el('div', '不能为空！')
										});
									}
								}
							});
						};
					}
				},
				upload: {
					label: '答题完成后',
					tag: 'select',
					defaultValue: 80 as WorkUploadType,
					attrs: {
						title:
							'自动答题完成后的设置，目前仅在 超星学习通的章节测试 中生效, 鼠标悬浮在选项上可以查看每个选项的具体解释。'
					},
					onload() {
						this.append(
							...$creator.selectOptions(this.getAttribute('value'), [
								['save', '自动保存', '完成后自动保存答案, 注意如果你开启了随机作答, 有可能分辨不出答案是否正确。'],
								['nomove', '不保存也不提交', '等待时间过后将会自动下一节, 适合在测试脚本时使用。'],
								...([10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => [
									rate.toString(),
									`搜到${rate}%的题目则自动提交`,
									`例如: 100题中查询到 ${rate} 题的答案,（答案不一定正确）, 则会自动提交。`
								]) as [any, string, string][]),
								['100', '每个题目都查到答案才自动提交', '答案不一定正确'],
								['force', '强制自动提交', '不管答案是否正确直接强制自动提交，如需开启，请配合随机作答谨慎使用。']
							])
						);
					}
				},
				stopSecondWhenFinish: {
					label: '答题结束后暂停（秒）',
					attrs: {
						type: 'number',
						min: 3,
						step: 1,
						max: 9999,
						title: '自动答题脚本结束后暂停的时间（方便查看和检查）。'
					},
					defaultValue: 3
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
				},
				redundanceWordsText: {
					defaultValue: ['单选题(必考)', '填空题(必考)', '多选题(必考)'].join('\n'),
					label: '题目冗余字段自动删除',
					tag: 'textarea',
					attrs: { title: '在搜题的时候自动删除多余的文字，以便提高搜题的准确度，每行一个。' }
				}
			},
			onrender({ panel }) {
				// 因为需要用到 GM_xhr 所以判断是否处于用户脚本环境
				if ($gm.getInfos() !== undefined) {
					panel.body.replaceChildren(...(this.cfg.answererWrappers.length ? [el('hr')] : []));

					const refresh = el(
						'button',
						{ className: 'base-style-button', disabled: this.cfg.answererWrappers.length === 0 },
						'🔄️刷新题库状态'
					);
					refresh.onclick = () => {
						updateState();
					};
					const tableContainer = el('div');
					refresh.style.display = 'none';
					tableContainer.style.display = 'none';
					panel.body.append(refresh, tableContainer);

					// 更新题库状态
					const updateState = async () => {
						// 清空元素
						tableContainer.replaceChildren();
						let loadedCount = 0;

						if (this.cfg.answererWrappers.length) {
							refresh.style.display = 'block';
							tableContainer.style.display = 'block';
							refresh.textContent = '🚫正在加载题库状态...';
							refresh.setAttribute('disabled', 'true');

							const table = el('table');
							table.style.width = '100%';
							this.cfg.answererWrappers.forEach(async (item) => {
								const t = Date.now();
								let success = false;
								let error;
								const isDisabled = this.cfg.disabledAnswererWrapperNames.find((name) => name === item.name);

								const res = isDisabled
									? false
									: await Promise.race([
											(async () => {
												try {
													return await request(new URL(item.url).origin + '/?t=' + t, {
														type: 'GM_xmlhttpRequest',
														method: 'head',
														responseType: 'text'
													});
												} catch (err) {
													error = err;
													return false;
												}
											})(),
											(async () => {
												await $.sleep(10 * 1000);
												return false;
											})()
									  ]);
								if (typeof res === 'string') {
									success = true;
								} else {
									success = false;
								}

								const body = el('tbody');
								body.append(el('td', item.name));
								body.append(
									el('td', success ? '连接成功🟢' : isDisabled ? '已停用⚪' : error ? '连接失败🔴' : '连接超时🟡')
								);
								body.append(el('td', `延迟 : ${success ? Date.now() - t : '---'}/ms`));
								table.append(body);
								loadedCount++;

								if (loadedCount === this.cfg.answererWrappers.length) {
									setTimeout(() => {
										refresh.textContent = '🔄️刷新题库状态';
										refresh.removeAttribute('disabled');
									}, 2000);
								}
							});
							tableContainer.append(table);
						} else {
							refresh.style.display = 'none';
							tableContainer.style.display = 'none';
						}
					};

					updateState();

					this.offConfigChange(state.setting.listenerIds.aw);
					state.setting.listenerIds.aw = this.onConfigChange('answererWrappers', (_, __, remote) => {
						if (remote === false) {
							updateState();
						}
					});
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
		workResults: new Script({
			name: '🌏 搜索结果',
			url: [['所有页面', /.*/]],
			namespace: 'common.work-results',
			configs: {
				notes: {
					defaultValue: $creator.notes(['点击题目序号，查看搜索结果', '每次自动答题开始前，都会清空上一次的搜索结果。'])
						.outerHTML
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
				},
				questionPositionSyncHandlerType: {
					defaultValue: undefined as keyof typeof state.workResult.questionPositionSyncHandler | undefined
				}
			},
			methods() {
				return {
					/**
					 * 更新状态
					 */
					updateWorkState: (state: { totalQuestionCount: number; requestIndex: number; resolverIndex: number }) => {
						this.cfg.totalQuestionCount = state.totalQuestionCount;
						this.cfg.requestIndex = state.requestIndex;
						this.cfg.resolverIndex = state.resolverIndex;
					},
					/**
					 * 刷新状态
					 */
					refreshState: () => {
						this.cfg.totalQuestionCount = 0;
						this.cfg.requestIndex = 0;
						this.cfg.resolverIndex = 0;
					},
					/**
					 * 清空搜索结果
					 */
					clearResults: () => {
						return $store.setTab(TAB_WORK_RESULTS_KEY, []);
					},
					getResults(): Promise<SimplifyWorkResult[]> | undefined {
						return $store.getTab(TAB_WORK_RESULTS_KEY) || undefined;
					},
					setResults(results: SimplifyWorkResult[]) {
						return $store.setTab(TAB_WORK_RESULTS_KEY, results);
					},
					/**
					 * 刷新搜索结果状态，清空搜索结果，置顶搜索结果面板
					 */
					init(opts?: { questionPositionSyncHandlerType?: keyof typeof state.workResult.questionPositionSyncHandler }) {
						CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType =
							opts?.questionPositionSyncHandlerType;
						// 刷新搜索结果状态
						CommonProject.scripts.workResults.methods.refreshState();
						// 清空搜索结果
						CommonProject.scripts.workResults.methods.clearResults();
					},
					/**
					 * 创建搜索结果面板
					 * @param mount 挂载点
					 */
					createWorkResultsPanel: (mount?: HTMLElement) => {
						const container = mount || el('div');
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
							} else if (result.error || result.searchInfos.length === 0 || result.finish === false) {
								num.classList.add('error');
							} else if (index === this.cfg.currentResultIndex) {
								num.classList.add('active');
							}
						};

						/** 渲染结果面板 */
						const render = debounce(async () => {
							const results: SimplifyWorkResult[] | undefined =
								await CommonProject.scripts.workResults.methods.getResults();

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
										return el('span', { className: 'search-infos-num', innerText: (index + 1).toString() }, (num) => {
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
												// 触发页面题目元素同步器
												if (this.cfg.questionPositionSyncHandlerType) {
													state.workResult.questionPositionSyncHandler[this.cfg.questionPositionSyncHandlerType]?.(
														index
													);
												}
											};
										});
									});

									list.replaceChildren(...nums);
									// 初始显示指定序号的结果
									resultContainer.replaceChildren(createResult(results[this.cfg.currentResultIndex]));

									container.replaceChildren(list, resultContainer);
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
												className: 'search-infos-num',
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
												question.className = 'search-infos-question';

												if (
													result.requesting === false &&
													result.resolving === false &&
													(result.error || result.searchInfos.length === 0 || result.finish === false)
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
													// 触发页面题目元素同步器
													if (this.cfg.questionPositionSyncHandlerType) {
														state.workResult.questionPositionSyncHandler[this.cfg.questionPositionSyncHandlerType]?.(
															index
														);
													}
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

									container.replaceChildren(
										el('div', [list, el('div', {}, [resultContainer])], (div) => {
											div.style.display = 'flex';
										})
									);
								}
							} else {
								container.replaceChildren(
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
								el('div', { className: 'search-infos-num requesting' }, 'n'),
								'表示搜索中 ',
								el('br'),
								el('div', { className: 'search-infos-num resolving' }, 'n'),
								'表示已搜索但未开始答题 ',
								el('br'),
								el('div', { className: 'search-infos-num' }, 'n'),
								'表示已搜索已答题 '
							]);

							/** 添加信息 */
							container.prepend(
								el('hr'),
								el(
									'div',
									[
										$creator.space(
											[
												el('span', `当前搜题: ${this.cfg.requestIndex}/${this.cfg.totalQuestionCount}`),
												el('span', `当前答题: ${this.cfg.resolverIndex}/${this.cfg.totalQuestionCount}`),
												el('a', '提示', (btn) => {
													btn.style.cursor = 'pointer';
													btn.onclick = () => {
														$modal('confirm', { content: tip });
													};
												})
											],
											{ separator: '|' }
										)
									],
									(div) => {
										div.style.marginBottom = '12px';
									}
								),

								el('hr')
							);
						}, 100);

						/** 渲染结果列表 */
						const createResult = (result: SimplifyWorkResult | undefined) => {
							if (result) {
								const error = el('span', {}, (el) => (el.style.color = 'red'));

								if (result.requesting && result.resolving) {
									return el('div', [
										result.question,
										$creator.createQuestionTitleExtra(result.question),
										el('hr'),
										'当前题目还未开始搜索，请稍等。'
									]);
								} else {
									if (result.error) {
										error.innerText = result.error;
										return el('div', [
											result.question,
											$creator.createQuestionTitleExtra(result.question),
											el('hr'),
											error
										]);
									} else if (result.searchInfos.length === 0) {
										error.innerText = '此题未搜索到答案';
										return el('div', [
											result.question,
											$creator.createQuestionTitleExtra(result.question),
											el('hr'),
											error
										]);
									} else {
										error.innerText = '此题未完成, 可能是没有匹配的选项。';
										return el('div', [
											...(result.finish ? [] : [result.resolving ? '正在等待答题中，请稍等。' : error]),
											el('search-infos-element', {
												infos: result.searchInfos,
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
						this.onConfigChange('requestIndex', render);
						this.onConfigChange('resolverIndex', render);
						$store.addChangeListener(TAB_WORK_RESULTS_KEY, render);

						return container;
					}
				};
			},
			onrender({ panel }) {
				panel.body.replaceChildren(this.methods.createWorkResultsPanel());
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
						const infos = await defaultAnswerWrapperHandler(CommonProject.scripts.settings.cfg.answererWrappers, {
							title: value
						});
						// 耗时计算
						const resume = ((Date.now() - t) / 1000).toFixed(2);

						content.replaceChildren(
							el(
								'div',
								[
									el('div', `搜索到 ${infos.map((i) => i.results).flat().length} 个结果，共耗时 ${resume} 秒`),
									el('search-infos-element', {
										infos: infos.map((info) => ({
											results: info.results.map((res) => [res.question, res.answer] as [string, string]),
											homepage: info.homepage,
											name: info.name
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
			url: [['所有页面', /.*/]],
			hideInPanel: true,
			onstart() {
				try {
					$gm.unsafeWindow.alert = (msg) => {
						$modal('alert', {
							profile: '弹窗来自：' + location.origin,
							content: msg
						});
					};
				} catch (e) {}
			}
		}),
		apps: new Script({
			name: '📱 其他应用',
			url: [['', /.*/]],
			namespace: 'common.apps',
			configs: {
				notes: {
					defaultValue: '这里是一些其他的应用或者拓展功能。'
				},
				/**
				 * 题库缓存
				 */
				localQuestionCaches: {
					defaultValue: [] as QuestionCache[]
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
						CommonProject.scripts.apps.methods.addQuestionCache(
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
						let results: SearchInformation[] = [];
						const caches = this.cfg.localQuestionCaches;
						for (const cache of caches) {
							if (cache.title === title) {
								results.push({
									name: `【题库缓存】${cache.from}`,
									homepage: cache.homepage,
									results: [{ answer: cache.answer, question: cache.title }]
								});
							}
						}
						if (results.length === 0) {
							results = await whenSearchEmpty();
						}
						return results;
					},
					/**
					 * 查看最新通知
					 */
					async showNotify() {
						const notify = el('div', { className: 'markdown card', innerHTML: '加载中...' });

						$modal('simple', {
							content: el('div', [
								el('div', { className: 'notes card' }, [
									$creator.notes([
										'此页面实时更新，大家遇到问题可以看看通知',
										el('div', ['或者进入 ', gotoHome(), ' 里的交流群进行反馈。'])
									])
								]),
								notify
							])
						});
						const md = await request('https://cdn.ocsjs.com/articles/ocs/notify.md?t=' + Date.now(), {
							type: 'GM_xmlhttpRequest',
							responseType: 'text',
							method: 'get'
						});
						notify.innerHTML = markdown(md);
					},
					/**
					 * 查看更新日志
					 */
					async showChangelog() {
						const changelog = el('div', {
							className: 'markdown card',
							innerHTML: '加载中...',
							style: { maxWidth: '600px' }
						});
						$modal('simple', {
							width: 600,
							content: el('div', [
								el('div', { className: 'notes card' }, [
									$creator.notes(['此页面实时更新，遇到问题可以查看最新版本是否修复。'])
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
			onrender({ panel }) {
				const btnStyle: Partial<CSSStyleDeclaration> = {
					padding: '6px 12px',
					margin: '4px',
					marginBottom: '8px',
					boxShadow: '0px 0px 4px #bebebe',
					borderRadius: '8px',
					cursor: 'pointer'
				};

				const cachesBtn = el('div', { innerText: '💾 题库缓存', style: btnStyle }, (btn) => {
					btn.onclick = () => {
						const questionCaches = this.cfg.localQuestionCaches;

						const list = questionCaches.map((c) =>
							el(
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
									el('div', { className: 'title' }, [
										$creator.tooltip(
											el(
												'span',
												{
													title: `来自：${c.from || '未知题库'}\n主页：${c.homepage || '未知主页'}`,
													style: { fontWeight: 'bold' }
												},
												c.title
											)
										)
									]),
									el('div', { className: 'answer', style: { marginTop: '6px' } }, c.answer)
								]
							)
						);

						$modal('simple', {
							width: 800,
							content: el('div', [
								el('div', { className: 'notes card' }, [
									$creator.notes([
										'题库缓存是将题库的题目和答案保存在内存，在重复使用时可以直接从内存获取，不需要再次请求题库。',
										'以下是当前存储的题库，默认存储200题，当前页面关闭后会自动清除。'
									])
								]),
								el('div', { className: 'card' }, [
									$creator.space(
										[
											el('span', ['当前缓存数量：' + questionCaches.length]),
											$creator.button('清空题库缓存', {}, (btn) => {
												btn.onclick = () => {
													this.cfg.localQuestionCaches = [];
													list.forEach((el) => el.remove());
												};
											})
										],
										{ separator: '|' }
									)
								]),

								el(
									'div',
									questionCaches.length === 0 ? [el('div', { style: { textAlign: 'center' } }, '暂无题库缓存')] : list
								)
							])
						});
					};
				});

				[cachesBtn].forEach((btn) => {
					btn.onmouseover = () => {
						btn.style.boxShadow = '0px 0px 4px #0099ff9c';
					};
					btn.onmouseout = () => {
						btn.style.boxShadow = '0px 0px 4px #bebebe';
					};
				});

				panel.body.replaceChildren(
					el('div', [el('div', { className: 'separator', style: { padding: '4px 0px' } }, '题库拓展'), cachesBtn])
				);
			}
		})
	}
});

function enableCopy() {
	// 将页面上的所有选择方法劫持，并强制返回 true
	function hackSelect(target: HTMLElement | Document) {
		if (target) {
			const _original_select = target.onselectstart;
			const _original_oncopy = target.oncopy;
			const _original_onpaste = target.onpaste;
			const _original_onkeydown = target.onkeydown;

			target.onselectstart = (e: any) => {
				_original_select?.apply(target, [e]);
				return true;
			};
			target.oncopy = (e: any) => {
				_original_oncopy?.apply(target, [e]);
				return true;
			};
			target.onpaste = (e: any) => {
				_original_onpaste?.apply(target, [e]);
				return true;
			};
			target.onkeydown = (e: any) => {
				_original_onkeydown?.apply(target, [e]);
				return true;
			};
		}
	}

	hackSelect(document);
	hackSelect(document.body);

	const style = document.createElement('style');
	style.innerHTML = `
		html * {
		  -webkit-user-select: text !important;
		  -khtml-user-select: text !important;
		  -moz-user-select: text !important;
		  -ms-user-select: text !important;
		  user-select: text !important;
		}`;

	document.head.append(style);
}

function createAnswererWrapperList(aw: AnswererWrapper[]) {
	return aw.map((item) =>
		el(
			'details',
			[
				el('summary', [
					$creator.space([
						el('span', item.name),
						(() => {
							let isDisabled = CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.includes(item.name);
							const btn = $creator.button(
								isDisabled ? '启用此题库' : '停用此题库',
								{ className: isDisabled ? 'base-style-button' : 'base-style-button-secondary' },
								(controlsBtn) => {
									controlsBtn.onclick = () => {
										isDisabled = !isDisabled;
										controlsBtn.value = isDisabled ? '启用此题库' : '停用此题库';
										controlsBtn.className = isDisabled ? 'base-style-button' : 'base-style-button-secondary';
										if (isDisabled) {
											CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames = [
												...CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames,
												item.name
											];
										} else {
											CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames =
												CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.filter(
													(name) => name !== item.name
												);
										}
									};
								}
							);

							return btn;
						})()
					])
				]),
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

const createGuide = () => {
	const showProjectDetails = (project: Project) => {
		$modal('simple', {
			title: project.name + ' - 的脚本列表',
			width: 800,
			content: el(
				'ul',
				Object.keys(project.scripts)
					.sort((a, b) => (project.scripts[b].hideInPanel ? -1 : 1))
					.map((key) => {
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
													i[1] instanceof RegExp ? i[1].toString().replace(/\\/g, '').slice(1, -1) : el('span', i[1])
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
		});
	};

	return el('div', { className: 'user-guide card' }, [
		el('div', { className: 'separator', style: { padding: '12px 0px' } }, '✨ 支持的网课平台'),
		el('div', [
			...definedProjects()
				.filter((p) => p.studyProject)
				.map((project) => {
					const btn = el('button', { className: 'base-style-button-secondary' }, [project.name]);
					btn.onclick = () => {
						showProjectDetails(project);
					};
					return btn;
				})
		]),
		el('div', { className: 'separator', style: { padding: '12px 0px' } }, '📖 使用教程'),
		$creator.notes(
			[
				'打开任意网课平台，等待脚本加载，',
				'脚本加载后查看每个网课不同的使用提示。',
				'如果不支持当前网课，则不会有相应的提示以及设置面板。',
				[
					'最后温馨提示: ',
					'- 禁止与其他脚本一起使用，否则出现答案选不上或者页面卡死，无限刷新，等问题一律后果自负。',
					'- 任何疑问请前往官网查看交流群，进入交流群后带截图进行反馈。',
					'- 请将浏览器页面保持最大化，或者缩小窗口，不能最小化，否则可能导致脚本卡死！'
				]
			],
			'ol'
		)
	]);
};
