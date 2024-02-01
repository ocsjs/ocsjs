import {
	$el,
	Project,
	Script,
	$,
	$$el,
	$creator,
	$modal,
	SimplifyWorkResult,
	defaultAnswerWrapperHandler,
	el,
	OCSWorker,
	$gm,
	cors,
	$message,
	defaultQuestionResolve,
	splitAnswer
} from '@ocsjs/core';
import { playbackRate, restudy, volume } from '../utils/configs';
import { CommonWorkOptions, playMedia } from '../utils';
import { CommonProject } from './common';
import { commonWork, simplifyWorkResult } from '../utils/work';
import { $console } from './background';
import { waitForElement, waitForMedia } from '../utils/study';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined,
		currentStudyLockId: 0,
		playbackRateWarningListenerId: 0,
		courseLengthListenerId: 0
	}
};

/**
 * 学习锁，用于判断是否可以学习，防止学习函数被多次调用
 */
class StudyLock {
	static auto_inc: number = 0;
	id: number;
	constructor() {
		StudyLock.auto_inc++;
		this.id = StudyLock.auto_inc;
		state.study.currentStudyLockId = this.id;
	}

	canStudy() {
		return this.id === state.study.currentStudyLockId;
	}

	static getLock() {
		return new StudyLock();
	}
}

export const IcveMoocProject = Project.create({
	name: '智慧职教',
	domains: [
		'icve.com.cn',
		'course.icve.com.cn',
		// 智慧职教套壳
		'courshare.cn'
	],
	studyProject: true,
	scripts: {
		guide: new Script({
			name: '💡 使用提示',
			url: [
				['个人首页', 'icve.com.cn/studycenter'],
				['学习页面', 'icve.com.cn/study/directory'],
				['MOOC学院-个人首页', 'user.icve.com.cn'],
				['MOOC学院-首页', 'mooc.icve.com.cn']
			],
			namespace: 'icve.guide',
			configs: {
				notes: {
					defaultValue: $creator.notes(['请点击任意课程进入', '进入课程后点击任意章节进入，即可自动学习']).outerHTML
				}
			},
			oncomplete() {
				CommonProject.scripts.render.methods.pin(this);
			}
		}),
		/** 智慧职教学习中心 */
		studyCenter: new Script({
			name: '🖥️ 智慧职教-学习中心',
			namespace: 'icve.study.center',
			url: [
				['学习中心页面', '/study/directory/dir_course.html'],
				['课程列表', 'icve.com.cn/study/directory/directory_list.html']
			],
			configs: {
				playbackRate: playbackRate,
				volume,
				/** 章节列表 */
				currentCourseUrlList: {
					defaultValue: [] as string[]
				}
			},
			async oncomplete() {
				if (location.href.includes('icve.com.cn/study/directory/directory_list.html')) {
					await waitForElement('.h_cells a');
					this.cfg.currentCourseUrlList = Array.from(document.querySelectorAll<HTMLAnchorElement>('.h_cells a')).map(
						(a) => a.href
					);
					return;
				}

				if (this.cfg.currentCourseUrlList.length === 0) {
					try {
						const url =
							'https://www.icve.com.cn/study/directory/directory_list.html?courseId=' +
							new URL(location.href).searchParams.get('courseId');
						const res = await fetch(url).then((res) => res.text());
						const doc = new DOMParser().parseFromString(res, 'text/html');
						this.cfg.currentCourseUrlList = Array.from(doc.querySelectorAll<HTMLAnchorElement>('.h_cells a')).map(
							(a) => a.href
						);
					} catch (e) {
						console.error(e);
						$message('error', { content: '课程列表获取失败，请刷新页面重试。' });
						return;
					}
				}

				CommonProject.scripts.render.methods.pin(this);

				this.onConfigChange('playbackRate', (playbackRate) => {
					state.study.currentMedia && (state.study.currentMedia.playbackRate = parseFloat(playbackRate.toString()));
				});
				this.onConfigChange('volume', (v) => state.study.currentMedia && (state.study.currentMedia.volume = v));

				const study = async () => {
					const res = await Promise.race([waitForElement('video, audio'), waitForElement('.docBox')]);
					if (res) {
						const jobName = document.querySelector('.tabsel.seled')?.getAttribute('title') || '-';
						$message('info', { content: '开始任务：' + jobName });
						$console.log(`任务 ${jobName} 开始。`);
						if (document.querySelector('video, audio')) {
							const media = await waitForMedia();

							state.study.currentMedia = media;
							media.volume = this.cfg.volume;

							await new Promise<void>((resolve, reject) => {
								try {
									console.log(document.hasFocus());
									window.focus();
									// @ts-ignore
									$gm.unsafeWindow.jwplayer().onComplete(async () => {
										$console.log('视频/音频播放完成。');
										await $.sleep(3000);
										resolve();
									});

									const play = () => {
										$gm.unsafeWindow.jwplayer().play();
										$gm.unsafeWindow.jwplayer().play();
										media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
									};

									media.addEventListener('pause', async () => {
										if (!media.ended) {
											await $.sleep(1000);
											playMedia(play);
										}
									});
									// 开始播放
									playMedia(play);
								} catch (err) {
									reject(err);
								}
							});
						}
						$message('success', { content: `任务 ${jobName} 完成，三秒后下一章` });
						$console.log(`任务 ${jobName} 完成，三秒后下一章`);
					} else {
						$console.error(`不支持的任务页面，请跟作者进行反馈。三秒后下一章`);
					}

					await $.sleep(3000);

					next();
				};

				const next = () => {
					for (let index = 0; index < this.cfg.currentCourseUrlList.length; index++) {
						const url = this.cfg.currentCourseUrlList[index];
						const nextUrl = this.cfg.currentCourseUrlList[index + 1];
						if (new URL(url).hash === new URL(location.href).hash) {
							if (!nextUrl) {
								$modal('alert', { content: '全部任务已完成' });
								CommonProject.scripts.settings.methods.notificationBySetting('全部任务点已完成！', {
									duration: 0,
									extraTitle: '智慧职教学习脚本'
								});
								return;
							} else {
								window.location.href = this.cfg.currentCourseUrlList[index + 1];
							}
						}
					}
				};

				study();
			}
		}),
		/** MOOC 学院 */
		study: new Script({
			name: '🖥️ MOOC学院-课程学习',
			namespace: 'icve.study.main',
			url: [['课程学习页面', '/learnspace/learn/learn/templateeight/index.action']],
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'如果视频无法播放，可以手动点击其他任务跳过视频。',
						'经过测试视频倍速最多二倍，否则会判定无效。',
						'手动进入作业页面才能使用自动答题。'
					]).outerHTML
				},
				playbackRate: playbackRate,
				volume,
				restudy,
				showScrollBar: {
					label: '显示右侧滚动条',
					attrs: { type: 'checkbox' },
					defaultValue: true
				},
				expandAll: {
					label: '展开所有章节',
					attrs: { type: 'checkbox' },
					defaultValue: true
				},
				switchPeriod: {
					label: '下一章节切换间隔（秒）',
					defaultValue: 10,
					attrs: {
						type: 'number',
						min: 0,
						max: 999,
						step: 1
					}
				}
			},
			onrender() {
				// 高倍速警告
				this.offConfigChange(state.study.playbackRateWarningListenerId);
				state.study.playbackRateWarningListenerId =
					this.onConfigChange('playbackRate', (playbackRate) => {
						if (playbackRate > 4) {
							$modal('alert', {
								title: '⚠️高倍速警告',
								content: $creator.notes(['高倍速可能导致视频无法完成！'])
							});
						}
					}) || 0;
			},
			async oncomplete() {
				CommonProject.scripts.render.methods.pin(this);

				await $.sleep(3000);

				this.onConfigChange('volume', (v) => state.study.currentMedia && (state.study.currentMedia.volume = v));
				this.onConfigChange(
					'playbackRate',
					(r) => state.study.currentMedia && (state.study.currentMedia.playbackRate = parseFloat(r.toString()))
				);

				const mainContentWin = $el<HTMLIFrameElement>('#mainContent')?.contentWindow as Window & { [x: string]: any };

				if (mainContentWin) {
					// 弹窗强制用户点击，防止视频无法自动播放
					$modal('confirm', {
						content: el('div', [
							'是否开始自动学习当前章节？',
							el('br'),
							'你也可以选择任意的章节进行点击，脚本会自动学习，并一直往下寻找章节。'
						]),
						cancelButtonText: '我想手动选择章节',
						confirmButtonText: '开始学习',
						async onConfirm() {
							study(StudyLock.getLock());
							scrollToJob();
						}
					});
				}

				if (this.cfg.showScrollBar) {
					const bar = $el('.dumascroll_area', mainContentWin.document);
					bar && (bar.style.overflow = 'auto');
				}

				if (this.cfg.expandAll) {
					$$el('.s_sectionlist,.s_sectionwrap', mainContentWin.document).forEach((el) => (el.style.display = 'block'));
				}

				for (const job of $$el('.s_point[itemtype]', mainContentWin.document)) {
					job.addEventListener('click', (e) => {
						const lock = StudyLock.getLock();
						// 如果是用户点击
						if (e.isTrusted) {
							if (job.getAttribute('itemtype') === 'exam') {
								return $message('info', {
									duration: 60,
									content: '检测到您手动选择了作业/考试章节，将不会自动跳转，请完成后手动选择其他章节，脚本会自动学习。'
								});
							} else {
								$message('info', { content: '检测到章节切换，即将自动学习...' });
							}
						}

						setTimeout(() => {
							study(lock);
						}, 3000);
					});
				}

				const scrollToJob = () =>
					$el('.s_pointerct', mainContentWin.document)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

				/** 学习 */
				const study = async (studyLock: StudyLock) => {
					const iframe = $el<HTMLIFrameElement>('iframe', mainContentWin.document);
					const win = iframe?.contentWindow;
					if (win) {
						const doc = win.document;
						if (iframe.src.includes('content_video.action') || iframe.src.includes('content_audio.action')) {
							// 视频
							$console.log('视频/音频播放中...');
							try {
								const media = await waitForMedia({ root: doc });

								state.study.currentMedia = media;
								media.playbackRate = parseFloat(this.cfg.playbackRate.toString());
								media.volume = this.cfg.volume;
								media.currentTime = 0;

								await new Promise<void>((resolve, reject) => {
									try {
										// @ts-ignore
										win.jwplayer().onComplete(async () => {
											$console.log('视频/音频播放完成。');
											await $.sleep(3000);
											resolve();
										});

										media.addEventListener('pause', async () => {
											if (!media.ended) {
												await waitForPopupQuestion(doc);
												await $.sleep(1000);
												playMedia(() => media.play());
											}
										});
										// 开始播放
										playMedia(() => media.play());
									} catch (err) {
										reject(err);
									}
								});
							} catch (err) {
								$message('error', { content: String(err) });
							}
						} else if (iframe.src.includes('content_doc.action')) {
							// 文档只需点击就算完成，等待5秒下一个
							await $.sleep(5000);
						}
					} else {
						// 如果为 null 证明跨域
					}
					$console.log(this.cfg.switchPeriod + ' 秒后切换下一章节。');
					await $.sleep(this.cfg.switchPeriod * 1000);

					if (studyLock.canStudy()) {
						let nextEl;
						// 是否处于当前章节之后
						let isBellowCurrentJob = false;
						const jobs = $$el('.s_point[itemtype]', mainContentWin.document);
						for (let index = 0; index < jobs.length; index++) {
							const job = jobs[index];
							if (job.classList.contains('s_pointerct')) {
								isBellowCurrentJob = true;
							} else if (isBellowCurrentJob) {
								if (job.querySelector('.done_icon_show') === null || this.cfg.restudy) {
									$console.log('下一章：', job.title || $el('.s_pointti', job)?.title || '未知');
									nextEl = job;
									break;
								}
							}
						}

						if (nextEl) {
							nextEl.click();
							scrollToJob();
						} else {
							$modal('alert', { content: '全部任务已完成' });
							CommonProject.scripts.settings.methods.notificationBySetting('全部任务点已完成！', {
								duration: 0,
								extraTitle: '智慧职教学习脚本'
							});
						}
					}
				};
			}
		}),

		work: new Script({
			name: '✍️ 作业考试脚本',
			url: [['作业考试页面', '/exam']],
			namespace: 'icve.work',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'请手动进入作业考试页面才能使用自动答题。'
					]).outerHTML
				}
			},
			async oncomplete() {
				$message('info', { content: '自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主。' });

				// 回到第一题
				const resetToBegin = () => {
					document.querySelectorAll<HTMLElement>(`.sheet_nums [id*="sheetSeq"]`).item(0)?.click();
				};

				commonWork(this, {
					workerProvider: work,
					beforeRunning: async () => {
						resetToBegin();
						await $.sleep(1000);
					},
					onRestart: () => resetToBegin()
				});
			}
		}),
		workDispatcher: new Script({
			name: '作业调度脚本',
			url: [
				['作业进入页面', '/platformwebapi/student/exam/'],
				['确认作业页面', '/student/exam/studentExam_studentInfo.action']
			],
			hideInPanel: true,
			oncomplete() {
				if (/\/platformwebapi\/student\/exam/.test(window.location.href)) {
					cors.on('icve-work-start', () => {
						setTimeout(() => {
							$gm.unsafeWindow.openExamInfo();
						}, 3000);
					});
				}
				if (/\/student\/exam\/studentExam_studentInfo.action/.test(window.location.href)) {
					setTimeout(() => {
						// 确认答题后，OCS会自动执行 ICVE.scripts.work 的 oncomplete 然后开始答题
						$gm.unsafeWindow.enterExamPage();
					}, 3000);
				}
			}
		})
	}
});

function work({ answererWrappers, period, thread, answer_separators }: CommonWorkOptions) {
	$message('info', { content: '开始作业' });
	CommonProject.scripts.workResults.methods.init();

	console.log({ answererWrappers, period, thread });

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return titles
			.filter((t) => t?.innerText)
			.map((t) => {
				if (t) {
					const title = t.cloneNode(true) as HTMLElement;
					title.querySelector('[name*="questionIndex"]')?.remove();
					title.querySelector('.q_score')?.remove();
					return title.innerText.trim().replace(/^、/, '') || '';
				}
				return '';
			})
			.join(',');
	};

	const workResults: SimplifyWorkResult[] = [];
	let totalQuestionCount = 0;
	let requestFinished = 0;
	let resolverIndex = 0;

	function getType(options: HTMLElement[]) {
		const radio_len = options
			.map((o) => o.querySelector('[type="radio"]'))
			.reduce((a, b) => {
				return a + (b ? 1 : 0);
			}, 0);

		return radio_len > 0
			? radio_len === 2
				? 'judgement'
				: 'single'
			: options.some((o) => o.querySelector('[type="checkbox"]'))
			? 'multiple'
			: options.some((o) => o.querySelector('textarea'))
			? 'completion'
			: options.some((o) => o.querySelector('.fillblank_input input'))
			? 'fill-blank'
			: undefined;
	}

	const worker = new OCSWorker({
		root: '.q_content',
		elements: {
			title:
				'.divQuestionTitle, ' +
				// 单行填空题
				'[name="fillblankTitle"]',
			options:
				'.questionOptions .q_option, .questionOptions.divTextarea, ' +
				// 单行填空题
				'.answerOption'
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 1,
		thread: thread ?? 1,
		separators: answer_separators.split(',').map((s) => s.trim()),
		/** 默认搜题方法构造器 */
		answerer: (elements, ctx) => {
			const title = titleTransform(elements.title);
			if (title) {
				return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, () => {
					return defaultAnswerWrapperHandler(answererWrappers, {
						type: getType(ctx.elements.options) || 'unknown',
						title,
						options: ctx.elements.options.map((o) => o.innerText).join('\n')
					});
				});
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},
		async work(ctx) {
			const options = ctx.elements.options;

			const type = getType(options);
			if (!type) {
				throw new Error('无法获取题目类型！');
			}

			if (type === 'fill-blank') {
				const inputs = options
					.map((o) => Array.from(o.querySelectorAll<HTMLInputElement>('.fillblank_input input')))
					.flat();

				for (const searchInfo of ctx.searchInfos) {
					for (const result of searchInfo.results) {
						const answers = splitAnswer(result.answer);
						if (answers.length === inputs.length) {
							for (let index = 0; index < inputs.length; index++) {
								inputs[index].value = answers[index];
							}
							return { finish: true };
						}
					}
				}
			} else {
				const resolver = defaultQuestionResolve(ctx)[type];
				const res = await resolver(ctx.searchInfos, ctx.elements.options, (type, answer, option) => {
					if (type === 'judgement' || type === 'single' || type === 'multiple') {
						// 这里只用判断多选题是否选中，如果选中就不用再点击了，单选题是 radio，所以不用判断。
						if (option.querySelector('.checkbox_on') === null) {
							$el('div', option)?.click();
						}
					} else if (type === 'completion' && answer.trim()) {
						const text = option.querySelector('textarea');
						const textIframe = option.querySelector<HTMLIFrameElement>('iframe[id*="ueditor"]');
						if (text) {
							text.value = answer;
						}
						if (textIframe) {
							const view = textIframe.contentWindow?.document.querySelector<HTMLElement>('body.view > p');
							if (view) {
								view.innerText = answer;
							}
						}
					}
				});

				return res;
			}

			return { finish: false };
		},
		onElementSearched(elements, root) {
			console.log('elements', elements);
		},

		/**
		 * 因为校内课的考试和作业都是一题一题做的，不像其他自动答题一样可以获取全部试卷内容。
		 * 所以只能根据自定义的状态进行搜索结果的显示。
		 */
		onResultsUpdate(currentResult) {
			if (currentResult.resolved) {
				workResults.push(...simplifyWorkResult([currentResult], titleTransform));
				CommonProject.scripts.workResults.methods.setResults(workResults);
				totalQuestionCount++;
				requestFinished++;
				resolverIndex++;

				if (currentResult.result?.finish) {
					CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
						simplifyWorkResult([currentResult], titleTransform)
					);
				}
				CommonProject.scripts.workResults.methods.updateWorkState({
					totalQuestionCount,
					requestFinished,
					resolverIndex
				});
			}
		}
	});

	const getNextBtn = () => document.querySelector('.paging_next') as HTMLElement;
	let next = getNextBtn();

	(async () => {
		while (next && worker.isClose === false) {
			await worker.doWork({ enable_debug: true });
			await $.sleep((period ?? 3) * 1000);
			next = getNextBtn();
			if (next.style.display === 'none') {
				break;
			} else {
				next?.click();
				await $.sleep((period ?? 3) * 1000);
			}
		}

		$message('info', { content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
		worker.emit('done');
		// 搜索完成后才会同步答案与题目的显示，防止题目错乱
		CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = 'icve';
	})();

	return worker;
}

/**
 * 等待弹出的答题框，并点击确定
 */
function waitForPopupQuestion(dom: Document) {
	return new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			const el = $el('.popup-test', dom);
			if (el) {
				clearInterval(interval);
				const right_answer = $el<HTMLInputElement>('#right_answer', el)?.value || 'A';
				for (const answer of right_answer.split('')) {
					const item = $el(`li.test-item-cell[curval="${answer}"]`, el);
					item?.click();
				}

				$el('[name="save_btn"]', el)?.click();
				setTimeout(() => {
					$el('[name="continue_btn"]', el)?.click();
					resolve();
				}, 3000);
			}
		}, 1000);
	});
}
