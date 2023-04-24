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
	MessageElement,
	el,
	OCSWorker,
	$gm,
	cors,
	$message,
	$store,
	$const
} from '@ocsjs/core';
import { restudy, volume, workConfigs } from '../utils/configs';
import { CommonWorkOptions, createRangeTooltip, playMedia, workPreCheckMessage } from '../utils';
import { CommonProject } from './common';
import { createWorkerControl, simplifyWorkResult } from '../utils/work';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
};

export const IcveMoocProject = Project.create({
	name: '智慧职教(MOOC学院)',
	domains: ['icve.com.cn', 'course.icve.com.cn'],
	studyProject: true,
	scripts: {
		guide: new Script({
			name: '💡 使用提示',
			url: [['首页', 'user.icve.com.cn']],
			namespace: 'icve.guide',
			configs: {
				notes: {
					defaultValue: $creator.notes(['点击任意课程进入。']).outerHTML
				}
			},
			oncomplete() {
				CommonProject.scripts.render.methods.pin(this);
			}
		}),
		study: new Script({
			name: '🖥️ 课程学习',
			namespace: 'icve.study.main',
			url: [['课程学习页面', 'course.icve.com.cn/learnspace/learn/learn/templateeight/index.action']],
			configs: {
				notes: {
					defaultValue: $creator.notes([
						[
							'如果视频进入后一直是黑屏，请手动点击播放按钮，',
							'如果还是黑屏，则为该视频无法播放，',
							'请联系智慧职教客服进行询问。或者跳过该视频。'
						],
						'手动进入作业页面才能使用自动答题。'
					]).outerHTML
				},

				volume,
				playbackRate: {
					label: '视频倍速',
					attrs: {
						type: 'range',
						step: 1,
						min: 1,
						max: 16
					},
					defaultValue: 1,
					onload() {
						createRangeTooltip(this, '1', (val) => `${val}x`);
					}
				},
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
				}
			},
			async oncomplete() {
				CommonProject.scripts.render.methods.pin(this);

				await $.sleep(3000);

				this.onConfigChange('volume', (v) => state.study.currentMedia && (state.study.currentMedia.volume = v));
				this.onConfigChange(
					'playbackRate',
					(r) => state.study.currentMedia && (state.study.currentMedia.playbackRate = r)
				);

				const mainContentWin = $el<HTMLIFrameElement>('#mainContent')?.contentWindow as Window & { [x: string]: any };

				if (mainContentWin) {
					// 弹窗强制用户点击，防止视频无法自动播放
					$modal('confirm', {
						content: '开始学习？',
						async onConfirm() {
							console.log(await $store.getTab($const.TAB_UID));
							study();
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

				// 任务点
				const jobs = $$el(`.item_done_icon${this.cfg.restudy ? '' : ':not(.done_icon_show)'}`, mainContentWin.document);

				console.log(jobs);

				/** 学习 */
				const study = async () => {
					const iframe = $el<HTMLIFrameElement>('iframe', mainContentWin.document);
					const win = iframe?.contentWindow;
					if (win) {
						const doc = win.document;
						if (iframe.src.includes('content_video.action') || iframe.src.includes('content_audio.action')) {
							// 视频
							const media = $el<HTMLMediaElement>('video,audio', doc);
							state.study.currentMedia = media;

							if (media) {
								if (media.ended) {
									media.currentTime = 0;
								}

								media.playbackRate = this.cfg.playbackRate;
								media.volume = this.cfg.volume;

								await new Promise<void>((resolve, reject) => {
									try {
										media.addEventListener('ended', async () => {
											await $.sleep(3000);
											resolve();
										});
										media.addEventListener('pause', async () => {
											if (!media.ended) {
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
							} else {
								$message('error', { content: '未检测到视频，请刷新页面重试。' });
							}
						} else if (iframe.src.includes('content_doc.action')) {
							// 文档只需点击就算完成，等待5秒下一个
							await $.sleep(5000);
						}
					} else {
						// 如果为 null 证明跨域
					}

					const job = jobs.shift();
					// 如果不是当前所处的任务点，则点击，否则可直接开始学习
					if (job) {
						job.click();
						setTimeout(() => {
							study();
						}, 3000);
					} else {
						$modal('alert', {
							content: '全部任务已完成'
						});
					}
				};
			}
		}),

		work: new Script({
			name: '✍️ 作业脚本',
			url: [['作业页面', 'spoc-exam.icve.com.cn/exam']],
			namespace: 'icve.work',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'请手动进入作业页面才能使用自动答题。'
					]).outerHTML
				},
				auto: workConfigs.auto
			},
			async oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);

				const changeMsg = () => $message('info', { content: '检测到设置更改，请重新进入，或者刷新作业页面进行答题。' });
				this.onConfigChange('auto', changeMsg);

				let worker: OCSWorker<any> | undefined;
				let warn: MessageElement | undefined;

				/** 显示答题控制按钮 */
				createWorkerControl(this, () => worker);

				this.on('render', () => createWorkerControl(this, () => worker));

				this.event.on('start', () => start());
				this.event.on('restart', () => {
					worker?.emit('close');
					$message('info', { content: '3秒后重新答题。' });
					setTimeout(start, 3000);
				});

				const start = () => {
					warn?.remove();
					workPreCheckMessage({
						onrun: (opts) => {
							$message('info', { content: '自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主。' });
							worker = work(opts);
						},
						ondone: () => {
							this.event.emit('done');
						},
						...CommonProject.scripts.settings.cfg
					});
				};

				if (this.cfg.auto === false) {
					const startBtn = el('button', { className: 'base-style-button' }, '进入作业考试脚本');
					startBtn.onclick = () => {
						CommonProject.scripts.render.methods.pin(this);
					};
					const isPinned = await CommonProject.scripts.render.methods.isPinned(this);
					warn = $message('warn', {
						duration: 0,
						content: el('div', [
							`自动答题已被关闭！请${isPinned ? '' : '进入作业考试脚本，然后'}点击开始答题，或者忽略此警告。`,
							isPinned ? '' : startBtn
						])
					});
				} else {
					start();
				}
			}
		}),
		workDispatcher: new Script({
			name: '作业调度脚本',
			url: [
				['作业进入页面', 'spoc-exam.icve.com.cn/platformwebapi/student/exam/'],
				['确认作业页面', 'spoc-exam.icve.com.cn/student/exam/studentExam_studentInfo.action']
			],
			hideInPanel: true,
			oncomplete() {
				if (/spoc-exam.icve.com.cn\/platformwebapi\/student\/exam/.test(window.location.href)) {
					cors.on('icve-work-start', () => {
						setTimeout(() => {
							$gm.unsafeWindow.openExamInfo();
						}, 3000);
					});
				}
				if (/spoc-exam.icve.com.cn\/student\/exam\/studentExam_studentInfo.action/.test(window.location.href)) {
					setTimeout(() => {
						// 确认答题后，OCS会自动执行 ICVE.scripts.work 的 oncomplete 然后开始答题
						$gm.unsafeWindow.enterExamPage();
					}, 3000);
				}
			}
		})
	}
});

function work({ answererWrappers, period, thread }: CommonWorkOptions) {
	$message('info', { content: '开始作业' });
	CommonProject.scripts.workResults.methods.init();

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
	let requestIndex = 0;
	let resolverIndex = 0;

	const worker = new OCSWorker({
		root: '.q_content',
		elements: {
			title: '.divQuestionTitle',
			options: '.questionOptions .q_option,.questionOptions.divTextarea '
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 1,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) => {
			const title = titleTransform(elements.title);
			if (title) {
				return CommonProject.scripts.apps.methods.searchAnswer(title, () => {
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
			handler(type, answer, option, ctx) {
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
						const view = textIframe.contentWindow?.document.querySelector<HTMLElement>('.view');
						if (view) {
							view.innerText = answer;
						}
					}
				}
			}
		},

		/**
		 * 因为校内课的考试和作业都是一题一题做的，不像其他自动答题一样可以获取全部试卷内容。
		 * 所以只能根据自定义的状态进行搜索结果的显示。
		 */
		onResultsUpdate(res, currentResult) {
			if (currentResult.result) {
				workResults.push(...simplifyWorkResult([currentResult], titleTransform));
				CommonProject.scripts.workResults.methods.setResults(workResults);
				totalQuestionCount++;
				requestIndex++;
				resolverIndex++;
			}
		},
		onResolveUpdate(res) {
			if (res.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
			}
			CommonProject.scripts.workResults.methods.updateWorkState({
				totalQuestionCount,
				requestIndex,
				resolverIndex
			});
		}
	});

	const getNextBtn = () => document.querySelector('.paging_next') as HTMLElement;
	let next = getNextBtn();

	(async () => {
		while (next && worker.isClose === false) {
			await worker.doWork();
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
	})();

	return worker;
}
