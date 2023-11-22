import { $, $creator, $message, OCSWorker, Project, Script, defaultAnswerWrapperHandler } from '@ocsjs/core';
import { CommonWorkOptions, playMedia } from '../utils';
import { CommonProject } from './common';
import { commonWork, optimizationElementWithImage, removeRedundantWords, simplifyWorkResult } from '../utils/work';
import { $console } from './background';
import { $app_actions } from '../utils/app';
import { waitForMedia } from '../utils/study';
import { playbackRate, volume, workNotes } from '../utils/configs';

const state = {
	currentMedia: undefined as HTMLMediaElement | undefined,
	currentUrlHash: '',
	currentRunningScriptName: ''
};

export const ICourseProject = Project.create({
	name: '中国大学MOOC',
	domains: ['icourse163.org'],
	studyProject: true,
	scripts: {
		dispatcher: new Script({
			name: '调度器',
			hideInPanel: true,
			url: [['所有页面', 'icourse163.org']],
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
									script.methods?.main?.(() => {
										return state.currentUrlHash && runAtHash.some((h) => state.currentUrlHash.includes(h));
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
			url: [['', 'icourse163.org']],
			// 添加版本号是因为只有 notes 会强制更新，其他配置项不会，如果需要修改 runAtHash ，需要更新版本号
			namespace: 'icourse.guide-v1',
			configs: {
				notes: {
					defaultValue: $creator.notes(['手动进入任意课程里的课件/作业，即可开始自动学习']).outerHTML
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
			url: [
				['MOOC作业页面', 'icourse163.org/learn'],
				['SPOC作业页面', 'icourse163.org/spoc/learn']
			],
			configs: {
				notes: {
					defaultValue: $creator.notes([
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
				}
			},
			oncomplete() {
				this.onConfigChange('playbackRate', (playbackRate) => {
					if (state.currentMedia) {
						state.currentMedia.playbackRate = playbackRate;
					}
				});
				this.onConfigChange('volume', (volume) => {
					if (state.currentMedia) {
						state.currentMedia.volume = volume;
					}
				});
			},
			methods() {
				return {
					main: async (canRun: () => boolean) => {
						CommonProject.scripts.render.methods.pin(this);

						// 检查是否为软件环境
						if (!(await $app_actions.init())) {
							return $app_actions.showError();
						}

						// 移动窗口到边缘
						CommonProject.scripts.render.methods.moveToEdge();

						const study = async () => {
							const lessonName = document.querySelector('.j-lesson .j-up')?.textContent;
							const unitName = document.querySelector('.j-unitslist  li.current .unit-name')?.textContent;

							$console.log(`正在学习：${lessonName || ''} - ${unitName || ''}`);

							const findJob = (selector: string) => {
								return new Promise<HTMLElement | undefined>((resolve, reject) => {
									const interval = setInterval(() => {
										const el = document.querySelector<HTMLElement>(selector);
										if (el) {
											clearInterval(interval);
											clearTimeout(timeout);
											resolve(el);
										}
									}, 1000);

									// 超时跳过
									const timeout = setTimeout(() => {
										clearInterval(interval);
										resolve(undefined);
									}, 10 * 1000);
								});
							};

							const res = await Promise.race([findJob('video'), findJob('.ux-pdf-reader'), findJob('.j-reply-all')]);

							if (res) {
								if (document.querySelector('video')) {
									await watchMedia(this.cfg.playbackRate, this.cfg.volume);
									$console.log('视频学习完成');
								} else if (document.querySelector('.ux-pdf-reader')) {
									await readPPT(this.cfg.readSpeed);
									$console.log('PPT完成');
								} else if (document.querySelector('.j-reply-all')) {
									await discussion(this.cfg.discussionStrategy);
									$console.log('讨论完成');
								}
							}

							await $.sleep(3000);

							// 跳转下一章，然后通过URL变化，调度器会重新执行此 main 函数
							if (canRun()) {
								if (res) {
									$console.log('准备跳转下一章');
								} else {
									$console.warn('未找到学习内容，或者此章节不支持自动学习！即将跳过本章节');
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
									await $app_actions.mouseClick(el);
								}
							}
							if (list.length === 0) {
								$message('success', { content: '所有章节学习完成！', duration: 0 });
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
			name: '✍️ 作业脚本',
			// 添加版本号是因为只有 notes 会强制更新，其他配置项不会，如果需要修改 runAtHash ，需要更新版本号
			namespace: 'icourse.work-v1',
			url: [
				['MOOC作业页面', 'icourse163.org/learn'],
				['SPOC作业页面', 'icourse163.org/spoc/learn']
			],
			configs: {
				notes: workNotes,
				runAtHash: {
					defaultValue: '/learn/quiz'
				}
			},
			methods() {
				return {
					main: async (canRun: () => boolean) => {
						if (location.hash.includes('learn/quizscore')) {
							$message('success', { content: '当前作业已完成，自动答题关闭。' });
							return;
						}

						CommonProject.scripts.render.methods.pin(this);

						// 移动窗口到边缘
						CommonProject.scripts.render.methods.moveToEdge();

						// 检查是否为软件环境
						if (!(await $app_actions.init())) {
							return $app_actions.showError();
						}

						// 等待加载题目
						await waitForQuestion();

						$console.log('开始答题');
						CommonProject.scripts.render.methods.pin(this);
						commonWork(this, {
							workerProvider: (opts) => {
								const worker = workAndExam(opts);
								worker.once('close', () => {
									clearInterval(interval);
								});
								const interval = setInterval(() => {
									if (canRun() === false) {
										$message('info', { content: '检测到页面切换，无法继续答题，将关闭自动答题。' });
										clearInterval(interval);
										worker.emit('close');
									}
								}, 1000);
								return worker;
							}
						});
					}
				};
			}
		})
	}
});

function waitForQuestion() {
	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(() => {
			if (document.querySelector('.u-questionItem')) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
}

/**
 * 共享课的作业和考试
 */
function workAndExam({ answererWrappers, period, thread, redundanceWordsText }: CommonWorkOptions) {
	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'icourse'
	});

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return removeRedundantWords(
			titles
				.map((t) => (t ? optimizationElementWithImage(t).innerText : ''))
				.filter((t) => t.trim() !== '')
				.join(',')
				// /\u200B/g 排除不可见的空格
				.replace(/[\u200A-\u200F]/g, ''),
			redundanceWordsText.split('\n')
		);
	};

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.u-questionItem',
		elements: {
			title: '.j-title .j-richTxt',
			options: '.choices li,.inputArea'
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 1,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) => {
			const title = titleTransform(elements.title);
			if (title) {
				return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
					return defaultAnswerWrapperHandler(answererWrappers, {
						type,
						title,
						options: ctx.elements.options.map((o) => o.innerText).join('\n')
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
					const text = option.querySelector('.f-richEditorText');

					const input = option.querySelector('input');
					if (input && !input?.checked) {
						await $app_actions.mouseClick(text);
					}
				} else if (type === 'completion' && answer.trim()) {
					const text = option.querySelector('textarea');

					if (text) {
						text.value = answer.trim();
						await $app_actions.mouseClick(text);
					}
				}
			}
		},
		onElementSearched(elements, root) {
			elements.options.forEach((el) => {
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
		onResultsUpdate(res) {
			CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
		},
		onResolveUpdate(res) {
			if (res.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
			}
			CommonProject.scripts.workResults.methods.updateWorkState(worker);
		}
	});

	worker
		.doWork()
		.then(() => {
			$message('success', { content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
			worker.emit('done');
		})
		.catch((err) => {
			$message('error', { content: '答题程序发生错误 : ' + err.message, duration: 0 });
		});

	$console.info('答题完成');

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

async function readPPT(readSpeed: number) {
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
			await $app_actions.mouseClick(next);
			await $.sleep(readSpeed * 1000);
		}
	}
}

async function discussion(discussionStrategy: typeof ICourseProject.scripts.study.cfg.discussionStrategy) {
	if (discussionStrategy === 'not-reply') {
		return $console.warn('讨论自动回复功能已关闭。');
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
			$console.error('读取出现最多评论失败！');
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
			$console.error('读取最多点赞评论失败！');
		}
		res = content;
	} else if (discussionStrategy === 'use-newest') {
		const content = document.querySelector('.j-reply-all .f-pr .first .j-content')?.textContent || '';
		if (!content) {
			$console.error('读取最新评论失败！');
		}
		res = content;
	}

	const p = document
		.querySelector<HTMLIFrameElement>('[id*=ueditor]')
		?.contentDocument?.querySelector<HTMLElement>('body p');
	if (p) {
		p.innerText = res;
		await $.sleep(1000);
		await $app_actions.mouseClick(document.querySelector('.ui-richEditor .u-btn-sm'));
		await $.sleep(2000);
	} else {
		$console.error('获取评论输入框失败！');
	}
}

// async function switchPlaybackRate(playbackRate: number) {
// 	const list = Array.from(document.querySelectorAll('.ratebtn .m-popover-rate ul li'));

// 	for (const item of list) {
// 		if (parseFloat(item.textContent?.replace('倍速', '')?.trim() || '1') === playbackRate) {
// 			// z-sel 代表是当前的倍速值
// 			if (item.classList.contains('z-sel') === false) {
// 				// 显示视频下的控制栏
// 				document.querySelector('.u-edu-h5player-controlwrap')?.classList.add('z-show');
// 				await $.sleep(1000);
// 				await $app_actions.mouseClick(item);
// 				document.querySelector('.u-edu-h5player-controlwrap')?.classList.remove('z-show');
// 			}
// 		}
// 	}
// }
