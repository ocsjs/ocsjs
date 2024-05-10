import debounce from 'lodash/debounce';
import {
	defaultAnswerWrapperHandler,
	AnswerWrapperParser,
	request,
	SimplifyWorkResult,
	$,
	WorkUploadType,
	createQuestionTitleExtra
} from '@ocsjs/core';
import { $message, h, $gm, $store, Project, Script, $modal, StoreListenerType, $ui } from 'easy-us';
import type { AnswerMatchMode, AnswererWrapper, SearchInformation } from '@ocsjs/core';
import { CXProject, ICourseProject, IcveMoocProject, ZHSProject, ZJYProject } from '../index';
import { markdown } from '../utils/markdown';
import { enableCopy } from '../utils';
import { SearchInfosElement } from '../elements/search.infos';
import { RenderScript } from '../render';

const TAB_WORK_RESULTS_KEY = 'common.work-results.results';

const gotoHome = () => {
	const btn = h('button', { className: 'base-style-button-secondary' }, '🏡官网教程');
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
				document.querySelectorAll<HTMLElement>('.subjectDet').item(index)?.scrollIntoView({ behavior: 'smooth' });
			},
			icourse: (index: number) => {
				document.querySelectorAll<HTMLElement>('.u-questionItem').item(index)?.scrollIntoView({ behavior: 'smooth' });
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
			matches: [['所有页面', /.*/]],
			namespace: 'common.guide',
			onrender({ panel }) {
				const guide = createGuide();

				const contactUs = h('button', { className: 'base-style-button-secondary' }, '🗨️交流群');
				contactUs.onclick = () => window.open('https://docs.ocsjs.com/docs/about#交流方式', '_blank');

				const changeLog = h('button', { className: 'base-style-button-secondary' }, '📄查看更新日志');
				changeLog.onclick = () => CommonProject.scripts.apps.methods.showChangelog();

				changeLog.style.marginBottom = '12px';
				guide.style.width = '480px';
				panel.body.replaceChildren(h('div', { className: 'card' }, [gotoHome(), contactUs, changeLog]), guide);
			}
		}),
		settings: new Script({
			name: '⚙️ 全局设置',
			matches: [['所有页面', /.*/]],
			namespace: 'common.settings',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'✨鼠标移动到按钮或者输入框，可以看到提示！',
						'想要自动答题必须设置 “题库配置” ',
						'设置后进入章节测试，作业，考试页面即可自动答题。'
					]).outerHTML
				},
				notification: {
					label: '系统通知',
					attrs: {
						title:
							'允许脚本发送系统通知，只有重要事情发生时会发送系统通知，尽量避免用户受到骚扰（在电脑屏幕右侧显示通知弹窗，例如脚本执行完毕，图形验证码，版本更新等通知）。'
					},
					tag: 'select',
					defaultValue: 'only-notify' as 'only-notify' | 'notify-and-voice' | 'all' | 'no-notify',
					options: [
						['only-notify', '只显示右下角通知'],
						['notify-and-voice', '通知以及提示音（叮的一声）'],
						['all', '通知，提示音，以及任务栏闪烁提示'],
						['no-notify', '关闭系统通知']
					]
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
							const copy = $ui.copy('复制题库配置', JSON.stringify(aw, null, 4));

							const list = h('div', [
								h('div', aw.length ? ['以下是已经解析过的题库配置：', copy] : ''),
								...createAnswererWrapperList(aw)
							]);
							const textarea = h(
								'textarea',
								{
									className: 'modal-input',
									style: { minHeight: '250px', width: 'calc(100% - 20px)', maxWidth: '100%' },
									placeholder: aw.length ? '重新输入题库配置' : '输入你的题库配置...'
								},
								aw.length === 0 ? '' : JSON.stringify(aw, null, 4)
							);

							const select = $ui.tooltip(
								h(
									'select',
									{
										className: 'base-style-active-form-control',
										style: { backgroundColor: '#eef2f7', borderRadius: '2px', padding: '2px 8px' }
									},
									[
										h('option', '默认'),
										h(
											'option',
											{
												title:
													'大学生网课题库接口适配器: 将不同的题库整合为一个API接口。详细查看 https://github.com/DokiDoki1103/tikuAdapter'
											},
											'TikuAdapter'
										)
									]
								)
							);

							const modal = $modal.prompt({
								width: 600,
								maskCloseable: false,
								content: $ui.notes([
									[
										h('div', [
											'题库配置填写教程：',
											h('a', { href: 'https://docs.ocsjs.com/docs/work' }, 'https://docs.ocsjs.com/docs/work')
										])
									],
									[
										h('div', [
											'【注意】如果无法粘贴，请点击此按钮：',
											h('button', '读取剪贴板', (btn) => {
												btn.classList.add('base-style-button');
												btn.onclick = () => {
													navigator.clipboard.readText().then((result) => {
														textarea.value = result;
													});
												};
											}),
											'，并同意浏览器上方的剪贴板读取申请。'
										])
									],
									...(aw.length ? [list] : [])
								]),
								footer: h('div', { style: { width: '100%' } }, [
									textarea,
									h('div', { style: { display: 'flex', flexWrap: 'wrap', marginTop: '12px', fontSize: '12px' } }, [
										h('div', ['解析器：', select], (div) => {
											div.style.marginRight = '12px';
											div.style.flex = '1';
										}),
										h('div', { style: { flex: '1', display: 'flex', flexWrap: 'wrap', justifyContent: 'end' } }, [
											h('button', '清空题库配置', (btn) => {
												btn.className = 'modal-cancel-button';
												btn.style.marginRight = '48px';
												btn.onclick = () => {
													$modal.confirm({
														content: '确定要清空题库配置吗？',
														onConfirm: () => {
															$message.success({ content: '已清空，在答题前请记得重新配置。' });
															modal?.remove();
															CommonProject.scripts.settings.cfg.answererWrappers = [];
															this.value = '点击配置';
														}
													});
												};
											}),
											h('button', '关闭', (btn) => {
												btn.className = 'modal-cancel-button';
												btn.style.marginRight = '12px';
												btn.onclick = () => modal?.remove();
											}),
											h('button', '保存配置', (btn) => {
												btn.className = 'modal-confirm-button';
												btn.onclick = async () => {
													const connects: string[] = $gm.getMetadataFromScriptHead('connect');

													const value = textarea.value;

													if (value) {
														if (
															value.includes('adapter-service/search') &&
															(select.value === 'TikuAdapter') === false
														) {
															$modal.alert({
																content: h('div', [
																	'检测到您可能正在使用 ',
																	h(
																		'a',
																		{ href: 'https://github.com/DokiDoki1103/tikuAdapter#readme' },
																		'TikuAdapter 题库'
																	),
																	'，但是您选择的解析器不是 TikuAdapter，请选择 TikuAdapter 解析器，并填写接口地址即可，例如：http://localhost:8060/adapter-service/search，或者忽略此警告。'
																]),
																confirmButtonText: '切换至 TikuAdapter 解析器，并识别接口地址',
																onConfirm() {
																	const origin =
																		textarea.value.match(/http:\/\/(.+)\/adapter-service\/search/)?.[1] || '';
																	textarea.value = `http://${origin}/adapter-service/search`;
																	select.value = 'TikuAdapter';
																}
															});
															return;
														}

														try {
															const awsResult: AnswererWrapper[] = [];
															if (select.value === 'TikuAdapter') {
																if (value.startsWith('http') === false) {
																	$modal.alert({
																		content: h('div', [
																			'格式错误，TikuAdapter解析器只能解析 url 链接，请重新输入！或者查看：',
																			h(
																				'a',
																				{ href: 'https://github.com/DokiDoki1103/tikuAdapter#readme' },
																				'https://github.com/DokiDoki1103/tikuAdapter#readme'
																			)
																		])
																	});
																	return;
																}
																select.value = '默认';
																awsResult.push({
																	name: 'TikuAdapter题库',
																	url: value,
																	homepage: 'https://github.com/DokiDoki1103/tikuAdapter',
																	method: 'post',
																	type: 'GM_xmlhttpRequest',
																	contentType: 'json',
																	headers: {},
																	data: {
																		// eslint-disable-next-line no-template-curly-in-string
																		question: '${title}',
																		options: {
																			handler: "return (env)=>env.options?.split('\\n')"
																		},
																		type: {
																			handler:
																				" return (env)=> env.type === 'single' ? 0 : env.type === 'multiple' ? 1 : env.type === 'completion' ? 3 : env.type === 'judgement' ? 4 : undefined"
																		}
																	},
																	handler: "return (res)=>res.answer.allAnswer.map(i=>([res.question,i.join('#')]))"
																});
															} else {
																awsResult.push(...(await AnswerWrapperParser.from(value)));
															}

															if (awsResult.length) {
																CommonProject.scripts.settings.cfg.answererWrappers = awsResult;
																this.value = '当前有' + awsResult.length + '个可用题库';
																$modal.confirm({
																	width: 600,
																	content: h('div', [
																		h('div', [
																			'🎉 配置成功，',
																			h('b', ' 刷新网页后 '),
																			'重新进入',
																			h('b', ' 答题页面 '),
																			'即可。',
																			'解析到的题库如下所示:'
																		]),
																		...createAnswererWrapperList(awsResult)
																	]),
																	onConfirm: () => {
																		if ($gm.isInGMContext()) {
																			top?.document.location.reload();
																		}
																	},
																	...($gm.isInGMContext()
																		? {
																				confirmButtonText: '立即刷新',
																				cancelButtonText: '稍后刷新'
																		  }
																		: {})
																});

																// 格式化文本
																textarea.value = JSON.stringify(awsResult, null, 4);

																// 检测 connects.length 是因为 如果在软件的软件设置全局配置中，上下文的 GM_info 会变成空
																if (connects.length) {
																	// 检测是否有域名白名单
																	const notAllowed: string[] = [];

																	// 如果是通用版本，则不检测
																	if (connects.includes('*')) {
																		return;
																	}

																	for (const aw of awsResult) {
																		if (
																			connects.some((connect) => new URL(aw.url).hostname.includes(connect)) === false
																		) {
																			notAllowed.push(aw.url);
																		}
																	}
																	if (notAllowed.length) {
																		$modal.alert({
																			width: 600,
																			maskCloseable: false,
																			title: '⚠️警告',
																			content: h('div', [
																				h('div', [
																					'配置成功，但检测到以下 域名/ip 不在脚本的白名单中，请安装 : ',
																					h(
																						'a',
																						{
																							href: 'https://docs.ocsjs.com/docs/other/api#全域名通用版本'
																						},
																						'OCS全域名通用版本'
																					),
																					'，或者手动添加 @connect ，否则无法进行请求。',
																					h(
																						'ul',
																						notAllowed.map((url) => h('li', new URL(url).hostname))
																					)
																				])
																			])
																		});
																	}
																}
															} else {
																$modal.alert({ content: '题库配置不能为空，请重新配置。' });
															}
														} catch (e: any) {
															$modal.alert({
																content: h('div', [h('div', '解析失败，原因如下 :'), h('div', e.message)])
															});
														}
													} else {
														$modal.alert({
															content: h('div', '不能为空！')
														});
													}
												};
											})
										])
									])
								])
							});
						};
					}
				},
				upload: {
					label: '答题完成后',
					tag: 'select',
					defaultValue: 80 as WorkUploadType,
					options: [
						['save', '自动保存', '完成后自动保存答案, 注意如果你开启了随机作答, 有可能分辨不出答案是否正确。'],
						['nomove', '不保存也不提交', '等待时间过后将会自动下一节, 适合在测试脚本时使用。'],
						...([10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => [
							rate.toString(),
							`搜到${rate}%的题目则自动提交`,
							`例如: 100题中查询到 ${rate} 题的答案,（答案不一定正确）, 则会自动提交。`
						]) as [any, string, string][]),
						['100', '每个题目都查到答案才自动提交', '答案不一定正确'],
						['force', '强制自动提交', '不管答案是否正确直接强制自动提交，如需开启，请配合随机作答谨慎使用。']
					],
					attrs: {
						title:
							'自动答题完成后的设置，目前仅在 超星学习通的章节测试 中生效, 鼠标悬浮在选项上可以查看每个选项的具体解释。'
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
					label: '搜题间隔（秒）',
					attrs: {
						type: 'number',
						min: 1,
						step: 1,
						max: 60,
						title: '每道题的搜题间隔时间，不建议太低，避免增加服务器压力。'
					},
					defaultValue: 3
				},
				'work-when-no-job': {
					defaultValue: false,
					label: '(仅超星)强制答题',
					attrs: {
						type: 'checkbox',
						title:
							'当章节测试左上角并没有黄色任务点的时候依然进行答题（没有任务点说明此作业可能不计入总成绩，如果老师要求则可以开启）'
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
					attrs: { title: '每行一个，随机填入', style: { minWidth: '200px', minHeight: '50px' } },
					onload(el) {
						el.addEventListener('change', () => {
							if (String(el.value).trim() === '') {
								el.value = el.defaultValue;
							}
						});
					}
				},
				answerSeparators: {
					label: '答案分隔符',
					attrs: {
						title: "分隔答案的符号，例如：答案1#答案2#答案3，分隔符为 #， 使用英文逗号进行隔开 : ',' "
					},
					defaultValue: ['===', '#', '---', '###', '|', ';', '；'].join(','),
					onload(el) {
						el.addEventListener('change', () => {
							if (String(el.value).trim() === '') {
								el.value = el.defaultValue;
							}
						});
					}
				},
				redundanceWordsText: {
					defaultValue: [
						'单选题(必考)',
						'填空题(必考)',
						'多选题(必考)',
						'【单选题】',
						'【多选题】',
						'【Single Choice】',
						'【Multiple Choice】',
						'【single choice】',
						'【multiple choice】',
						'【True or False】'
					].join('\n'),
					label: '题目冗余字段自动删除',
					tag: 'textarea',
					attrs: {
						title: '在搜题的时候自动删除多余的文字，以便提高搜题的准确度，每行一个。',
						style: { minWidth: '200px', minHeight: '50px' }
					},
					onload(el) {
						el.addEventListener('change', () => {
							if (String(el.value).trim() === '') {
								el.value = el.defaultValue;
							}
						});
					}
				},
				answerMatchMode: {
					label: '答案匹配模式',
					tag: 'select',
					defaultValue: 'similar' as AnswerMatchMode,
					options: [
						['similar', '相似匹配', '答案相似度达到60%以上就匹配'],
						['exact', '精确匹配', '答案必须完全一致才匹配']
					]
				}
			},
			methods() {
				return {
					/**
					 * 获取自动答题配置，包括题库配置
					 */
					getWorkOptions: () => {
						// 使用 json 深拷贝，防止修改原始配置
						const workOptions: typeof this.cfg = JSON.parse(JSON.stringify(this.cfg));

						/**
						 * 过滤掉被禁用的题库
						 */
						workOptions.answererWrappers = workOptions.answererWrappers.filter(
							(aw) => this.cfg.disabledAnswererWrapperNames.find((daw) => daw === aw.name) === undefined
						);

						return workOptions;
					},
					/**
					 * 根据全局设置的配置，发起通知
					 * @param content
					 * @param opts
					 */
					notificationBySetting: (
						content: string,
						opts?: {
							extraTitle?: string;
							/** 显示时间，单位为秒，默认为 30 秒， 0 则表示一直存在 */
							duration?: number;
							/** 通知点击时 */
							onclick?: () => void;
							/** 通知关闭时 */
							ondone?: () => void;
						}
					) => {
						if (this.cfg.notification !== 'no-notify') {
							$gm.notification(content, {
								extraTitle: opts?.extraTitle,
								duration: opts?.duration ?? 30,
								important: this.cfg.notification === 'all',
								silent: this.cfg.notification === 'only-notify'
							});
						}
					}
				};
			},
			onrender({ panel }) {
				// 因为需要用到 GM_xhr 所以判断是否处于用户脚本环境
				if ($gm.isInGMContext()) {
					panel.body.replaceChildren(...(this.cfg.answererWrappers.length ? [h('hr')] : []));
					const testNotification = h(
						'button',
						{ className: 'base-style-button', disabled: this.cfg.answererWrappers.length === 0 },
						'📢测试系统通知'
					);
					testNotification.onclick = () => {
						this.methods.notificationBySetting('这是一条测试通知');
					};
					const refresh = h(
						'button',
						{ className: 'base-style-button', disabled: this.cfg.answererWrappers.length === 0 },
						'🔄️刷新题库状态'
					);
					refresh.onclick = () => {
						updateState();
					};
					const tableContainer = h('div');
					refresh.style.display = 'none';
					tableContainer.style.display = 'none';
					panel.body.append(h('div', { style: { display: 'flex' } }, [testNotification, refresh]), tableContainer);

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

							const table = h('table');
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

								const body = h('tbody');
								body.append(h('td', item.name));
								body.append(
									h('td', [
										$ui.tooltip(
											h(
												'span',
												{ title: isDisabled ? '题目已经被停用，请在上方题库配置中点击开启。' : '' },
												success ? '连接成功🟢' : isDisabled ? '已停用⚪' : error ? '连接失败🔴' : '连接超时🟡'
											)
										)
									])
								);
								body.append(h('td', `延迟 : ${success ? Date.now() - t : '---'}/ms`));
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
			}
		}),
		workResults: new Script({
			name: '🌏 搜索结果',
			matches: [['所有页面', /.*/]],
			namespace: 'common.work-results',
			configs: {
				notes: {
					defaultValue: $ui.notes(['点击题目序号，查看搜索结果', '每次自动答题开始前，都会清空上一次的搜索结果。'])
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
					options: [
						['numbers', '序号列表'],
						['questions', '题目列表']
					],
					attrs: {
						title: '使用题目列表可能会造成页面卡顿。'
					},
					defaultValue: 'numbers' as 'questions' | 'numbers'
				},
				totalQuestionCount: {
					defaultValue: 0
				},
				requestedCount: {
					defaultValue: 0
				},
				resolvedCount: {
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
					 * 从搜索结果中计算状态，并更新
					 */
					updateWorkStateByResults: (results: { requested: boolean; resolved: boolean }[]) => {
						this.cfg.totalQuestionCount = results.length;
						this.cfg.requestedCount = results.filter((result) => result.requested).length;
						this.cfg.resolvedCount = results.filter((result) => result.resolved).length;
					},
					/**
					 * 更新状态
					 */
					updateWorkState: (state: { totalQuestionCount: number; requestedCount: number; resolvedCount: number }) => {
						this.cfg.totalQuestionCount = state.totalQuestionCount;
						this.cfg.requestedCount = state.requestedCount;
						this.cfg.resolvedCount = state.resolvedCount;
					},
					/**
					 * 刷新状态
					 */
					refreshState: () => {
						this.cfg.totalQuestionCount = 0;
						this.cfg.requestedCount = 0;
						this.cfg.resolvedCount = 0;
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
						const container = mount || h('div');
						/** 记录滚动高度 */
						let scrollPercent = 0;

						/** 列表 */
						const list = h('div');

						/** 是否悬浮在题目上 */
						let mouseoverIndex = -1;

						list.onscroll = () => {
							scrollPercent = list.scrollTop / list.scrollHeight;
						};

						/** 给序号设置样式 */
						const setNumStyle = (result: SimplifyWorkResult, num: HTMLElement, index: number) => {
							if (result.requested) {
								num.classList.add('requested');
							}

							if (index === this.cfg.currentResultIndex) {
								num.classList.add('active');
							}

							if (result.finish) {
								num.classList.add('finish');
							} else {
								if (
									result.requested &&
									result.resolved &&
									(result.error?.trim().length !== 0 || result.searchInfos.length === 0 || result.finish === false)
								) {
									num.classList.add('error');
								}
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
									const resultContainer = h('div', {}, (res) => {
										res.style.width = '400px';
									});

									list.style.width = '400px';
									list.style.marginBottom = '12px';
									list.style.overflow = 'auto';
									list.style.maxHeight = '200px';

									/** 渲染序号 */
									const nums = results.map((result, index) => {
										return h('span', { className: 'search-infos-num', innerText: (index + 1).toString() }, (num) => {
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
									const resultContainer = h('div', { className: 'work-result-question-container' });
									const nums: HTMLSpanElement[] = [];
									/** 左侧渲染题目列表 */
									const questions = results.map((result, index) => {
										/** 左侧序号 */
										const num = h(
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

										return h(
											'div',

											[num, result.question],
											(question) => {
												question.onmouseover = () => {
													mouseoverIndex = index;
													// 重新渲染结果列表
													resultContainer.replaceChildren(createResult(result));
												};

												question.onmouseleave = () => {
													mouseoverIndex = -1;
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
										h('div', [list, h('div', {}, [resultContainer])], (div) => {
											div.style.display = 'flex';
										})
									);
								}
							} else {
								container.replaceChildren(
									h('div', '⚠️暂无任何搜索结果', (div) => {
										div.style.textAlign = 'center';
									})
								);
							}

							/** 恢复高度 */
							list.scrollTo({
								top: scrollPercent * list.scrollHeight,
								behavior: 'auto'
							});

							const tip = h('div', [
								h('div', { className: 'search-infos-num' }, '1'),
								'表示等待处理中',
								h('br'),
								h('div', { className: 'search-infos-num requested' }, '1'),
								'表示已完成搜索 ',
								h('br'),
								h('div', { className: 'search-infos-num finish' }, '1'),
								'表示已搜索已答题 '
							]);

							/** 添加信息 */
							container.prepend(
								h('hr'),
								h(
									'div',
									[
										$ui.space(
											[
												h('span', `已搜题: ${this.cfg.requestedCount}/${this.cfg.totalQuestionCount}`),
												h('span', `已答题: ${this.cfg.resolvedCount}/${this.cfg.totalQuestionCount}`),
												h('a', '提示', (btn) => {
													btn.style.cursor = 'pointer';
													btn.onclick = () => {
														$modal.confirm({ content: tip, footer: undefined });
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

								h('hr')
							);
						}, 100);

						/** 渲染结果列表 */
						const createResult = (result: SimplifyWorkResult | undefined) => {
							if (result) {
								const error = h('span', {}, (el) => (el.style.color = 'red'));

								if (result.requested === false && result.resolved === false) {
									return h('div', [
										result.question,
										createQuestionTitleExtra(result.question),
										h('hr'),
										'当前题目还未开始搜索，请稍等。'
									]);
								} else {
									if (result.error) {
										error.innerText = result.error;
										return h('div', [result.question, createQuestionTitleExtra(result.question), h('hr'), error]);
									} else if (result.searchInfos.length === 0) {
										error.innerText = '此题未搜索到答案';
										return h('div', [result.question, createQuestionTitleExtra(result.question), h('hr'), error]);
									} else {
										error.innerText = '此题未完成, 可能是没有匹配的选项。';

										return h('div', [
											...(result.finish ? [] : [result.resolved === false ? '正在等待答题中，请稍等。' : error]),
											h(SearchInfosElement, {
												infos: result.searchInfos,
												question: result.question
											})
										]);
									}
								}
							} else {
								return h('div', 'undefined');
							}
						};

						render();
						this.onConfigChange('type', render);
						this.onConfigChange('requestedCount', render);
						this.onConfigChange('resolvedCount', render);
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
			matches: [['所有页面', /.*/]],
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
				searchValue: {
					sync: true,
					label: '搜索题目',
					tag: 'textarea',
					attrs: {
						placeholder: '输入题目，请尽量保证题目完整，不要漏字',
						style: {
							minWidth: '300px',
							minHeight: '64px'
						}
					},
					defaultValue: ''
				}
			},
			oncomplete() {
				document.addEventListener(
					'selectionchange',
					debounce(() => {
						if (this.cfg.selectSearch) {
							const val = document.getSelection()?.toString() || '';
							if (val) {
								this.cfg.searchValue = val;
							}
						}
					}, 500)
				);
			},
			onrender({ panel }) {
				const content = h('div', '', (content) => {
					content.style.marginBottom = '12px';
				});

				const search = async (value: string) => {
					if (CommonProject.scripts.settings.cfg.answererWrappers.length === 0) {
						$modal.alert({ content: '请先在 通用-全局设置 配置题库，才能进行在线搜题。' });
						return;
					}

					content.replaceChildren(h('span', '搜索中...'));

					if (value) {
						const t = Date.now();
						const infos = await defaultAnswerWrapperHandler(CommonProject.scripts.settings.cfg.answererWrappers, {
							title: value
						});
						// 耗时计算
						const resume = ((Date.now() - t) / 1000).toFixed(2);

						content.replaceChildren(
							h(
								'div',
								[
									h('hr'),
									h(
										'div',
										{ style: { color: '#a1a1a1' } },
										`搜索到 ${infos.map((i) => i.results).flat().length} 个结果，共耗时 ${resume} 秒`
									),
									h(SearchInfosElement, {
										infos: infos.map((info) => ({
											results: info.results.map((res) => [res.question, res.answer] as [string, string]),
											homepage: info.homepage,
											name: info.name
										})),
										question: value
									})
								],
								(div) => {
									div.classList.add('card');
									div.style.width = '480px';
								}
							)
						);
					} else {
						content.replaceChildren(h('span', '题目不能为空！'));
					}
				};

				const button = h('button', '搜索', (button) => {
					button.className = 'base-style-button';
					button.style.width = '120px';
					button.onclick = () => {
						search(this.cfg.searchValue);
					};
				});
				const searchContainer = h('div', { style: { textAlign: 'end' } }, [button]);

				panel.body.append(h('div', [content, searchContainer]));
			}
		}),
		/** 渲染脚本，窗口渲染主要脚本 */
		render: RenderScript,
		hack: new Script({
			name: '页面复制粘贴限制解除',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			onactive() {
				enableCopy([document, document.body]);
			},
			oncomplete() {
				enableCopy([document, document.body]);
				insertCopyableStyle();
				setTimeout(() => {
					enableCopy([document, document.body]);
					insertCopyableStyle();
				}, 3000);
			}
		}),
		disableDialog: new Script({
			name: '禁止弹窗',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			priority: 1,
			onstart() {
				function disableDialog(msg: string) {
					$modal.alert({
						profile: '弹窗来自：' + location.origin,
						content: msg
					});
				}

				try {
					$gm.unsafeWindow.alert = disableDialog;
					window.alert = disableDialog;
				} catch (e) {
					console.error(e);
				}
			}
		}),
		apps: new Script({
			name: '📱 拓展应用',
			matches: [['', /.*/]],
			namespace: 'common.apps',
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
						if (CommonProject.scripts.settings.cfg.enableQuestionCaches === false) {
							return await whenSearchEmpty();
						}

						let results: SearchInformation[] = [];
						const caches = this.cfg.localQuestionCaches;
						for (const cache of caches) {
							if (cache.title.trim() === title.trim()) {
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
					 * 查看更新日志
					 */
					async showChangelog() {
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
			onrender({ panel }) {
				const btnStyle: Partial<CSSStyleDeclaration> = {
					padding: '6px 12px',
					margin: '4px',
					marginBottom: '8px',
					boxShadow: '0px 0px 4px #bebebe',
					borderRadius: '8px',
					cursor: 'pointer'
				};

				const cachesBtn = h('div', { innerText: '💾 题库缓存', style: btnStyle }, (btn) => {
					btn.onclick = () => {
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
											h('span', ['当前缓存数量：' + questionCaches.length]),
											$ui.button('清空题库缓存', {}, (btn) => {
												btn.onclick = () => {
													this.cfg.localQuestionCaches = [];
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
					};
				});

				const exportSetting = $ui.tooltip(
					h(
						'div',
						{
							innerText: '📤 导出全部设置',
							style: btnStyle,
							title: '导出全部页面的设置，包括全局设置，题库配置，学习设置等等。（文件后缀名为：.ocssetting）'
						},
						(btn) => {
							btn.onclick = () => {
								const setting = Object.create({});
								for (const key of $store.list()) {
									const val = $store.get(key);
									if (val) {
										Reflect.set(setting, key, val);
									}
								}
								const blob = new Blob([JSON.stringify(setting, null, 2)], { type: 'text/plain' });
								const url = URL.createObjectURL(blob);
								const a = h('a', { href: url, download: 'ocs-setting-export.ocssetting' });
								a.click();
								URL.revokeObjectURL(url);
							};
						}
					)
				);

				const importSetting = $ui.tooltip(
					h(
						'div',
						{
							innerText: '📥 导入全部设置',
							style: btnStyle,
							title: '导入并且覆盖当前的全部设置。（文件后缀名为：.ocssetting）'
						},
						(btn) => {
							btn.onclick = () => {
								const input = h('input', { type: 'file', accept: '.ocssetting' });
								input.onchange = async () => {
									const file = input.files?.[0];
									if (file) {
										const setting = await file.text();
										const obj = JSON.parse(setting);
										for (const key of Object.keys(obj)) {
											$store.set(key, obj[key]);
										}
										$message.success({ content: '设置导入成功，页面即将刷新。', duration: 3 });
										setTimeout(() => {
											location.reload();
										}, 3000);
									}
								};
								input.click();
							};
						}
					)
				);

				[cachesBtn, exportSetting, importSetting].forEach((btn) => {
					btn.onmouseover = () => {
						btn.style.boxShadow = '0px 0px 4px #0099ff9c';
					};
					btn.onmouseout = () => {
						btn.style.boxShadow = '0px 0px 4px #bebebe';
					};
				});

				const sep = (text: string) => h('div', { className: 'separator', style: { padding: '4px 0px' } }, text);

				panel.body.replaceChildren(
					h('div', [sep('题库拓展'), cachesBtn, sep('其他功能'), exportSetting, importSetting])
				);
			}
		})
	}
});

function insertCopyableStyle() {
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
		h(
			'details',
			[
				h('summary', [
					$ui.space([
						(() => {
							let isDisabled = CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.includes(item.name);

							const checkbox = h('input', { type: 'checkbox', checked: !isDisabled, className: 'base-style-switch' });

							checkbox.onclick = () => {
								isDisabled = !isDisabled;
								if (isDisabled) {
									CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames = [
										...CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames,
										item.name
									];
									$message.warn({
										content: '题库：' + item.name + ' 已被停用，如需开启请在：通用-全局设置-题库配置中开启。',
										duration: 30
									});
								} else {
									CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames =
										CommonProject.scripts.settings.cfg.disabledAnswererWrapperNames.filter(
											(name) => name !== item.name
										);
									$message.success({
										content: '题库：' + item.name + ' 已启用。',
										duration: 3
									});
								}
							};

							checkbox.title = '点击停用或者启用题库，停用题库后将无法在自动答题中查询题目';

							return $ui.tooltip(checkbox);
						})(),
						h('span', item.name)
					])
				]),
				h('ul', [
					h('li', ['名字\t', item.name]),
					h('li', { innerHTML: `官网\t<a target="_blank" href=${item.homepage}>${item.homepage || '无'}</a>` }),
					h('li', ['接口\t', item.url]),
					h('li', ['请求方法\t', item.method]),
					h('li', ['请求类型\t', item.type]),
					h('li', ['请求头\t', JSON.stringify(item.headers, null, 4) || '无']),
					h('li', ['请求体\t', JSON.stringify(item.data, null, 4) || '无'])
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
		$modal.simple({
			title: project.name,
			width: 800,
			content: h('div', [
				h('div', [
					'运行域名：',
					...(project.domains || []).map((d) =>
						h(
							'a',
							{ href: d.startsWith('http') ? d : 'https://' + d, target: '_blank', style: { margin: '0px 4px' } },
							d
						)
					)
				]),
				h('div', '脚本列表：'),
				h(
					'ul',
					Object.keys(project.scripts)
						.sort((a, b) => (project.scripts[b].hideInPanel ? -1 : 1))
						.map((key) => {
							const script = project.scripts[key];
							return h(
								'li',
								[
									h('b', script.name),
									$ui.notes([
										h('span', ['操作面板：', script.hideInPanel ? '隐藏' : '显示']),

										[
											'运行页面：',
											h(
												'ul',
												script.matches
													.map((m) => (Array.isArray(m) ? m : (['无描述', m] as [string, string | RegExp])))
													.map((i) =>
														h('li', [
															i[0],
															'：',
															i[1] instanceof RegExp ? i[1].toString().replace(/\\/g, '').slice(1, -1) : h('span', i[1])
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
			])
		});
	};

	return h('div', { className: 'user-guide card' }, [
		h('div', { className: 'separator', style: { padding: '12px 0px' } }, '✨ 支持的网课平台'),
		h('div', [
			...[CXProject, ZHSProject, ZJYProject, IcveMoocProject, ICourseProject].map((project) => {
				const btn = h('button', { className: 'base-style-button-secondary', style: { margin: '4px' } }, [project.name]);
				btn.onclick = () => {
					showProjectDetails(project);
				};
				return btn;
			})
		]),
		h('div', { className: 'separator', style: { padding: '12px 0px' } }, '📖 使用教程'),
		$ui.notes(
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
