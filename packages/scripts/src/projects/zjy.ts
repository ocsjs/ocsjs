import { $, $creator, $el, $message, Project, Script } from '@ocsjs/core';
import { volume } from '../utils/configs';
import { waitForMedia } from '../utils/study';
import { playMedia } from '../utils';
import { $console } from './background';

type CourseType = {
	fileType: string;
	id: string;
	name: string;
};

const state = {
	studying: false,
	studyingId: ''
};

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
	domains: ['icve.com.cn', 'zjy2.icve.com.cn'],
	studyProject: true,
	scripts: {
		guide: new Script({
			name: '🖥️ 使用提示',
			url: [['课程页面', 'zjy2.icve.com.cn/study']],
			namespace: 'zjy.study.guide',
			configs: {
				notes: {
					defaultValue: '请点击任意章节，进入学习。'
				}
			}
		}),

		study: new Script({
			name: '✍️ 课程学习',
			url: [['学习页面', 'zjy2.icve.com.cn/study']],
			namespace: 'zjy.study.main',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						['如果脚本卡死或者您不想学习，', '可以点击其他任意章节继续进行学习。'],
						'提示：职教云无法使用倍速。'
					]).outerHTML
				},
				volume: volume
			},
			methods() {
				return {
					main: async () => {
						if (!window.location.href.includes('zjy2.icve.com.cn/study/coursePreview/spoccourseIndex/courseware')) {
							return;
						}

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

						if (!courseInfo) return;
						$message('success', { content: '开始学习：' + courseInfo.name });
						$console.info('开始学习：' + courseInfo.name);
						if (courseInfo.fileType === 'ppt' || courseInfo.fileType === 'doc') {
							await watchFile();
						} else if (courseInfo.fileType === 'video' || courseInfo.fileType === 'audio') {
							if ($el('.guide')?.innerHTML.includes('很抱歉，您的浏览器不支持播放此类文件')) {
								$console.error(`任务点 ${courseInfo.name}，不支持播放。`);
							} else {
								await watchMedia(this.cfg.volume);
							}
						} else {
							$console.error(`未知的任务点 ${courseInfo.name}，请跟作者进行反馈。`);
						}
						$console.info('任务点结束，三秒后下一章');
						await $.sleep(3000);
						await next();
					}
				};
			},
			/**
			 *
			 * 新版职教云采用VUE技术路由，所以这里需要使用 onhistorychange 监听路由变化，然后脚本中自行判断相应的路由执行情况
			 */
			onhistorychange(type) {
				if (type === 'push') {
					this.methods.main();
				}
			},
			oncomplete() {
				this.methods.main();
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
	const info = $el('.guide')?.__vue__?.courseList;
	if (info?.id !== undefined) {
		return info;
	} else {
		return undefined;
	}
}

async function next() {
	const nextObj = $el('.guide')?.__vue__?.nextObj;
	if (nextObj?.id !== undefined) {
		$el('.preOrNext .next .el-link')?.click();
	} else {
		$message('success', {
			duration: 0,
			content: '全部任务已完成。'
		});
		$console.info('全部任务已完成。');
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
