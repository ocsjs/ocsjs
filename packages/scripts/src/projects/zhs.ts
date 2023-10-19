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
import { waitForMedia } from '../utils/study';
import { $app_actions } from '../utils/app';

const state = {
	study: {
		/**
		 * 学习是否暂停
		 */
		stop: false,
		currentMedia: undefined as HTMLMediaElement | undefined,
		stopInterval: 0 as any,
		stopMessage: undefined as MessageElement | undefined
	},
	work: {
		workInfo: undefined as any
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
						'兴趣课会自动下一个，所以不提供脚本。'
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
						'不要最小化浏览器，可能导致脚本暂停。',
						'运行过程中请最小化脚本窗口，避免窗口遮挡，无法点击元素'
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
				panel.body.replaceChildren(
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

				// 10秒后还没加载出来，则结束
				setTimeout(() => {
					if ($$el('.clearfix.video').length === 0) {
						finish();
					}
				}, 10 * 1000);

				const waitForVideoList = () => {
					return new Promise<void>((resolve, reject) => {
						if ($$el('.clearfix.video').length > 1) {
							resolve();
						} else {
							setTimeout(() => {
								resolve(waitForVideoList());
							}, 1000);
						}
					});
				};
				await waitForVideoList();

				// 监听定时停止
				this.onConfigChange('stopTime', (stopTime) => {
					if (stopTime === '0') {
						$message('info', { content: '定时停止已关闭' });
					} else {
						autoStop(stopTime);
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
					const options = $$el('#playTopic-dialog ul .topic-item');
					if (options.length !== 0) {
						await waitForCaptcha();
						// 最小化脚本窗口
						CommonProject.scripts.render.methods.moveToEdge();
						// 随机选
						const option = options[Math.floor(Math.random() * options.length)];
						await $app_actions.mouseClick(option);
						await $.sleep(1000);
						// 关闭弹窗
						await $app_actions.mouseClick('#playTopic-dialog .dialog-footer .btn');
					}
				};

				const finish = () => {
					$modal('alert', {
						content: '检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。'
					});
				};

				// 循环记录学习时间
				const recordStudyTimeLoop = () => {
					this.methods.increaseStudyTime($el('.source-name')?.innerText || '无名称', this.cfg.playbackRate);
					setTimeout(recordStudyTimeLoop, 1000);
				};

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

				// 检查是否为软件环境
				if (!(await $app_actions.init())) {
					return $app_actions.showError();
				}

				// 检测是否需要学前必读
				closeDialogRead();
				// 循环记录学习时间
				recordStudyTimeLoop();
				// 自动隐藏弹窗
				hideDialog();
				// 自动暂停
				autoStop(this.cfg.stopTime);

				setInterval(async () => {
					await closeTestDialog();
					// 定时显示进度条，防止消失
					fixProcessBar();
					// 删除遮罩层
					$$el('.v-modal,.mask').forEach((modal) => {
						modal.remove();
					});
				}, 3000);

				$message('info', { content: '3秒后开始学习', duration: 3 });

				const study = async (opts: { next: boolean }) => {
					if (state.study.stop === false) {
						const item = findVideoItem(opts);

						if (item) {
							await $.sleep(3000);
							// 最小化脚本窗口
							CommonProject.scripts.render.methods.moveToEdge();
							// 点击侧边栏任务
							await $app_actions.mouseClick(item);

							watch(
								{ volume: this.cfg.volume, playbackRate: this.cfg.playbackRate, definition: this.cfg.definition },
								({ next }) => {
									study({ next });
								}
							);
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
		}),
		'gxk-work': new Script({
			name: '✍️ 共享课-作业考试脚本',
			url: [
				['共享课作业页面', 'zhihuishu.com/stuExamWeb.html#/webExamList/dohomework'],
				['共享课考试页面', 'zhihuishu.com/stuExamWeb.html#/webExamList/doexamination'],
				['作业考试列表', 'zhihuishu.com/stuExamWeb.html#/webExamList\\?']
			],
			namespace: 'zhs.gxk.work',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'📢 如果未开始答题，请尝试刷新页面。',
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'可以搭配 “通用-在线搜题” 一起使用。'
					]).outerHTML
				}
			},
			methods() {
				return {
					work: async () => {
						if (!(await $app_actions.init())) {
							return $app_actions.showError();
						}

						// 等待试卷加载
						const isExam = location.href.includes('doexamination');
						const isWork = location.href.includes('dohomework');

						if (isExam || isWork) {
							await waitForWorkInfo();
							$message('info', { content: `开始${isExam ? '考试' : '作业'}` });
							commonWork(this, {
								workerProvider: (opts) => gxkWorkAndExam(opts)
							});
						} else {
							$message('info', { content: '📢 请手动进入作业/考试，如果未开始答题，请尝试刷新页面。', duration: 0 });
							CommonProject.scripts.render.methods.pin(this);
						}
					}
				};
			},
			async onstart() {
				const isExam = location.href.includes('doexamination');
				let url = '';
				if (isExam) {
					url = '/taurusExam/gateway/t/v1/student/doExam';
				} else {
					url = '/studentExam/gateway/t/v1/student/doHomework';
				}

				state.work.workInfo = await $app_actions.waitForResponse(url, {
					responseType: 'json'
				});
			},
			async oncomplete() {
				this.methods.work();
				/**
				 * 当页面从作业考试列表跳转到作业考试页面时，触发的是onhistorychange事件，而不是oncomplete事件。
				 */
				this.on('historychange', () => {
					this.methods.work();
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

				const nextElement = () => {
					const list = document.querySelectorAll<HTMLElement>('.file-item');

					let passActive = false;
					for (let index = 0; index < list.length; index++) {
						const item = list[index];
						const finish = !!item.querySelector('.icon-finish');
						// 判断是否需要学习
						const needsStudy = !finish || (finish && this.cfg.restudy);

						if (item.classList.contains('active')) {
							if (needsStudy) {
								return item;
							} else {
								passActive = true;
							}
						}

						if (passActive && needsStudy) {
							return item;
						}
					}
				};

				const interval = setInterval(async () => {
					/** 查找任务 */
					const next = nextElement();

					if (next) {
						clearInterval(interval);

						if (document.querySelector('#mediaPlayer')) {
							watchXnk({ volume: this.cfg.volume }, () => {
								setTimeout(() => {
									/** 下一章 */
									const next = nextElement();
									if (next) next.click();
								}, 3000);
							});
						} else {
							setTimeout(() => {
								$console.log('不是视频任务，即将切换下一章。');
								/** 下一章 */
								const next = nextElement();
								if (next) next.click();
							}, 3000);
						}
					}
				}, 1000);

				setTimeout(() => {
					if (!nextElement()) {
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
	await waitForMedia();

	const set = async () => {
		// 设置清晰度
		await switchLine(options.definition);
		// 设置播放速度
		await switchPlaybackRate(options.playbackRate);

		// 上面操作会导致元素刷新，这里重新获取视频
		const video = await waitForMedia();
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
		if (!video?.ended && state.study.stop === false) {
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
 * 观看校内课
 */
async function watchXnk(options: { volume: number }, onended: () => void) {
	// 部分用户视频加载很慢，这里等待一下
	const media = await waitForMedia();
	media.volume = options.volume;
	media.currentTime = 1;
	state.study.currentMedia = media;

	playMedia(() => media?.play());

	media.onpause = async () => {
		if (!media?.ended) {
			await $.sleep(1000);
			media?.play();
		}
	};

	media.onended = () => {
		// 正常切换下一个视频
		onended();
	};
}

/**
 * 切换视频清晰度
 * @param definition 清晰度的类名
 */
async function switchLine(definition: 'line1bq' | 'line1gq' = 'line1bq') {
	await waitForControlsBar();
	await $app_actions.mouseClick(document.querySelector('.definiBox > span'));
	await $app_actions.mouseClick(document.querySelector(`.definiLines .${definition}`));
}

/**
 * 切换视频清晰度
 * @param playbackRate 播放速度
 */
async function switchPlaybackRate(playbackRate: number) {
	await waitForControlsBar();
	await $app_actions.mouseClick(document.querySelector('.speedBox > span'));
	await $app_actions.mouseClick(
		document.querySelector(`.speedList [rate="${playbackRate === 1 ? '1.0' : playbackRate}"]`)
	);
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

function waitForCaptcha(): void | Promise<void> {
	const popup = getPopupCaptcha();
	if (popup) {
		$message('warn', { content: '当前检测到验证码，请输入后方可继续运行。' });
		return new Promise<void>((resolve, reject) => {
			const interval = setInterval(() => {
				const popup = getPopupCaptcha();
				if (popup === null) {
					clearInterval(interval);
					resolve();
				}
			}, 1000);
		});
	}
}

function getPopupCaptcha() {
	return document.querySelector('.yidun_popup');
}

function waitForWorkInfo() {
	return new Promise<any>((resolve, reject) => {
		const interval = setInterval(() => {
			if (state.work.workInfo) {
				clearInterval(interval);
				resolve(state.work.workInfo);
			}
		}, 1000);
	});
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

	/**
	 * workExamParts 是个列表
	 * 里面包括一个题目类型的列表，第一个是单选，第二个是多选，第三个是判断
	 * 所以这里直接扁平化数组方便处理
	 */
	const allExamParts =
		((state?.work?.workInfo?.rt?.examBase?.workExamParts as any[]) || [])?.map((p) => p.questionDtos).flat() || [];

	const titleTransform = (_: any, index: number) => {
		const div = el('div');

		div.innerHTML = allExamParts[index]?.name || '题目读取失败';
		return removeRedundantWords(optimizationElementWithImage(div).innerText || '', redundanceWordsText.split('\n'));
	};

	let index = 0;

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.examPaper_subject',
		elements: {
			/**
			 * .subject_describe > div: 选择题题目
			 * .smallStem_describe > div:nth-child(2): 阅读理解小题题目
			 */
			title: '.subject_describe > div,.smallStem_describe > div:nth-child(2)',
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
			const title = titleTransform(undefined, index++);
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
			$message('error', { content: '答题程序发生错误 : ' + err.message, duration: 0 });
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

function autoStop(stopTime: string) {
	clearInterval(state.study.stopInterval);
	state.study.stopMessage?.remove();
	if (stopTime !== '0') {
		let stopCount = parseFloat(stopTime) * 60 * 60;
		state.study.stopInterval = setInterval(() => {
			if (stopCount > 0) {
				// 如果有弹窗验证码则暂停自动停止的计时
				if (getPopupCaptcha() === null) {
					stopCount--;
				}
			} else {
				clearInterval(state.study.stopInterval);
				state.study.stop = true;
				$el<HTMLVideoElement>('video')?.pause();
				$modal('alert', { content: '脚本暂停，已获得今日平时分，如需继续观看，请刷新页面。' });
			}
		}, 1000);
		const val = [
			[0.5, '半小时后'],
			[1, '一小时后'],
			[2, '两小时后']
		].find((t) => t[0].toString() === stopTime)?.[0] as number;
		const date = new Date();
		date.setMinutes(date.getMinutes() + val * 60);
		state.study.stopMessage = $message('info', {
			duration: 0,
			content: `在 ${date.toLocaleTimeString()} 脚本将自动暂停`
		});
	}
}
/** 固定视频进度 */
function fixProcessBar() {
	const bar = document.querySelector<HTMLElement>('.controlsBar');
	if (bar) {
		bar.style.display = 'block';
	}
}

/**
 * 等待视频控制栏
 */
function waitForControlsBar() {
	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(() => {
			const bar = document.querySelector<HTMLElement>('.controlsBar');
			if (bar) {
				if (bar.style.display !== 'none') {
					clearInterval(interval);
					resolve();
				} else {
					bar.style.display = 'block';
				}
			}
		}, 1000);
	});
}

function closeDialogRead() {
	const div = document.querySelector('.dialog-read');
	div?.remove();
}
