import {
	$creator,
	Project,
	Script,
	$el,
	el,
	$$el,
	OCSWorker,
	defaultAnswerWrapperHandler,
	$message,
	$,
	$modal
} from '@ocsjs/core';
import type { MessageElement, SimplifyWorkResult } from '@ocsjs/core';
import { CommonProject } from './common';
import { workNotes, definition, volume, restudy } from '../utils/configs';
import {
	commonWork,
	createUnVisibleTextOfImage,
	optimizationElementWithImage,
	removeRedundantWords,
	simplifyWorkResult
} from '../utils/work';
import { CommonWorkOptions, playMedia } from '../utils';
import { $console } from './background';

// 学习是否暂停
let stop = false;
// 是否存在验证码
const hasCapture = false;

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
};

/** 工程导出 */
export const ZHSProject = Project.create({
	name: '知到智慧树',
	domains: ['zhihuishu.com'],
	studyProject: true,
	scripts: {
		guide: new Script({
			name: '💡 使用提示',
			url: [
				['学习首页', 'https://onlineweb.zhihuishu.com/onlinestuh5'],
				['首页', 'https://www.zhihuishu.com/']
			],
			namespace: 'zhs.guide',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'请手动进入视频、作业、考试页面，脚本会自动运行。',
						'兴趣课会自动下一个，所以不提供脚本。',
						'校内学分课的考试脚本还未提供，请手动(划词)搜题。'
					]).outerHTML
				}
			},
			oncomplete() {
				// 置顶
				CommonProject.scripts.render.methods.pin(this);
			}
		}),
		'gxk-work-and-exam-guide': new Script({
			name: '💡 共享课-作业考试提示',
			url: [['共享课作业考试列表页面', 'zhihuishu.com/stuExamWeb.html#/webExamList\\?']],
			namespace: 'zhs.work.gxk-guide',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'在进行作业或者考试之前，请在”通用-全局设置“中设置好题库配置',
						'请点击任意的作业/考试进入'
					]).outerHTML
				}
			},
			oncomplete() {
				// 置顶
				CommonProject.scripts.render.methods.pin(this);
			}
		}),
		'gxk-study': new Script({
			name: '🖥️ 共享课-学习脚本',
			url: [['共享课学习页面', 'studyvideoh5.zhihuishu.com']],
			namespace: 'zhs.gxk.study',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'章节测试请大家观看完视频后手动打开。',
						[
							'请大家仔细打开视频上方的”学前必读“，查看成绩分布。',
							'如果 “平时成绩-学习习惯成绩” 占比多的话，就需要规律学习。',
							'每天定时半小时可获得一分习惯分。',
							'如果不想要习惯分可忽略。'
						],
						'不要最小化浏览器，可能导致脚本暂停。'
					]).outerHTML
				},
				/** 学习记录 []  */
				studyRecord: {
					defaultValue: [] as {
						/** 学习日期 */
						date: number;
						courses: {
							/** 课程名 */
							name: string;
							/** 学习时间 */
							time: number;
						}[];
					}[]
				},
				stopTime: {
					label: '定时停止',
					tag: 'select',
					attrs: { title: '到时间后自动暂停脚本' },
					defaultValue: '0',
					onload() {
						this.append(
							...$creator.selectOptions(this.getAttribute('value'), [
								[0, '关闭'],
								[0.5, '半小时后'],
								[1, '一小时后'],
								[2, '两小时后']
							])
						);
					}
				},
				restudy: restudy,
				volume: volume,
				definition: definition,
				playbackRate: {
					label: '视频倍速',
					tag: 'select',
					defaultValue: 1,
					onload() {
						this.append(
							...$creator.selectOptions(
								this.getAttribute('value'),
								[1, 1.25, 1.5].map((rate) => [rate, rate + 'x'])
							)
						);
					}
				}
			},
			methods() {
				return {
					/**
					 * 增加学习时间
					 * @param courseName 课程名
					 * @param val 增加的时间
					 */
					increaseStudyTime: (courseName: string, val: number) => {
						const records = this.cfg.studyRecord;
						// 查找是否存在今天的记录
						const record = records.find(
							(r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
						);
						let courses: {
							name: string;
							time: number;
						}[] = [];
						if (record) {
							courses = record.courses;
						} else {
							records.push({ date: Date.now(), courses: courses });
						}

						// 查找是否存在课程记录
						const course = courses.find((c) => c.name === courseName);
						if (course) {
							// 存在则累加时间
							course.time = course.time + val;
							// 历史遗留问题，之前的倍速没有转换为数字，导致可能显示为字符串
							if (typeof course.time === 'string') {
								course.time = parseFloat(course.time);
							}
						} else {
							// 不存在则新建
							courses.push({ name: courseName, time: 0 });
						}

						this.cfg.studyRecord = records;
					}
				};
			},
			onrender({ panel }) {
				panel.body.append(
					el('hr'),
					$creator.button('⏰检测是否需要规律学习', {}, (btn) => {
						btn.style.marginRight = '12px';
						btn.onclick = () => {
							$el('.iconbaizhoumoshi-xueqianbidu')?.click();

							setTimeout(() => {
								const pmd = $el('.preschool-Mustread-div');
								if (pmd) {
									const num = parseInt(pmd.innerText.match(/学习习惯成绩（(\d+)分）/)?.[1] || '0');
									$modal('alert', {
										content:
											`当前课程习惯分占比为${num}分，` +
											(num
												? `需要规律学习${num}天, 每天定时观看半小时即可。（如果不想拿习惯分可以忽略）`
												: '可一直观看学习，无需定时停止。')
									});
								} else {
									$modal('alert', { content: '检测失败，请确认在视频学习页面使用此按钮。' });
								}
							}, 100);
						};
					}),
					$creator.button('📘查看学习记录', {}, (btn) => {
						btn.onclick = () => {
							$modal('alert', {
								title: '学习记录',
								content: $creator.notes(
									this.cfg.studyRecord.map((r) => {
										const date = new Date(r.date);
										return [
											`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
												.getDate()
												.toString()
												.padStart(2, '0')}`,
											$creator.notes(r.courses.map((course) => `${course.name} - ${optimizeSecond(course.time)}`))
										];
									})
								)
							});
						};
					})
				);
			},
			onactive() {
				// 重置时间
				this.cfg.stopTime = '0';
				if (this.cfg.playbackRate) {
					// 转换为数字
					this.cfg.playbackRate = parseFloat(this.cfg.playbackRate.toString());
				}
			},
			async oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);

				const waitForVue = () => {
					return new Promise<any>((resolve, reject) => {
						const vue = $el('.video-study')?.__vue__;
						if (vue?.data?.courseInfo) {
							resolve(vue);
						} else {
							setTimeout(() => {
								resolve(waitForVue());
							}, 1000);
						}
					});
				};
				const vue = await waitForVue();
				console.log(vue);

				let stopInterval: any = 0;
				let stopMessage: MessageElement;
				// 监听定时停止
				this.onConfigChange('stopTime', () => {
					clearInterval(stopInterval);
					stopMessage?.remove();
					if (this.cfg.stopTime === '0') {
						$message('info', { content: '定时停止已关闭' });
					} else {
						let stopCount = parseFloat(this.cfg.stopTime) * 60 * 60;
						stopInterval = setInterval(() => {
							if (stopCount > 0 && hasCapture === false) {
								stopCount--;
							} else {
								clearInterval(stopInterval);
								stop = true;
								$el<HTMLVideoElement>('video')?.pause();
								$modal('alert', { content: '脚本暂停，已获得今日平时分，如需继续观看，请刷新页面。' });
							}
						}, 1000);
						const val = [
							[0.5, '半小时后'],
							[1, '一小时后'],
							[2, '两小时后']
						].find((t) => t[0].toString() === this.cfg.stopTime)?.[0] as number;
						const date = new Date();
						date.setMinutes(date.getMinutes() + val * 60);
						stopMessage = $message('info', {
							duration: 0,
							content: `在 ${date.toLocaleTimeString()} 脚本将自动暂停`
						});
					}
				});

				// 监听音量
				this.onConfigChange('volume', (curr) => {
					state.study.currentMedia && (state.study.currentMedia.volume = curr);
				});

				// 监听速度
				this.onConfigChange('playbackRate', (curr) => {
					if (typeof curr === 'string') {
						this.cfg.playbackRate = parseFloat(curr);
					}
					switchPlaybackRate(this.cfg.playbackRate);
				});

				// 监听清晰度
				this.onConfigChange('definition', (curr) => {
					switchLine(curr);
				});

				const hideDialog = () => {
					/** 隐藏通知弹窗 */
					$$el('.el-dialog__wrapper').forEach((dialog) => {
						dialog.remove();
					});
				};
				/** 关闭测验弹窗 */
				const closeTestDialog = async () => {
					const items = $$el('.topic-item');
					if (items.length !== 0) {
						// 选择A
						items[0].click();
						await $.sleep(1000);
						// 关闭弹窗
						vue.testDialog = false;
					}
				};

				const finish = () => {
					$modal('alert', {
						content: '检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。'
					});
				};
				/** 固定视频进度 */
				const fixProcessBar = () => {
					const bar = $el('.controlsBar');
					if (bar) {
						bar.style.display = 'block';
					}
				};

				// 循环记录学习时间
				const recordStudyTimeLoop = () => {
					this.methods.increaseStudyTime(vue.data.courseInfo.name, this.cfg.playbackRate);
					setTimeout(recordStudyTimeLoop, 1000);
				};
				recordStudyTimeLoop();

				let timeMessage: MessageElement;
				// 计算课程完成所需时间
				const calculateTime = () => {
					try {
						const vue = $el('.video-study')?.__vue__;
						const videos = (vue.videoList as any[])
							.map((v: any) => v.videoLessons)
							.flat()
							.map((l: any) => /** 章节或者章节中的小节 */ l?.videoSmallLessons || l)
							.flat()
							/** 排除已经学习过的 */
							.filter((v) => v.isStudiedLesson === 0);

						const allTime: number = videos.map((l) => l.videoSec || 0).reduce((pre, curr) => pre + curr, 0) / (60 * 60);

						// 获取今日学习时间
						const record = this.cfg.studyRecord.find(
							(r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
						);
						const time = optimizeSecond(record?.courses.find((c) => c.name === vue.data.courseInfo.name)?.time || 0);

						timeMessage?.remove();
						timeMessage = $message('info', {
							duration: 0,
							content: `还剩${videos.length - 1}个视频，总时长${allTime.toFixed(2)}小时，今日已学习${time}`
						});
					} catch (err) {
						console.error(err);
					}
				};

				const interval = setInterval(async () => {
					// 等待视频加载完成
					if (vue.videoList.length) {
						clearInterval(interval);
						hack();
						hideDialog();

						setInterval(() => {
							closeTestDialog();
							fixProcessBar();
							// 删除遮罩层
							$$el('.v-modal,.mask').forEach((modal) => {
								modal.remove();
							});
						}, 3000);

						// 查找任务
						const findVideoItem = (opts: {
							/**
							 * 是否往下查找下一个任务
							 */
							next: boolean;
						}) => {
							let videoItems = Array.from(document.querySelectorAll<HTMLElement>('.clearfix.video'));
							// 如果不是复习模式，则排除掉已经完成的任务
							if (!this.cfg.restudy) {
								videoItems = videoItems.filter((el) => el.querySelector('.time_icofinish') === null);
							}

							for (let i = 0; i < videoItems.length; i++) {
								const item = videoItems[i];
								if (item.classList.contains('current_play')) {
									return videoItems[i + (opts.next ? 1 : 0)];
								}
							}

							return videoItems[0];
						};

						$message('info', { content: '3秒后开始学习', duration: 3 });
						const study = async (opts: { next: boolean }) => {
							if (stop === false) {
								const item = findVideoItem(opts);
								console.log('item', item);

								if (item) {
									await $.sleep(3000);
									item.click();
									await $.sleep(5000);
									watch(
										{ volume: this.cfg.volume, playbackRate: this.cfg.playbackRate, definition: this.cfg.definition },
										({ next }) => {
											study({ next });
										}
									);
									calculateTime();
								} else {
									finish();
								}
							} else {
								$message('warn', {
									content: '检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。'
								});
							}
						};
						// 当页面初始化时无需切换下一个视频，直接播放当前的。
						study({ next: false });
					}
				}, 1000);

				// 10秒后还没加载出来，则结束
				setTimeout(() => {
					if (vue.videoList.length === 0) {
						finish();
						clearInterval(interval);
					}
				}, 10 * 1000);
			}
		}),
		'gxk-work': new Script({
			name: '✍️ 共享课-作业考试脚本',
			url: [
				['共享课作业页面', 'zhihuishu.com/stuExamWeb.html#/webExamList/dohomework'],
				['共享课考试页面', 'zhihuishu.com/stuExamWeb.html#/webExamList/doexamination']
			],
			namespace: 'zhs.gxk.work',
			configs: { notes: workNotes },
			async oncomplete() {
				// 等待试卷加载
				await waitForQuestionsLoad();

				const isExam = location.href.includes('doexamination');
				$message('info', { content: `开始${isExam ? '考试' : '作业'}` });
				commonWork(this, {
					workerProvider: (opts) => gxkWorkAndExam(opts)
				});
			}
		}),
		'xnk-study': new Script({
			name: '🖥️ 校内课-学习脚本',
			url: [['校内课学习页面', 'zhihuishu.com/aidedteaching/sourceLearning']],
			namespace: 'zhs.xnk.study',
			configs: {
				notes: {
					defaultValue: $creator.notes(['章节测试请大家观看完视频后手动打开。', '此课程不能使用倍速。']).outerHTML
				},
				restudy: restudy,
				volume: volume
			},
			oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);

				const finish = () => {
					$modal('alert', {
						content: '检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。'
					});
				};

				// 监听音量
				this.onConfigChange('volume', (curr) => {
					state.study.currentMedia && (state.study.currentMedia.volume = curr);
				});

				let list: HTMLElement[] = [];

				const interval = setInterval(async () => {
					/** 查找任务 */
					list = $$el('.icon-video').map((icon) => icon.parentElement as HTMLElement);

					// 等待视频加载完成
					if (list.length) {
						clearInterval(interval);

						/** 如果不是复习模式，则排除掉已经完成的任务 */
						if (!this.cfg.restudy) {
							list = list.filter((el) => el.querySelector('.icon-finish') === null);
						}

						const item = list[0];
						if (item) {
							if (item.classList.contains('active')) {
								watch({ volume: this.cfg.volume, playbackRate: 1 }, () => {
									/** 下一章 */
									if (list[1]) list[1].click();
								});
							} else {
								// 为什么不播放，因为点击后会刷新整个页面，加载后就会运行上面的那个 if 语句
								item.click();
							}
						}
					}
				}, 1000);

				setTimeout(() => {
					if (list.length === 0) {
						finish();
						clearInterval(interval);
					}
				}, 10 * 1000);
			}
		}),
		'xnk-work': new Script({
			name: '✍️ 校内课-作业考试脚本',
			url: [
				['校内课作业页面', 'zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList'],
				['校内课考试页面', 'zhihuishu.com/atHomeworkExam/stu/examQ/examexercise']
			],
			namespace: 'zhs.xnk.work',
			configs: { notes: workNotes },
			async oncomplete() {
				commonWork(this, {
					workerProvider: xnkWork
				});
			}
		})
	}
});

/**
 * 观看视频
 * @param setting
 * @returns
 */
async function watch(
	options: { volume: number; playbackRate: number; definition?: 'line1bq' | 'line1gq' },
	onended: (opts: { next: boolean }) => void
) {
	// 部分用户视频加载很慢，这里等待一下
	await waitForVideo();

	const set = async () => {
		// 设置清晰度
		switchLine(options.definition);
		await $.sleep(1000);

		// 设置播放速度
		switchPlaybackRate(options.playbackRate);
		await $.sleep(1000);

		// 上面操作会导致元素刷新，这里重新获取视频
		const video = await waitForVideo();
		state.study.currentMedia = video;

		if (video) {
			// 如果已经播放完了，则重置视频进度
			video.currentTime = 1;
			// 音量
			video.volume = options.volume;
		}

		return video;
	};

	const video = await set();

	const videoCheckInterval = setInterval(async () => {
		// 如果视频元素无法访问，证明已经切换了视频
		if (video?.isConnected === false) {
			clearInterval(videoCheckInterval);
			$message('info', { content: '检测到视频切换中...' });
			/**
			 * 元素无法访问证明用户切换视频了
			 * 所以不往下播放视频，而是重新播放用户当前选中的视频
			 */
			onended({ next: false });
		}
	}, 3000);

	playMedia(() => video?.play());

	video.onpause = async () => {
		if (!video?.ended && stop === false) {
			await waitForCaptcha();
			await $.sleep(1000);
			video?.play();
		}
	};

	video.onended = () => {
		clearInterval(videoCheckInterval);
		// 正常切换下一个视频
		onended({ next: true });
	};
}

/**
 * 切换视频清晰度
 * @param definition 清晰度的类名
 */
function switchLine(definition: 'line1bq' | 'line1gq' = 'line1bq') {
	$el(`.definiLines .${definition}`)?.click();
}

/**
 * 切换视频清晰度
 * @param playbackRate 播放速度
 */
function switchPlaybackRate(playbackRate: number) {
	$el(`.speedList [rate="${playbackRate === 1 ? '1.0' : playbackRate}"]`)?.click();
}

/**
 * 检测是否有验证码，并等待验证
 */

function checkForCaptcha(update: (hasCaptcha: boolean) => void) {
	let modal: HTMLDivElement | undefined;
	return setInterval(() => {
		if ($el('.yidun_popup')) {
			update(true);
			// 如果弹窗不存在，则显示
			if (modal === undefined) {
				modal = $modal('alert', { content: '当前检测到验证码，请输入后方可继续运行。' });
			}
		} else {
			if (modal) {
				update(false);
				// 关闭弹窗
				modal.remove();
				modal = undefined;
			}
		}
	}, 1000);
}

export function waitForCaptcha(): void | Promise<void> {
	const popup = document.querySelector('.yidun_popup');
	if (popup) {
		$message('warn', { content: '当前检测到验证码，请输入后方可继续运行。' });
		return new Promise<void>((resolve, reject) => {
			const interval = setInterval(() => {
				const popup = document.querySelector('.yidun_popup');
				if (popup === null) {
					clearInterval(interval);
					resolve();
				}
			}, 1000);
		});
	}
}

/**
 * 等待题目加载完毕
 */
function waitForQuestionsLoad() {
	return new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			const vue = $el('#app > div')?.__vue__;
			// 等待题目加载
			if (vue?.alllQuestionTest) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
}

/**
 * 函数劫持
 */
function hack() {
	const vue = $el('.video-study')?.__vue__;
	const empty = () => {};
	vue.checkout = empty;
	vue.notTrustScript = empty;
	vue.checkoutNotTrustScript = empty;
	const _videoClick = vue.videoClick;
	vue.videoClick = function (...args: any[]) {
		const e = new PointerEvent('click');
		const event = Object.create({ isTrusted: true });
		Object.setPrototypeOf(event, e);
		args[args.length - 1] = event;
		return _videoClick.apply(vue, args);
	};
	vue.videoClick = function (...args: any[]) {
		args[args.length - 1] = { isTrusted: true };
		return _videoClick.apply(vue, args);
	};
}

/**
 * 共享课的作业和考试
 */
function gxkWorkAndExam({
	answererWrappers,
	period,
	thread,
	stopSecondWhenFinish,
	redundanceWordsText
}: CommonWorkOptions) {
	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'zhs-gxk'
	});

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return removeRedundantWords(
			titles
				.map((title) => {
					// 识别 shadow dom 的文本
					const div = document.createElement('div');
					// @ts-ignore
					div.innerHTML = title.__vue__._data.shadowDom.innerHTML;

					// 解决图片题无法解析的BUG
					for (const img of Array.from(div.querySelectorAll('img'))) {
						img.src = img.dataset.src || '';
					}
					return div;
				})
				.map((t) => (t ? optimizationElementWithImage(t).innerText : ''))
				.filter((t) => t.trim() !== '')
				.join(','),
			redundanceWordsText.split('\n')
		);
	};

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.examPaper_subject',
		elements: {
			title: '.subject_describe > div,.smallStem_describe',
			// 选项中图片识别
			options: (root) =>
				$$el('.subject_node .nodeLab', root).map((t) => {
					for (const img of Array.from(t.querySelectorAll<HTMLImageElement>('.node_detail img'))) {
						// zhs选项中如果已显示的图片则不存在 data-src，如果未显示则存在 data-src
						if (img.dataset.src) {
							img.src = img.dataset.src;
						}
						// 不使用 optimizationElementWithImage 是因为zhs的选项按钮也是一个图片
						createUnVisibleTextOfImage(img);
					}
					return t;
				})
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
			handler(type, answer, option) {
				if (type === 'judgement' || type === 'single' || type === 'multiple') {
					if (!option.querySelector('input')?.checked) {
						option.click();
					}
				} else if (type === 'completion' && answer.trim()) {
					const text = option.querySelector('textarea');
					if (text) {
						text.value = answer;
					}
				}
			}
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

	checkForCaptcha((hasCaptcha) => {
		if (hasCaptcha) {
			worker.emit('stop');
		} else {
			worker.emit('continuate');
		}
	});

	worker
		.doWork()
		.then(async () => {
			$message('success', { content: `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。` });
			await $.sleep(stopSecondWhenFinish * 1000);

			/**
			 * 保存题目，不在选择答案后保存的原因是，如果答题线程大于3会导致题目错乱，因为 resolverIndex 并不是顺序递增的
			 */
			for (let index = 0; index < worker.totalQuestionCount; index++) {
				const modal = $modal('alert', { content: '正在保存题目中，请勿操作...', confirmButton: null });
				await waitForCaptcha();
				await $.sleep(2000);
				// 跳转到该题目，防止用户在保存时切换题目
				document.querySelectorAll<HTMLElement>('.answerCard_list ul li').item(index)?.click();
				await $.sleep(200);
				// 下一页
				const next = $el('div.examPaper_box > div.switch-btn-box > button:nth-child(2)');
				if (next) {
					next.click();
				} else {
					$console.error('未找到下一页按钮。');
				}
				modal?.remove();
			}
			$message('info', { content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
			worker.emit('done');
		})
		.catch((err) => {
			$message('error', { content: '答题程序发生错误 : ' + err.message });
		});

	return worker;
}

/**
 * 校内学分课的作业
 */
function xnkWork({ answererWrappers, period, thread }: CommonWorkOptions) {
	$message('info', { content: '开始作业' });

	CommonProject.scripts.workResults.methods.init();

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return titles
			.filter((t) => t?.innerText)
			.map((t) => (t ? optimizationElementWithImage(t).innerText : ''))
			.join(',');
	};

	const workResults: SimplifyWorkResult[] = [];
	let totalQuestionCount = 0;
	let requestIndex = 0;
	let resolverIndex = 0;

	const worker = new OCSWorker({
		root: '.questionBox',
		elements: {
			title: '.questionContent',
			options: '.optionUl label',
			questionTit: '.questionTit'
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
			handler(type, answer, option, ctx) {
				if (type === 'judgement' || type === 'single' || type === 'multiple') {
					if (option.querySelector('input')?.checked === false) {
						option.click();
					}
				} else if (type === 'completion' && answer.trim()) {
					const text = option.querySelector('textarea');
					if (text) {
						text.value = answer;
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

	const getBtn = () => document.querySelector('span.Topicswitchingbtn:nth-child(2)') as HTMLElement;
	let next = getBtn();

	(async () => {
		while (next && worker.isClose === false) {
			await worker.doWork();
			await $.sleep((period ?? 3) * 1000);
			next = getBtn();
			next?.click();
			await $.sleep((period ?? 3) * 1000);
		}

		$message('info', { content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
		worker.emit('done');
		CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = 'zhs-xnk';
	})();

	return worker;
}

/**
 * 将秒数转换为小时或分钟
 * @param second 秒
 */
function optimizeSecond(second: number) {
	if (second > 3600) {
		return `${Math.floor(second / 3600)}小时${Math.floor((second % 3600) / 60)}分钟`;
	} else if (second > 60) {
		return `${Math.floor(second / 60)}分钟${second % 60}秒`;
	} else {
		return `${second}秒`;
	}
}

/**
 * 等待视频加载并获取视频
 */
async function waitForVideo() {
	const res = await Promise.race([
		new Promise<HTMLVideoElement>((resolve, reject) => {
			const interval = setInterval(() => {
				const video = document.querySelector('video');
				if (video) {
					clearInterval(interval);
					resolve(video);
				}
			}, 1000);
		}),
		$.sleep(3 * 60 * 1000)
	]);
	if (res) {
		return res;
	} else {
		$message('error', { content: '视频加载超时，请刷新重试' });
		throw new Error('视频加载超时');
	}
}
