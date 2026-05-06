import { $, $elements, Project, Script, $message, $modal, $el, $ui } from 'easy-us';
import { $msg, playMedia } from '../utils';
import { request } from '@ocsjs/core';
import { restudy, volume } from '../utils/configs';
import { waitForElement } from '../utils/study';
import { CommonProject } from './common';
import { commonWork } from '../utils/work';
import { yktExamWork } from './yuketang.exam';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
};

export const YKTProject = Project.create({
	name: '雨课堂',
	domains: ['yuketang.cn', 'xuetangx.com'],
	scripts: {
		guide: new Script({
			name: '🖥️ 使用提示',
			matches: [['雨课堂课程列表', 'https://www.yuketang.cn/v2/web/index']],
			namespace: 'yuketang.study.guide',
			configs: {
				notes: {
					defaultValue: '请点击课程里面任意章节，进入学习。'
				}
			}
		}),
		global: new Script({
			name: '全局脚本',
			matches: [['全部界面', /.*/]],
			hideInPanel: true,
			onstart(...args) {
				// 雨课堂反混淆，雨课堂修改了 attachShadow 方法
				// 这里重写removeChild方法，防止删除wrapper元素
				const _removeChild = Element.prototype.removeChild;
				Element.prototype.removeChild = function (e) {
					if (e.nodeName === 'DIV') {
						if ($elements.wrapper && e === ($elements.wrapper as Node)) {
							($elements.wrapper as HTMLElement).removeAttribute('style');
							return e;
						}
					}
					_removeChild.call(this, e);
					return e;
				};
			}
		}),
		ai: new Script({
			name: '🤖 AI学伴',
			matches: [['AI学伴课程界面', 'https://www.yuketang.cn/ai-workspace/lms-graph']],
			namespace: 'yuketang.study.ai',
			configs: {
				notes: {
					defaultValue: '请点击任意章节，进入学习。'
				},
				restudy: restudy,
				reloadWhenError: {
					label: '黑屏自动刷新',
					attrs: { title: '视频黑屏或者检测不到视频时自动刷新页面', type: 'checkbox' },
					defaultValue: true
				},
				volume: volume,
				playbackRate: {
					label: '视频倍速',
					tag: 'select',
					defaultValue: 1,
					options: [
						['1', '1 x'],
						['1.25', '1.25 x'],
						['1.5', '1.5 x'],
						['2.0', '2.0 x']
					]
				}
			},
			async oncomplete() {
				await $.sleep(3000);
				CommonProject.scripts.render.methods.pin(this);

				// 监听音量
				this.onConfigChange('volume', (curr) => {
					state.study.currentMedia && (state.study.currentMedia.volume = curr);
				});

				// 监听速度
				this.onConfigChange('playbackRate', (curr) => {
					state.study.currentMedia && (state.study.currentMedia.playbackRate = curr);
				});

				// // 展开5次章节，确保所有章节都被展开
				const max_level = 5;
				for (let i = 0; i < max_level; i++) {
					document.querySelectorAll<HTMLElement>('.expand-icon:not(.is-expanded )').forEach((el) => el.click());
					await $.sleep(100);
				}

				const getJobs = () => Array.from(document.querySelectorAll<HTMLElement>('div.leaf-item'));
				const getJobName = () =>
					document.querySelector('.leaf-item.is-active .leaf-item-title')?.textContent || '未知任务点';
				const getNextJob = () => {
					let jobs = getJobs();
					const active_index = jobs.findIndex((job) => job.classList.contains('is-active'));

					// 不是复习模式，过滤掉已经完成的
					if (!this.cfg.restudy) {
						jobs = jobs.splice(active_index);
						jobs = jobs.filter((el) => !el.querySelector('.icon-yuanquangou'));
						jobs = jobs.filter((el) => !(el.querySelector('.leaf-item-tag')?.textContent || '').includes('自测'));
					}
					const new_active_index = jobs.findIndex((job) => job.classList.contains('is-active'));
					return jobs[new_active_index + 1];
				};

				try {
					$msg.info('等待任务加载中...');
					await waitForElement('.detail-container', {
						timeout_seconds: 10 * 1000
					});
					$msg.info('即将开始自动学习');
				} catch (e) {
					$message.error('元素加载失败，请刷新界面重试。');
				}

				const study = async () => {
					try {
						if ($el('.detail-container video')) {
							$msg.info('即将开始视频学习：' + getJobName());
							await watch({
								volume: this.cfg.volume,
								playbackRate: this.cfg.playbackRate
							});
							$msg.success('视频学习完成');
							await $.sleep(3000);
						}

						if ($el('.detail-container .problem-common')) {
							$msg.warn('自测任务暂未支持，请联系作者反馈：' + getJobName());
							await $.sleep(3000);
						}
					} catch (e) {
						$message.error(`当前任务点无法完成，即将跳转下一节（${e}）`);
					}
					const next = getNextJob();
					if (!next) {
						return $modal.alert({
							content: '检测到当前视频全部播放完毕，如果还有未完成的视频请刷新重试，或者打开复习模式。'
						});
					}
					next.click();
					await $.sleep(200);
					next.scrollIntoView({ behavior: 'smooth', block: 'center' });
					await $.sleep(3000);
					study();
				};

				study();
			}
		}),
		work: new Script({
			name: '✍️ 作业/考试脚本',
			matches: [['考试页面', 'examination.xuetangx.com/exam']],
			namespace: 'yuketang.work',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'请手动进入作业考试页面才能使用自动答题。',
						'自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主。'
					]).outerHTML
				}
			},
			oncomplete() {
				$message.warn({ content: '自动答题时请勿切换题目，否则可能导致重复搜题或者脚本卡主。', duration: 0 });
				commonWork(this, {
					workerProvider: yktExamWork
				});
			}
		}),
		// TODO 作业
		'font-decrypt': new Script({
			name: '🔤 字体解密',
			matches: [['AI伴学自测界面', '/v2/web/iframe-self-test']],
			async oncomplete() {
				const mapping = await loadFontMapping();

				console.log(mapping);

				const els = Array.from(document.querySelectorAll('.xuetangx-com-encrypted-font'));
				for (const el of els) {
					// 替换
					for (const _char in mapping) {
						if (el.textContent?.includes(_char)) {
							el.textContent = el.textContent.replace(new RegExp(_char, 'g'), mapping[_char]);
						}
					}
				}

				console.log('字体替换完成');
			}
		})
	}
});

async function loadFontMapping() {
	try {
		$msg.info('正在解析字体');
		return await request('https://cdn.ocsjs.com/resources/font/yuketang_font_map.json', {
			type: 'GM_xmlhttpRequest',
			method: 'get',
			responseType: 'json'
		});
	} catch (err) {
		$msg.error('载繁体字库加载失败，请刷新页面重试：' + String(err));
	}
}

/**
 * 观看视频
 * @param setting
 * @returns
 */
async function watch(options: { volume: number; playbackRate: number }) {
	const set = async () => {
		// 上面操作会导致元素刷新，这里重新获取视频
		await $.sleep(1000);
		const media = (await waitForElement('.detail-container video', {
			timeout_seconds: 10 * 1000
		})) as HTMLMediaElement;
		console.log('media', media);
		await $.sleep(1000);
		state.study.currentMedia = media;

		if (media) {
			// 如果已经播放完了，则重置视频进度
			media.currentTime = 1;
			// 音量
			media.volume = options.volume;
			media.playbackRate = options.playbackRate;
		}
		return state.study.currentMedia;
	};
	$message.info('开始播放');
	const video = await set();

	if (!video) {
		throw new Error('video not found!');
	}

	return new Promise<void>((resolve, reject) => {
		const videoCheckInterval = setInterval(async () => {
			// 如果视频元素无法访问，证明已经切换了视频
			if (video?.isConnected === false) {
				clearInterval(videoCheckInterval);
				$message.info({ content: '检测到视频切换中...' });
				/**
				 * 元素无法访问证明用户切换视频了
				 * 所以不往下播放视频，而是重新播放用户当前选中的视频
				 */
				resolve();
			}
		}, 3000);

		playMedia(() => video?.play());

		video.onpause = async () => {
			if (!video?.ended) {
				await $.sleep(1000);
				video?.play();
			}
		};

		video.onended = () => {
			clearInterval(videoCheckInterval);
			// 正常切换下一个视频
			resolve();
		};
	});
}
