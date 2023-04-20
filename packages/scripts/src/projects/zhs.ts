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
	$model
} from '@ocsjs/core';
import type { MessageElement } from '@ocsjs/core';
import { CommonProject } from './common';
import { workConfigs, definition, volume, restudy } from '../utils/configs';
import {
	createWorkerControl,
	optimizationElementWithImage,
	removeRedundantWords,
	simplifyWorkResult
} from '../utils/work';
import { CommonWorkOptions, playMedia, workPreCheckMessage } from '../utils';
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
					defaultValue: $creator.notes(
						[
							[
								el('b', '在进行作业或者考试之前，请在”通用-全局设置“中设置好题库配置'),
								el('b', '并在作业和考试脚本中开启自动答题选项，否则将无法正常答题。')
							],
							'考试自动答题在设置中开启，并点击进入即可使用',
							'进入考试页面后需要刷新一下。',
							'考试功能因为被频繁针对所以不稳定, 大家预留好其他搜题方式。'
						],
						'ol'
					).outerHTML
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
									$model('alert', {
										content:
											`当前课程习惯分占比为${num}分，` +
											(num
												? `需要规律学习${num}天, 每天定时观看半小时即可。（如果不想拿习惯分可以忽略）`
												: '可一直观看学习，无需定时停止。')
									});
								} else {
									$model('alert', { content: '检测失败，请确认在视频学习页面使用此按钮。' });
								}
							}, 100);
						};
					}),
					$creator.button('📘查看学习记录', {}, (btn) => {
						btn.onclick = () => {
							$model('alert', {
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
				const records = this.cfg.studyRecord;
				// 查找是否存在学习记录，不存在则新建
				const record = records.find(
					(record) => new Date(record.date).toLocaleDateString() === new Date().toLocaleDateString()
				);
				/** 初始化今日学习记录 */
				if (!record) {
					records.push({ date: Date.now(), courses: [] });
					this.cfg.studyRecord = records;
				}
			},
			oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);

				const vue = $el('.video-study')?.__vue__;
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
								$model('alert', { content: '脚本暂停，已获得今日平时分，如需继续观看，请刷新页面。' });
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
					switchPlaybackRate(parseFloat(curr.toString()));
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
					$model('alert', {
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

				let timeMessage: MessageElement;
				const calculateTime = () => {
					// 计算视频完成所需时间
					try {
						const vue = $el('.video-study')?.__vue__;
						const videos = (vue.videoList as any[])
							.map((v: any) => v.videoLessons)
							.flat()
							.map((l: any) => /** 章节或者章节中的小节 */ l?.videoSmallLessons || l)
							.flat()
							/** 排除已经学习过的 */
							.filter((v) => v.isStudiedLesson === 0);
						const allTime: number = videos.map((l) => l.videoSec || 0).reduce((pre, curr) => pre + curr, 0);
						if (timeMessage) {
							timeMessage.remove();
						}

						const record = this.cfg.studyRecord.find(
							(r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
						);
						timeMessage = $message('info', {
							duration: 0,
							content: `还剩${videos.length - 1}个视频，总时长${(allTime / (60 * 60)).toFixed(
								2
							)}小时，今日已学习${optimizeSecond(
								record?.courses.find((c) => c.name === vue.data.courseInfo.name)?.time || 0
							)}`
						});
					} catch {}
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

							// 记录学习时间
							if (!stop) {
								const records = this.cfg.studyRecord;
								const record = records.find(
									(r) => new Date(r.date).toLocaleDateString() === new Date().toLocaleDateString()
								);
								if (record) {
									record.courses = record?.courses || [];
									const course = record?.courses.find((c) => c.name === vue.data.courseInfo.name);
									if (course) {
										course.time = course.time + 3;
									} else {
										record.courses.push({ name: vue.data.courseInfo.name, time: 0 });
									}
									this.cfg.studyRecord = records;
								}
							}
						}, 3000);

						// 查找任务
						let list = $$el('li.clearfix.video');
						// 如果不是复习模式，则排除掉已经完成的任务
						if (!this.cfg.restudy) {
							list = list.filter((el) => el.querySelector('.time_icofinish') === null);
						}

						if (list.length === 0) {
							finish();
						} else {
							$message('info', { content: '3秒后开始学习', duration: 3 });
							const study = async () => {
								if (stop === false) {
									const item = list.shift();
									if (item) {
										await $.sleep(3000);
										item.click();
										await $.sleep(5000);
										watch(
											{ volume: this.cfg.volume, playbackRate: this.cfg.playbackRate, definition: this.cfg.definition },
											study
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
							study();
						}
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
			name: '✍️ 共享课-作业脚本',
			url: [
				['共享课作业页面', 'zhihuishu.com/stuExamWeb.html#/webExamList/dohomework'],
				/** 在列表中也提供设置页面 */
				['共享课作业考试列表页面', 'zhihuishu.com/stuExamWeb.html#/webExamList\\?']
			],
			namespace: 'zhs.gxk.work',
			configs: workConfigs,
			async oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);
				const changeMsg = () => $message('info', { content: '检测到设置更改，请重新进入，或者刷新作业页面进行答题。' });
				this.onConfigChange('auto', changeMsg);

				let worker: OCSWorker<any> | undefined;
				let warn: MessageElement | undefined;

				this.on('render', () => createWorkerControl(this, () => worker));
				this.event.on('start', () => start());
				this.event.on('restart', () => {
					worker?.emit('close');
					$message('info', { content: '3秒后重新答题。' });
					setTimeout(start, 3000);
				});

				/** 开始作业 */
				const start = () => {
					warn?.remove();
					/**
					 * 识别文字
					 */
					recognize();
					workPreCheckMessage({
						onrun: (opts) => {
							worker = gxkWorkOrExam('work', opts);
						},
						ondone: () => this.event.emit('done'),
						...CommonProject.scripts.settings.cfg
					});
				};

				if (/zhihuishu.com\/stuExamWeb.html#\/webExamList\/dohomework/.test(location.href)) {
					/** 显示答题控制按钮 */
					createWorkerControl(this, () => worker);

					// 等待试卷加载
					await waitForQuestionsLoad();

					if (this.cfg.auto) {
						start();
					} else {
						this.event.emit('done');
						const startBtn = el('button', { className: 'base-style-button' }, '进入考试脚本');
						startBtn.onclick = () => {
							CommonProject.scripts.render.methods.pin(this);
						};
						const isPinned = await CommonProject.scripts.render.methods.isPinned(this);
						return $message('warn', {
							duration: 0,
							content: el('div', [
								`'自动答题已被关闭！请${isPinned ? '' : '进入作业脚本，然后'}点击开始答题，或者忽略此警告。`,
								isPinned ? '' : startBtn
							])
						});
					}
				}
			}
		}),
		'gxk-exam': new Script({
			name: '✍️ 共享课-考试脚本',
			url: [
				['共享课考试页面', 'zhihuishu.com/stuExamWeb.html#/webExamList/doexamination'],
				/** 在列表中也提供设置页面 */
				['共享课作业考试列表页面', 'zhihuishu.com/stuExamWeb.html#/webExamList\\?']
			],
			namespace: 'zhs.gxk.exam',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'答题前请在 “通用-全局设置” 中设置题库配置，才能开始自动答题。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'考试请在脚本自动答题完成后自行检查，自己点击提交，脚本不会自动提交。',
						'如果开启后脚本仍然没有反应，请刷新页面重试。'
					]).outerHTML
				},
				auto: {
					label: '开启自动答题',
					attrs: { type: 'checkbox' },
					defaultValue: false
				}
			},

			async oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);

				const changeMsg = () => $message('info', { content: '检测到设置更改，请重新进入，或者刷新作业页面进行答题。' });

				this.onConfigChange('auto', changeMsg);

				let worker: OCSWorker<any> | undefined;

				this.on('render', () => createWorkerControl(this, () => worker));
				this.event.on('start', () => start());
				this.event.on('restart', () => {
					worker?.emit('close');
					$message('info', { content: '3秒后重新答题。' });
					setTimeout(start, 3000);
				});

				/** 开始考试 */
				const start = () => {
					/**
					 * 识别文字，需要放在 start 下因为考试页面切换的时候并不会触发 oncomplete
					 */
					recognize();

					workPreCheckMessage({
						onrun: (opts) => {
							worker = gxkWorkOrExam('exam', opts);
						},
						ondone: () => {
							this.event.emit('done');
						},

						...CommonProject.scripts.settings.cfg,
						upload: 'nomove'
					});
				};

				if (/zhihuishu.com\/stuExamWeb.html#\/webExamList\/doexamination/.test(location.href)) {
					/** 显示答题控制按钮 */
					createWorkerControl(this, () => worker);

					// 等待试卷加载
					await waitForQuestionsLoad();

					if (this.cfg.auto) {
						start();
					} else {
						this.event.emit('done');
						const startBtn = el('button', { className: 'base-style-button' }, '进入考试脚本');
						startBtn.onclick = () => {
							CommonProject.scripts.render.methods.pin(this);
						};
						const isPinned = await CommonProject.scripts.render.methods.isPinned(this);
						return $message('warn', {
							duration: 0,
							content: el('div', [
								`'自动答题已被关闭！请${isPinned ? '' : '进入考试脚本，然后'}点击开始答题，或者忽略此警告。`,
								isPinned ? '' : startBtn
							])
						});
					}
				}
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
					$model('alert', {
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
			url: [['校内课考试页面', 'zhihuishu.com/atHomeworkExam/stu/homeworkQ/exerciseList']],
			namespace: 'zhs.xnk.work',
			configs: workConfigs,

			async oncomplete() {
				// 置顶当前脚本
				CommonProject.scripts.render.methods.pin(this);

				const changeMsg = () => $message('info', { content: '检测到设置更改，请重新进入，或者刷新作业页面进行答题。' });
				this.onConfigChange('auto', changeMsg);

				let worker: OCSWorker<any> | undefined;

				/** 显示答题控制按钮 */
				createWorkerControl(this, () => worker);

				this.on('render', () => createWorkerControl(this, () => worker));

				this.on('start', () => start());
				this.event.on('restart', () => {
					worker?.emit('close');
					$message('info', { content: '3秒后重新答题。' });
					setTimeout(start, 3000);
				});

				if (this.cfg.auto === false) {
					const startBtn = el('button', { className: 'base-style-button' }, '进入作业脚本');
					startBtn.onclick = () => {
						CommonProject.scripts.render.methods.pin(this);
					};
					const isPinned = await CommonProject.scripts.render.methods.isPinned(this);
					return $message('warn', {
						duration: 0,
						content: el('div', [
							`'自动答题已被关闭！请${isPinned ? '' : '进入作业脚本，然后'}点击开始答题，或者忽略此警告。`,
							isPinned ? '' : startBtn
						])
					});
				}

				const start = () => {
					workPreCheckMessage({
						onrun: (opts) => {
							worker = xnkWork(opts);
						},
						ondone: () => {
							this.event.emit('done');
						},
						...CommonProject.scripts.settings.cfg
					});
				};
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
	onended: () => void
) {
	const set = async () => {
		// 设置清晰度
		switchLine(options.definition);
		await $.sleep(1000);

		// 设置播放速度
		switchPlaybackRate(options.playbackRate);
		await $.sleep(500);

		// 上面操作会导致元素刷新，这里重新获取视频
		const video = $el<HTMLVideoElement>('video');
		state.study.currentMedia = video;

		if (video) {
			// 如果已经播放完了，则重置视频进度
			video.currentTime = 1;
			await $.sleep(500);

			// 音量
			video.volume = options.volume;
			await $.sleep(500);
		}

		return video;
	};

	const video = await set();

	if (video) {
		playMedia(() => video.play());

		video.onpause = async () => {
			if (!video.ended && stop === false) {
				await waitForCaptcha();
				await $.sleep(1000);
				video.play();
			}
		};

		video.onended = onended;
	} else {
		$console.error('未检测到视频，请刷新重试。');
	}
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
				modal = $model('alert', { content: '当前检测到验证码，请输入后方可继续运行。' });
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

/** 识别试卷文字 */
function recognize() {
	for (const div of $$el('.subject_describe > div')) {
		// @ts-ignore
		div.__vue__.$el.innerHTML = div.__vue__._data.shadowDom.textContent;
	}
}

/**
 * 共享课的作业和考试
 */
function gxkWorkOrExam(
	type: 'work' | 'exam' = 'work',
	{ answererWrappers, period, upload, thread, stopSecondWhenFinish, redundanceWordsText }: CommonWorkOptions
) {
	$message('info', { content: `开始${type === 'work' ? '作业' : '考试'}` });

	// 置顶搜索结果面板
	CommonProject.scripts.render.methods.pin(CommonProject.scripts.workResults);
	// 刷新搜索结果状态
	CommonProject.scripts.workResults.methods.refreshState();
	// 清空搜索结果
	CommonProject.scripts.workResults.methods.clearResults();

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return removeRedundantWords(
			titles
				.filter((t) => t?.innerText)
				.map((t) => (t ? optimizationElementWithImage(t).innerText : ''))
				.join(','),
			redundanceWordsText.split('\n')
		);
	};

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.examPaper_subject',
		elements: {
			title: '.subject_describe,.smallStem_describe',
			options: '.subject_node .nodeLab'
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 1,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) =>
			defaultAnswerWrapperHandler(answererWrappers, {
				type,
				title: titleTransform(elements.title),
				root: ctx.root
			}),
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
		.then(async (results) => {
			await $.sleep(stopSecondWhenFinish * 1000);

			// 保存题目
			const text = el('span', '正在保存题目中，请勿操作...');
			const modal = $model('alert', { content: text });

			for (let index = 0; index < worker.totalQuestionCount; index++) {
				await $.sleep(2000);
				// 下一页
				const next = $el('div.examPaper_box > div.switch-btn-box > button:nth-child(2)');
				if (next) {
					next.click();
				} else {
					$console.error('未找到下一页按钮。');
				}
			}
			text.innerText = '所有题目保存成功。';
			setTimeout(() => modal?.remove(), 1000);

			if (type === 'exam') {
				$message('info', { content: '考试完成，为了安全考虑，请自行检查后自行点击提交！' });
			} else {
				// 处理提交
				await worker.uploadHandler({
					type: upload,
					results,
					async callback(finishedRate, uploadable) {
						$message('info', {
							content: `完成率 ${finishedRate.toFixed(2)} :  ${uploadable ? '5秒后将自动提交' : '5秒后将自动保存'} `
						});

						await $.sleep(5000);

						// 保存按钮， 提交按钮
						const saveBtn = $el('.btnStyleX:not(.btnStyleXSumit)');
						const uploadBtn = $el('.btnStyleXSumit');

						if (uploadable) {
							uploadBtn?.click();
						} else {
							saveBtn?.click();
						}

						await $.sleep(2000);
						/** 确定按钮 */
						$el("[role='dialog'] .el-button--primary")?.click();
					}
				});
			}
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

	// 置顶搜索结果面板
	CommonProject.scripts.render.methods.pin(CommonProject.scripts.workResults);
	// 刷新搜索结果状态
	CommonProject.scripts.workResults.methods.refreshState();
	// 清空搜索结果
	CommonProject.scripts.workResults.methods.clearResults();

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return titles
			.filter((t) => t?.innerText)
			.map((t) => (t ? optimizationElementWithImage(t).innerText : ''))
			.join(',');
	};

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
				return defaultAnswerWrapperHandler(answererWrappers, { type, title, root: ctx.root });
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

		onResultsUpdate(res) {
			CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
		},
		onResolveUpdate(res) {
			CommonProject.scripts.workResults.methods.updateWorkState(worker);
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
	})();

	return worker;
}

function optimizeSecond(second: number) {
	return second / 3600 < 1 ? `${(second / 60).toFixed(2)}分钟` : `${(second / 3600).toFixed(2)}小时`;
}
