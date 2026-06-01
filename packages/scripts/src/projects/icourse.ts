import { $, OCSWorker, RemotePage, defaultAnswerWrapperHandler } from '@ocsjs/core';
import { $message, Project, Script, $ui, $store } from 'easy-us';
import { CommonWorkOptions, playMedia } from '../utils';
import { CommonProject } from './common';
import { commonWork, optimizationElementWithImage, removeRedundantWords, simplifyWorkResult } from '../utils/work';
import { $console, BackgroundProject } from './background';
import { $playwright } from '../utils/app';
import { waitForElement, waitForMedia } from '../utils/study';
import { playbackRate, volume, workNotes } from '../utils/configs';
import { $render } from '../utils/render';

const $msg_and_log = (type: 'info' | 'warn' | 'error', msg: string) => {
	$message[type](msg);
	$console[type](msg);
};

const state = {
	currentMedia: undefined as HTMLMediaElement | undefined,
	currentUrlHash: '',
	currentRunningScriptName: '',
	current_job_id: ''
};

export const ICourseProject = Project.create({
	name: '中国大学MOOC',
	domains: ['icourse163.org'],
	scripts: {
		dispatcher: new Script({
			name: '调度器',
			hideInPanel: true,
			matches: [['所有页面', 'icourse163.org']],
			oncomplete() {
				setInterval(() => {
					const hash = new URL(window.location.href).hash;
					if (state.currentUrlHash !== hash) {
						state.currentRunningScriptName = '';
					}
					state.currentUrlHash = hash;

					for (const key in ICourseProject.scripts) {
						if (Object.prototype.hasOwnProperty.call(ICourseProject.scripts, key)) {
							const script = (ICourseProject.scripts as any)[key] as Script<{
								runAtHash: { defaultValue: string | string[] };
							}>;
							const runAtHash = Array.isArray(script.cfg.runAtHash) ? script.cfg.runAtHash : [script.cfg.runAtHash];
							if (runAtHash.length && runAtHash.some((h) => state.currentUrlHash.includes(h))) {
								if (state.currentRunningScriptName !== script.name) {
									state.currentRunningScriptName = script.name;
									state.current_job_id = Math.random().toString(16).slice(2);
									script.methods?.main?.({
										canRun: () => {
											return state.currentUrlHash && runAtHash.some((h) => state.currentUrlHash.includes(h));
										},
										job_id: state.current_job_id
									});
								}
								break;
							}
						}
					}
				}, 1000);
			}
		}),
		guide: new Script({
			name: '💡 使用提示',
			matches: [['', 'icourse163.org']],
			// 添加版本号是因为只有 notes 会强制更新，其他配置项不会，如果需要修改 runAtHash ，需要更新版本号
			namespace: 'icourse.guide-v1',
			configs: {
				notes: {
					defaultValue: $ui.notes(['手动进入任意课程里的课件/作业，即可开始自动学习']).outerHTML
				},
				runAtHash: {
					// 在没有进入学习页面前，都显示提示
					defaultValue: ['/home/course']
				}
			},
			methods() {
				return {
					main: async () => {
						console.log(state, this.cfg.runAtHash);

						CommonProject.scripts.render.methods.pin(this);
					}
				};
			}
		}),
		study: new Script({
			name: '🖥️ 学习脚本',
			// 添加版本号是因为只有 notes 会强制更新，其他配置项不会，如果需要修改 runAtHash ，需要更新版本号
			namespace: 'icourse.study-v1',
			matches: [
				['MOOC作业页面', 'icourse163.org/learn'],
				['SPOC作业页面', 'icourse163.org/spoc/learn']
			],
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'请勿在使用过程中最小化浏览器',
						'自动讨论默认关闭，如需开启请在下方设置中设置',
						'作业请完成课程后手动进入'
					]).outerHTML
				},
				runAtHash: {
					defaultValue: '/learn/content?type=detail'
				},
				playbackRate: playbackRate,
				volume: volume,
				readSpeed: {
					label: 'PPT翻阅速度（秒）',
					attrs: { type: 'number', step: '1', min: '1', max: '10' },
					defaultValue: 1
				},
				discussionStrategy: {
					label: '讨论自动回复方式',
					tag: 'select',
					defaultValue: 'not-reply' as 'not-reply' | 'max-show-up' | 'max-fav' | 'use-newest',
					options: [
						['not-reply', '不讨论回复'],
						['max-show-up', '获取出现最多的评论进行回复'],
						['max-fav', '获取最多点赞的评论进行回复'],
						['use-newest', '获取最新的评论进行回复']
					]
				},
				enableChapterTest: {
					label: '随堂测验自动答题',
					attrs: {
						type: 'checkbox',
						title: '是否开启随堂测验自动答题，默认关闭，测试时只需点击即可完成测验，但这里保留选项防止需要开启。'
					},
					defaultValue: false
				}
			},
			oncomplete() {
				this.onConfigChange('playbackRate', (playbackRate) => {
					state.currentMedia && (state.currentMedia.playbackRate = parseFloat(playbackRate.toString()));
				});
				this.onConfigChange('volume', (v) => state.currentMedia && (state.currentMedia.volume = v));
			},
			methods() {
				return {
					main: async ({ canRun, job_id }: { canRun: () => boolean; job_id: string }) => {
						CommonProject.scripts.render.methods.pin(this);

						const remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
						// 检查是否为软件环境
						if (!remotePage) {
							return $playwright.showError();
						}

						// 移动窗口到边缘
						$render.moveToEdge();

						/**
						 * 处理视频弹窗题目
						 */
						const handleVideoTest = async () => {
							if (!canRun() || job_id !== state.current_job_id) return;
							setTimeout(async () => {
								const question = document.querySelector('.u-questionItem');
								const media = document.querySelector('video,audio');
								if (question && media) {
									$msg_and_log('info', '检测到视频弹窗测验，开始答题');
									await new Promise<void>((resolve) => {
										ICourseProject.scripts.work.methods.start('chapter-test', canRun, (worker) => {
											console.log('worker', worker);
											worker.once('done', resolve);
											worker.once('close', resolve);
											worker.once('stop', resolve);
										});
									});
									await $.sleep(1000);
									// 点击继续学习
									await remotePage.click('.j-unitctBox .u-btn-default.j-continue');
									$msg_and_log('info', '测验完成');
								}
								handleVideoTest();
							}, 3000);
						};
						handleVideoTest();

						const study = async () => {
							const lessonName = document.querySelector('.j-lesson .j-up')?.textContent;
							const currentUnitItem = document.querySelector('.j-unitslist  li.current');
							const unitName = currentUnitItem?.querySelector('.unit-name')?.textContent;

							$msg_and_log('info', `正在学习：${lessonName || ''} - ${unitName || ''}`);

							const isJob = (iconName: string) => currentUnitItem?.querySelector(`[class*=${iconName}]`);

							let hasJob = true;

							if (isJob('u-icon-video')) {
								await waitForElement('video, audio');
								await watchMedia(this.cfg.playbackRate, this.cfg.volume);
								$msg_and_log('info', '视频学习完成');
							} else if (isJob('u-icon-doc')) {
								await waitForElement('.ux-pdf-reader');
								await readPPT(remotePage, this.cfg.readSpeed);
								$msg_and_log('info', 'PPT完成');
							} else if (isJob('u-icon-discuss')) {
								await waitForElement('.j-reply-all');
								await discussion(remotePage, this.cfg.discussionStrategy);
								$msg_and_log('info', '讨论完成');
							} else if (isJob('u-icon-test')) {
								const replay = await waitForElement('.j-replay');
								if (replay?.style.display === 'none') {
									if (this.cfg.enableChapterTest) {
										await new Promise<void>((resolve) => {
											ICourseProject.scripts.work.methods.start('chapter-test', canRun, (worker) => {
												console.log('worker', worker);

												worker.once('done', resolve);
												worker.once('close', resolve);
												worker.once('stop', resolve);
											});
										});

										$msg_and_log('info', '测验完成');
									} else {
										$msg_and_log(
											'warn',
											'随堂测验自动答题功能已关闭（上方菜单栏-中国大学MOOC-学习脚本中开启），即将跳过。'
										);
									}
								} else {
									$msg_and_log('info', '随堂测验已完成，即将跳过。');
								}
							} else if (isJob('u-icon-text')) {
								const key = 'text-job-reload';
								if ((await $store.getTab(key)) === '1') {
									$store.setTab(key, '0');
									$msg_and_log('info', '文档已完成，即将跳过。');
								} else {
									// 需要刷新才能完成富文本文档任务点
									$store.setTab(key, '1');
									// 文档无需处理
									$msg_and_log('info', '文档无需处理，将在刷新完成后跳过。');
									await $.sleep(3000);
									window.location.reload();
									return;
								}
							} else {
								hasJob = false;
							}

							await $.sleep(3000);

							// 跳转下一章，然后通过URL变化，调度器会重新执行此 main 函数
							if (canRun()) {
								if (hasJob) {
									$msg_and_log('info', '准备跳转下一章');
								} else {
									$msg_and_log('warn', '未找到学习内容，或者此章节不支持自动学习！即将跳过本章节');
								}
								await gotoNextJob();
							}
						};

						study();

						async function gotoNextJob() {
							const list = await next();
							for (const item of list) {
								const el = typeof item === 'function' ? item() : item;
								if (el) {
									await remotePage?.click(el);
								}
							}
							if (list.length === 0) {
								$message.success({ content: '所有章节学习完成！', duration: 0 });
								$console.info('所有章节学习完成！');
								CommonProject.scripts.settings.methods.notificationBySetting('所有章节学习完成！', {
									duration: 0,
									extraTitle: '中国大学MOOC学习脚本'
								});
							}
						}

						async function next() {
							const nextEl = document.querySelector('.unitslist .current')?.nextElementSibling;
							// 判断小节
							if (nextEl) {
								return [nextEl.querySelector('.unit-name')];
							}

							// 判断章节
							const getName = (node?: Node | null) => node?.textContent?.replace(/\s/g, '');
							const lessonName = getName(document.querySelector('.j-lesson .j-up'));
							if (!lessonName) {
								throw Error('无法读取章节名!');
							}

							const lessonList = Array.from(document.querySelectorAll('.j-lesson .j-list .list'));
							let nextLesson = undefined as Element | undefined;
							for (const item of lessonList) {
								const itemName = getName(item);
								if (itemName === lessonName) {
									if (item.nextElementSibling) {
										nextLesson = item.nextElementSibling;
										break;
									}
								}
							}

							if (nextLesson) {
								return [
									// 点击展开章节列表
									document.querySelector('.j-lesson'),
									// 点击章节
									nextLesson
								];
							}

							// 判断单元
							const chapterName = getName(document.querySelector('.j-chapter .j-up'));
							if (!chapterName) {
								throw Error('无法读取单元名!');
							}

							const chapterList = Array.from(document.querySelectorAll('.j-chapter .j-list .list'));
							let nextChapter = undefined as Element | undefined;
							for (const item of chapterList) {
								const itemName = getName(item);
								if (itemName === chapterName) {
									if (item.nextElementSibling) {
										nextChapter = item.nextElementSibling;
										break;
									}
								}
							}

							if (nextChapter) {
								return [
									// 点击展开单元列表
									() => document.querySelector('.j-chapter'),
									// 点击单元
									() => nextChapter,
									// 点击展开章节列表
									() => document.querySelector('.j-lesson'),
									// 点击第一个章节
									() => document.querySelectorAll('.j-lesson .j-list .list')[0]
								];
							} else {
								return [];
							}
						}
					}
				};
			}
		}),
		work: new Script({
			name: '✍️ 作业考试脚本',
			// 添加版本号是因为只有 notes 会强制更新，其他配置项不会，如果需要修改 runAtHash ，需要更新版本号
			namespace: 'icourse.work-v2',
			matches: [
				['MOOC作业页面', 'icourse163.org/learn'],
				['SPOC作业页面', 'icourse163.org/spoc/learn'],
				['考试页面', 'icourse163.org/mooc/main/newExam']
			],
			configs: {
				notes: workNotes,
				runAtHash: {
					defaultValue: ['/learn/quiz', '/learn/examObject']
				}
			},
			methods() {
				const start = async (
					type: 'chapter-test' | 'work' | 'exam',
					canRun: () => boolean,
					onWorkerCreated?: (worker: any) => void
				) => {
					// 检查是否为软件环境
					const remotePage = await BackgroundProject.scripts.dev.methods.getRemotePlaywrightCurrentPage();
					// 检查是否为软件环境
					if (!remotePage) {
						return $playwright.showError();
					}

					// 等待加载题目
					await waitForQuestion();

					CommonProject.scripts.render.methods.pin(this);
					CommonProject.scripts.render.methods.normal();

					$msg_and_log('info', '开始答题');
					CommonProject.scripts.render.methods.pin(this);
					commonWork(this, {
						workerProvider: (opts) => {
							const worker = workAndExam(remotePage, type, opts);
							worker.once('close', () => {
								clearInterval(interval);
							});
							const interval = setInterval(() => {
								if (canRun() === false) {
									$msg_and_log('warn', '检测到页面切换，无法继续答题，将关闭自动答题。');
									clearInterval(interval);
									worker.emit('close');
								}
							}, 1000);
							return worker;
						},
						onWorkerCreated: onWorkerCreated,
						enable_control_panel: true,
						start_delay_seconds: 3
					});
				};
				return {
					main: async ({ canRun }: { canRun: () => boolean; job_id: string }) => {
						if (location.hash.includes('learn/quizscore')) {
							$message.success('当前作业已完成，自动答题关闭。');
							return;
						}
						return start('work', canRun);
					},
					start: start
				};
			},
			// 考试是新开一个界面所以会直接触发
			oncomplete() {
				if (
					(location.href.includes('/learn/examObject') &&
						// 考试成绩解析页面
						!location.href.includes('learn/examObjectScore')) ||
					// 新版考试界面
					location.href.includes('/mooc/main/newExam')
				) {
					this.methods.start('exam', () => true);
				}
			}
		}),
		passportRedirect: new Script({
			name: '登录重定向修复',
			matches: [['登录重定向', 'passport/logingate/changeCookie.htm']],
			configs: {
				notes: {
					defaultValue: $ui.notes(['检测到页面重定向到空白页面', '程序将会自动修复']).outerHTML
				}
			},
			hideInPanel: true,
			oncomplete(...args) {
				CommonProject.scripts.render.methods.pin(this);
				$message.info('检测到中国大学MOOC空白页面，即将重定向修复...');
				setTimeout(() => {
					location.href = 'https://www.icourse163.org/';
				}, 3000);
			}
		})
	}
});

function waitForQuestion() {
	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(() => {
			if (document.querySelector('.u-questionItem,[class*=questionBody]')) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
}

function workAndExam(
	remotePage: RemotePage,
	type: 'chapter-test' | 'work' | 'exam',
	{
		answererWrappers,
		period,
		thread,
		redundanceWordsText,
		upload,
		stopSecondWhenFinish,
		answerSeparators,
		answerMatchMode
	}: CommonWorkOptions
) {
	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'icourse'
	});

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return removeRedundantWords(
			titles
				.filter((t) => t?.innerText || t?.querySelector('img'))
				.map((t) => {
					if (t) {
						const el = optimizationElementWithImage(t, true);
						// textContent can still read the hidden image URL placeholders.
						return (el.textContent || '').replace(/\s+/g, ' ').trim() || '';
					}
					return '';
				})
				.filter((t) => t.trim() !== '')
				.join(',')
				// /\u200B/g 排除不可见的空格
				.replace(/[\u200A-\u200F]/g, ''),
			redundanceWordsText.split('\n')
		);
	};
	const work_type = type;

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: type === 'exam' ? '[class*=questionBody]' : '.u-questionItem',
		elements: {
			title: type === 'exam' ? '[class*=questionInfo]' : '.j-title .j-richTxt',
			options: type === 'exam' ? '[class*=index-module__optionBody]' : '.choices li,.inputArea'
		},
		thread: thread ?? 1,
		answerSeparators: answerSeparators.split(',').map((s) => s.trim()),
		answerMatchMode: answerMatchMode,
		/** 默认搜题方法构造器 */
		answerer: (elements, ctx) => {
			const title = titleTransform(elements.title);
			if (title) {
				return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
					await $.sleep((period ?? 3) * 1000);
					return defaultAnswerWrapperHandler(answererWrappers, {
						type: ctx.type || 'unknown',
						title,
						options: ctx.elements.options.map((o) => optimizationElementWithImage(o, true).innerText).join('\n')
					});
				});
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},
		work: {
			/** 自定义处理器 */
			async handler(type, answer, option) {
				if (type === 'judgement' || type === 'single' || type === 'multiple') {
					if (work_type === 'exam') {
						const input = option.querySelector('input');
						if (input && !input?.checked) {
							await $.sleep(200);
							return input.click();
						}
					}
					const text = option.querySelector('.f-richEditorText');
					const input = option.querySelector('input');
					if (input && !input?.checked && text) {
						await $.sleep(200);
						await remotePage.click(text);
					}
				} else if (type === 'completion' && answer.trim()) {
					const text = option.querySelector('textarea');

					if (text) {
						text.value = answer.trim();
						await remotePage.fill('textarea', answer.trim());
					}
				}
			}
		},
		onElementSearched(elements, root) {
			elements.options.forEach((el) => {
				optimizationElementWithImage(el);
				const correct = el.querySelector<HTMLElement>('.u-icon-correct');
				const wrong = el.querySelector<HTMLElement>('.u-icon-wrong');
				if (correct) {
					correct.replaceWith('对');
				}
				if (wrong) {
					wrong.replaceWith('错');
				}
			});
		},
		/** 完成答题后 */
		onResultsUpdate(curr, _, res) {
			CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));

			if (curr.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([curr], titleTransform));
			}
			CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
		}
	});

	worker
		.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug })
		.then(async (results) => {
			if (worker.isClose) {
				return;
			}
			if (type === 'chapter-test') {
				$msg_and_log('info', `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。`);
				await $.sleep(stopSecondWhenFinish * 1000);
				if (worker.isClose) {
					return;
				}
				// 处理提交
				await worker.uploadHandler({
					type: upload,
					results,
					async callback(finishedRate, uploadable) {
						const content = `完成率 ${finishedRate.toFixed(2)}% :  ${
							uploadable ? '3秒后将自动提交' : '3秒后将自动跳过（没保存按钮）'
						} `;
						$console.info(content);
						$message.success({ content: content, duration: type === 'chapter-test' ? 10 : 0 });

						await $.sleep(3000);
						if (worker.isClose) {
							return;
						}
						if (uploadable) {
							const sumbit = document.querySelector('.j-submit');
							if (sumbit) {
								await remotePage.click(sumbit);
							} else {
								$msg_and_log('warn', '没有找到提交按钮，将跳过提交。');
							}
						}
					}
				});
			} else {
				$message.success({ content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
			}

			worker.emit('done');
		})
		.catch((err) => {
			$message.error({ content: '答题程序发生错误 : ' + err.message, duration: 0 });
		});

	return worker;
}

async function watchMedia(playbackRate: number, volume: number) {
	return new Promise<void>((resolve, reject) => {
		// 部分用户视频加载很慢，这里等待一下
		waitForMedia()
			.then((video) => {
				video.playbackRate = playbackRate;
				video.volume = volume;

				state.currentMedia = video;

				playMedia(() => video?.play());

				video.onpause = async () => {
					if (!video?.ended) {
						video?.play();
					}
				};

				video.onended = () => {
					resolve();
				};
			})
			.catch(reject);
	});
}

async function readPPT(remotePage: RemotePage, readSpeed: number) {
	const reader = document.querySelector('.ux-pdf-reader');
	if (reader) {
		const total = parseInt(
			document
				.querySelector('.ux-h5pdfreader_container_footer_pages_total')
				?.childNodes[1]?.textContent?.replace(/\s/, '') || '0'
		);
		const start = parseInt(
			document.querySelector<HTMLInputElement>('.ux-h5pdfreader_container_footer_pages_in')?.value || '1'
		);
		for (let index = start; index < total + 1; index++) {
			const next = document.querySelector<HTMLElement>('.ux-h5pdfreader_container_footer_pages_next');
			if (next) {
				await remotePage.click(next);
			} else {
				$msg_and_log('error', '未找到PPT的下一页按钮！');
			}
			await $.sleep(readSpeed * 1000);
		}
	}
}

async function discussion(
	remotePage: RemotePage,
	discussionStrategy: typeof ICourseProject.scripts.study.cfg.discussionStrategy
) {
	if (discussionStrategy === 'not-reply') {
		return $msg_and_log('warn', '讨论自动回复功能已关闭（上方菜单栏-中国大学MOOC-学习脚本中开启）。');
	}

	let res = '';

	if (discussionStrategy === 'max-show-up') {
		const list = Array.from(document.querySelectorAll('.j-reply-all .f-pr .j-content'));
		const mapping = new Map();
		for (const item of list) {
			mapping.set(item.textContent, (mapping.get(item.textContent) || 0) + 1);
		}
		const content = [...mapping.entries()].sort((a, b) => b[1] - a[1])?.[0]?.[0];
		if (!content) {
			$msg_and_log('error', '读取出现最多评论失败！');
		}
		res = content;
	} else if (discussionStrategy === 'max-fav') {
		const list = Array.from(document.querySelectorAll('.j-reply-all .f-pr'));
		let max = 0;
		let maxEl = undefined as Element | undefined;
		for (const item of list) {
			const num = parseInt(item.querySelector('.bar .num')?.textContent || '0');
			if (num > max) {
				max = num;
				maxEl = item;
			}
		}
		const content = maxEl?.querySelector('.j-content')?.textContent || '';
		if (!content) {
			$msg_and_log('error', '读取最多点赞评论失败！');
		}
		res = content;
	} else if (discussionStrategy === 'use-newest') {
		const content = document.querySelector('.j-reply-all .f-pr .first .j-content')?.textContent || '';
		if (!content) {
			$msg_and_log('error', '读取最新评论失败！');
		}
		res = content;
	}

	const p = document.querySelector<HTMLDivElement>('.j-reply-add div.ql-editor.ql-blank p');
	if (p) {
		p.innerText = res;
		await $.sleep(1000);
		const submit = document.querySelector('.j-reply-add .editbtn');
		if (submit) {
			await remotePage.click(submit);
			$message.info('提交回复成功！');
		} else {
			$msg_and_log('error', '获取提交按钮失败！');
		}
		await $.sleep(2000);
	} else {
		$msg_and_log('error', '获取评论输入框失败！');
	}
}
