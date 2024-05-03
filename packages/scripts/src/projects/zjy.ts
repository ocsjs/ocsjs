import { $, OCSWorker, defaultAnswerWrapperHandler } from '@ocsjs/core';
import { Project, Script, $ui, $el, $message } from 'easy-us';
import { volume } from '../utils/configs';
import { waitForMedia } from '../utils/study';
import { CommonWorkOptions, playMedia } from '../utils';
import { $console } from './background';
import { CommonProject } from './common';
import { commonWork, simplifyWorkResult } from '../utils/work';

type CourseType = {
	fileType: string;
	id: string;
	name: string;
};

const state = {
	studying: false,
	studyingId: ''
};

const work_pages: [string, string][] = [
	// 暂时不知道为什么资源库作业有两个不一样的链接
	['资源库keep作业页面', 'study/spockeepTest'],
	['资源库job作业页面', '/study/spocjobTest'],
	['作业页面', 'icve-study/coursePreview/jobTes'],
	['考试页面', 'icve-study/coursePreview/test']
];

const isWork =
	window.location.href.includes('icve-study/coursePreview/jobTes') ||
	window.location.href.includes('study/spockeepTest') ||
	window.location.href.includes('study/spocjobTest');
const isExam = window.location.href.includes('icve-study/coursePreview/test');

/**
 * 职教云网课
 *
 * 因为存在子 iframe 并且 ppt 跨域的情况
 * 所以采用新建小窗口的形式，通过子 window 以及 opener 的形式进行互相回调调用
 * 所以核心逻辑代码可能会比较绕。
 *
 * 为什么不在学习页面写脚本，而是 课程学习 和 学习页面 两个脚本进行交互运行？
 * 因为学习页面无法获取学习进度，这样可能导致已学课程重复学习。
 *
 */
export const ZJYProject = Project.create({
	name: '职教云',
	domains: ['icve.com.cn', 'zjy2.icve.com.cn', 'zyk.icve.com.cn'],
	scripts: {
		guide: new Script({
			name: '🖥️ 使用提示',
			matches: [
				['学习页面', 'zjy2.icve.com.cn/study'],
				['资源库', 'zyk.icve.com.cn/icve-study/']
			],
			namespace: 'zjy.study.guide',
			configs: {
				notes: {
					defaultValue: '请点击任意章节，进入学习。'
				}
			}
		}),
		dispatcher: new Script({
			name: '调度器',
			matches: [
				['学习页面', 'zjy2.icve.com.cn/study'],
				['资源库', 'zyk.icve.com.cn/icve-study/']
			],
			hideInPanel: true,
			methods() {
				return {
					dispatch: () => {
						if (
							[
								'zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware',
								'zyk.icve.com.cn/icve-study/coursePreview/courseware'
							].some((i) => window.location.href.includes(i))
						) {
							ZJYProject.scripts.study.methods.main();
						} else if (work_pages.map(([_, p]) => p).some((i) => window.location.href.includes(i))) {
							ZJYProject.scripts.work.methods.main();
						}
					}
				};
			},
			/**
			 *
			 * 新版职教云采用VUE技术路由，所以这里需要使用 onhistorychange 监听路由变化，然后脚本中自行判断相应的路由执行情况
			 */
			onhistorychange(type) {
				if (type === 'push') {
					this.methods.dispatch();
				}
			},
			oncomplete() {
				this.methods.dispatch();
			}
		}),
		study: new Script({
			matches: [
				['学习页面', 'zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware'],
				['资源库学习页面', 'zyk.icve.com.cn/icve-study/coursePreview/courseware']
			],
			name: '✍️ 课程学习',
			namespace: 'zjy.study.main',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						['如果脚本卡死或者您不想学习，', '可以点击其他任意章节继续进行学习。'],
						'提示：职教云无法使用倍速。'
					]).outerHTML
				},
				volume: volume
			},
			methods() {
				return {
					main: async () => {
						const id = new URL(window.location.href).searchParams.get('id');
						if (!id) {
							return;
						}
						if (state.studying && id === state.studyingId) {
							return;
						}

						state.studyingId = id;
						state.studying = true;

						await waitForLoad();

						setTimeout(() => {
							// 删除是否继续学习的弹窗
							$el('.el-message-box__wrapper')?.remove();
							$el('.v-modal')?.remove();
						}, 3000);

						await waitForLoad();

						const courseInfo = await start();

						if (!courseInfo) {
							$console.error('获取课程信息失败，请跟作者反馈。');
							return;
						}
						$message.success({ content: '开始学习：' + courseInfo.fileType + '-' + courseInfo.name });
						$console.info('开始学习：' + +courseInfo.fileType + '-' + courseInfo.name);
						if (['ppt', 'doc', 'pptx', 'docx', 'pdf', 'txt'].some((i) => courseInfo.fileType === i)) {
							await watchFile();
						} else if (['video', 'audio', 'mp4', 'mp3', 'flv'].some((i) => courseInfo.fileType === i)) {
							if ($el('.guide')?.innerHTML.includes('很抱歉，您的浏览器不支持播放此类文件')) {
								$console.error(`任务点 ${courseInfo.name}，不支持播放。`);
							} else {
								await watchMedia(this.cfg.volume);
							}
						} else if (['png', 'jpg'].some((i) => courseInfo.fileType === i)) {
							$console.info(`已查看图片任务点 ${courseInfo.name}，即将跳过。`);
						} else {
							$console.error(`未知的任务点 ${courseInfo.name}，类型 ${courseInfo.fileType}，请跟作者进行反馈。`);
						}
						$console.info('任务点结束，三秒后下一章');
						await $.sleep(3000);
						await next();
					}
				};
			}
		}),
		work: new Script({
			matches: work_pages,
			name: '✍️ 作业考试脚本',
			namespace: 'zjy.work.main',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'请手动进入作业考试页面才能使用自动答题。'
					]).outerHTML
				}
			},
			methods() {
				return {
					main: async () => {
						if (isWork || isExam) {
							await waitForQuestions();

							commonWork(this, {
								workerProvider: (opt) => workOrExam(isWork ? 'work' : 'exam', opt)
							});
						}
					}
				};
			}
		})
	}
});

async function watchMedia(volume: number) {
	const media = await waitForMedia();
	media.volume = volume;
	const success = await playMedia(() => media.play());
	if (!success) {
		return;
	}

	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(() => {
			if (media.ended) {
				clearInterval(interval);
				resolve();
			} else if (media.paused) {
				media.play();
			}
		}, 1000);
	});
}

async function watchFile() {
	const vue = $el('.el-carousel')?.__vue__;
	if (!vue) {
		return;
	}
	for (let index = 0; index < vue.items.length; index++) {
		await $.sleep(3000);
		vue.next();
	}
}

async function start(): Promise<CourseType | undefined> {
	const vue = $el('.guide')?.__vue__;
	const info = vue?.courseList?.id ? vue?.courseList : vue?.designData;
	if (info?.id !== undefined) {
		return info;
	} else {
		return undefined;
	}
}

function getNextObject() {
	return $el('.guide')?.__vue__?.nextObj;
}

async function next() {
	const nextObject = getNextObject();
	const id = new URL(window.location.href).searchParams.get('id');
	console.log(nextObject);

	if (id && nextObject?.id !== undefined) {
		// 跳过讨论
		if (['测验', '讨论'].some((i) => nextObject.fileType === i)) {
			const res = await getCourseInfo(nextObject.id);
			$console.info(`下个任务点为${nextObject.fileType}，即将跳过`);
			await $.sleep(3000);
			window.location.href = window.location.href.replace(id, res.data.next.id);
		} else {
			$el('.preOrNext .next .el-link')?.click();
		}
	} else {
		$message.success({
			duration: 0,
			content: '全部任务已完成。'
		});
		$console.info('全部任务已完成。');
		CommonProject.scripts.settings.methods.notificationBySetting('全部任务点已完成！', {
			duration: 0,
			extraTitle: '职教云学习脚本'
		});
		state.studying = false;
	}
}

async function waitForLoad() {
	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(() => {
			if ($el('.guide')?.__vue__ !== undefined) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
}

/**
 * 等待试卷作业加载
 */
async function waitForQuestions() {
	return new Promise<void>((resolve, reject) => {
		const interval = setInterval(() => {
			if ($el('.subjectList') !== undefined) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
}

function workOrExam(
	type: 'work' | 'exam',
	{ answererWrappers, period, thread, answerSeparators, answerMatchMode }: CommonWorkOptions
) {
	$message.info({ content: '开始作业' });
	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'zjy'
	});

	const titleTransform = (titles: (HTMLElement | undefined)[]) => {
		return titles
			.filter((t) => t?.innerText)
			.map((t) => t?.innerText)
			.join(',');
	};

	const worker = new OCSWorker({
		root: '.subjectDet',
		elements: {
			title: type === 'work' ? 'h2,h3,h4,h5,h6' : '.titleTest span:not(.xvhao)',
			options: '.optionList div , .tkInput .el-input, .tkInput .el-textarea'
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
						options: ctx.elements.options.map((o) => o.innerText).join('\n')
					});
				});
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},
		work: {
			type(ctx) {
				const options = ctx.elements.options;

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
					: options.some((o) => o.querySelector('[type="text"]')) || options.some((o) => o.querySelector('textarea'))
					? 'completion'
					: undefined;
			},
			/** 自定义处理器 */
			handler(type, answer, option, ctx) {
				if (type === 'judgement' || type === 'single' || type === 'multiple') {
					// 这里只用判断多选题是否选中，如果选中就不用再点击了，单选题是 radio，所以不用判断。
					if (option.querySelector('input')?.checked !== true) {
						option.querySelector('label')?.click();
					}
				} else if (type === 'completion' && answer.trim()) {
					const text = option.querySelector<HTMLInputElement>('input[type="text"]');
					const textarea = option.querySelector<HTMLTextAreaElement>('textarea');
					if (text) {
						text.value = answer;
						text.dispatchEvent(new Event('input', { bubbles: true }));
					} else if (textarea) {
						textarea.value = answer;
						textarea.dispatchEvent(new Event('input', { bubbles: true }));
					}
				}
			}
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
		.doWork({ enable_debug: true })
		.then(() => {
			$message.info({ content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
			worker.emit('done');
		})
		.catch((err) => {
			$message.error({ content: `作业/考试失败: ${err}`, duration: 0 });
		});

	return worker;
}

function getCourseInfo(id: string) {
	return fetch('https://zyk.icve.com.cn/prod-api/teacher/courseContent/' + id, {
		headers: {
			accept: 'application/json, text/plain, */*',
			authorization: 'Bearer ' + document.cookie.match(/Token=([^;]+)/)?.[1] ?? ''
		},
		method: 'GET'
	}).then((res) => res.json());
}
