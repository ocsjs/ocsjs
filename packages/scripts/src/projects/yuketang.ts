import { $, $elements, Project, Script, $message, $modal, $el, h, cors, $ui } from 'easy-us';
import { $msg, playMedia } from '../utils';
import { request } from '@ocsjs/core';
import { restudy, volume } from '../utils/configs';
import { waitForElement } from '../utils/study';
import { CommonProject } from './common';
import { $console } from './background';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
};
type Leaf = {
	id: number;
	chapter_id: number;
	name: string;
	/**
	 * 0-普通章节
	 * 4-讨论
	 * 5-期末考试
	 * 6-作业
	 * 8-PPT
	 */
	leaf_type: 0 | 5;
	leaf_list?: Leaf[];
};
type ChapterList = {
	fold: boolean;
	id: number;
	name: string;
	section_leaf_list: Leaf[];
};

const changeCurrentLeafJobName = cors.defineTopFunction((name) => {
	$elements.currentScriptPanel?.body.replaceChildren(
		h('div', { className: 'card', style: { marginTop: '12px' } }, ['当前正在学习：' + name])
	);
});

export const YKTProject = Project.create({
	name: '雨课堂',
	domains: ['yuketang.cn'],
	scripts: {
		guide: new Script({
			name: '🖥️ 使用提示',
			matches: [
				['雨课堂课程列表', '/v2/web/index'],
				['学习内容界面', '/v2/web/studentLog']
			],
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
		v2_study: new Script({
			name: '📚 课程学习',
			matches: [
				['课程学习界面', '/v2/web/studentLog'],
				['课程列表', /pro\/lms\/.*\/.*\/studycontent/],
				['视频界面', 'v2/web/xcloud/video-student'],
				['视频讨论界面', /v2\/web\/lms\/.*\/forum/]
			],
			namespace: 'yuketang.study.v2',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'请点击任意小节，脚本会自动运行，并自动下一节。',
						'修改音量、倍速后请刷新页面使设置生效。',
						'⚠️ 章节测试自动答题还在开发中，请耐心等待',
						'⚠️ 手动搜题可使用官方题库的在线搜题功能： tk.enncy.cn '
					]).outerHTML
				},
				currentLeafIndex: {
					defaultValue: -1
				},
				currentStudyUrl: {
					defaultValue: ''
				},
				goNext: {
					defaultValue: false
				},
				auto: {
					label: '自动学习',
					attrs: { type: 'checkbox', title: '自动寻找未完成章节、或者自动下一节学习' },
					defaultValue: false
				},
				restudy: restudy,
				volume: volume,
				playbackRate: {
					label: '视频倍速',
					tag: 'select',
					defaultValue: 1,
					options: [
						['1', '1 x'],
						['1.25', '1.25 x'],
						['1.5', '1.5 x'],
						['2', '2.0 x']
					]
				},
				discussMode: {
					label: '讨论任务模式',
					tag: 'select',
					defaultValue: 'random' as 'random' | 'first' | 'none',
					options: [
						['random', '随机评论'],
						['first', '截取第一条评论'],
						['none', '不进行评论']
					]
				}
			},
			onhistorychange(type, ...args) {
				if (type === 'push') {
					this.oncomplete?.();
				}
			},
			async oncomplete() {
				CommonProject.scripts.render.methods.pin(this);

				if (document.location.pathname.includes('/v2/web/studentLog')) {
					const tab = await waitForElement('#tab-content');
					tab?.click();
					return;
				}

				if (document.location.pathname.includes('v2/web/xcloud/video-student')) {
					try {
						await waitForElement(
							[
								// 正常视频
								'#video-box',
								// AI学伴视频（会生成一个数字人物口型解说在视频旁）
								'.digital-human-video-element-selector'
							].join(',')
						);
						await $.sleep(2000);
						await v2_watch({
							volume: this.cfg.volume,
							playbackRate: this.cfg.playbackRate
						});
						this.cfg.goNext = true;
						$message.info('视频学习完成，即将自动进入下一节');
						setTimeout(() => {
							location.href = this.cfg.currentStudyUrl;
						}, 3000);
					} catch (e) {
						$msg.error({ content: String(e), duration: 0 });
					}
					return;
				}

				if (/v2\/web\/lms\/.*\/forum/.test(document.location.pathname)) {
					const new_discuss_list = await waitForElement('.new_discuss_list');
					const textarea = (await waitForElement('textarea.el-textarea__inner')) as HTMLTextAreaElement;
					if (!new_discuss_list || !textarea) {
						$message.error('讨论区元素加载失败，请刷新界面重试。');
						return;
					}

					const discusses = Array.from(new_discuss_list.querySelectorAll('.cont_detail'))
						.map((el) => el.textContent || '')
						.filter((text) => text.trim() !== '');

					console.log(discusses);

					if (this.cfg.discussMode === 'random') {
						const random_discuss = discusses[Math.floor(Math.random() * discusses.length)];
						textarea.value = random_discuss;
					} else if (this.cfg.discussMode === 'first') {
						textarea.value = discusses[0] || '';
					} else {
						$message.info('已设置为不进行评论，跳过评论步骤。');
						return;
					}

					// 触发输入事件
					textarea.dispatchEvent(new Event('input', { bubbles: true }));

					const submit_btn = await waitForElement('button.submitComment');
					submit_btn?.click();
					this.cfg.goNext = true;
					$message.success('评论提交成功，即将自动进入下一节');
					setTimeout(() => {
						location.href = this.cfg.currentStudyUrl;
					}, 3000);
					return;
				}

				await waitForElement('.chapter-list');
				await $.sleep(2000);

				const vue_data = document.querySelector<any>('.study-content__container').__vue__;
				const chapter_list: ChapterList[] = JSON.parse(JSON.stringify(vue_data.chapter_list || []));
				const leaf_schedules: Record<string, number> = vue_data.leaf_schedules || [];

				const leaf_list: Leaf[] = [];

				// 扁平化章节列表
				while (chapter_list.length > 0) {
					const chapter = chapter_list.shift();
					if (!chapter) break;
					while (chapter.section_leaf_list.length > 0) {
						const leaf = chapter.section_leaf_list.shift();
						if (!leaf) break;

						if (leaf.leaf_list) {
							leaf_list.push(...leaf.leaf_list);
						} else {
							leaf_list.push(leaf);
						}
					}
				}

				const getJobName = (leaf: HTMLElement) => leaf.querySelector('.leaf-title')?.textContent || '未知章节';

				const leafs = Array.from(document.querySelectorAll<HTMLElement>('.leaf-detail'));
				for (let index = 0; index < leafs.length; index++) {
					const leaf = leafs[index];
					leaf.addEventListener('click', () => {
						this.cfg.goNext = false;
						this.cfg.currentLeafIndex = index;
						this.cfg.currentStudyUrl = top?.document.location.href || '';
						const name = getJobName(leaf);
						changeCurrentLeafJobName(name);
						$console.log('正在学习：' + name);
					});
				}

				// 定位到当前小节
				const currentLeaf = leafs[this.cfg.currentLeafIndex];
				if (currentLeaf) {
					currentLeaf.scrollIntoView({ behavior: 'smooth', block: 'center' });
					changeCurrentLeafJobName(getJobName(currentLeaf));
				}

				const isLeafFinished = (leaf_index: number) => {
					const leaf_id = leaf_list[leaf_index]?.id;
					if (!leaf_id) return false;
					const schedule = leaf_schedules[leaf_id];
					return schedule === 1;
				};

				const getNext = () => {
					let index = this.cfg.currentLeafIndex;
					while (index + 1 < leafs.length) {
						index++;
						if (
							['shipin', 'taolun1' /** 'zuoye' */].some((name) =>
								leafs[index]?.querySelector(`.iconfont.icon--${name}`)
							) &&
							!isLeafFinished(index)
						) {
							break;
						}
					}
					return leafs[index];
				};

				if (this.cfg.auto) {
					const next = getNext();
					if (!next) {
						return $modal.alert({
							content: '检测到当前课程全部完成，如果还有未完成的视频请刷新重试，或者打开复习模式。'
						});
					}
					if (this.cfg.goNext) {
						const timeout = setTimeout(() => {
							next.click();
							modal?.remove();
						}, 5000);
						const modal = $modal.confirm({
							content: '5秒后即将自动继续学习：' + getJobName(next),
							cancelButtonText: '取消自动学习',
							duration: 5,
							onCancel() {
								clearTimeout(timeout);
								$message.warn({ content: '已取消自动进入下一节，后续请手动操作进入。', duration: 0 });
							}
						});
					}
				}
			}
		}),
		ai: new Script({
			name: '🤖 AI学伴',
			matches: [['AI学伴课程界面', '/ai-workspace/lms-graph']],
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
							await ai_watch({
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
		// TODO 作业
		'font-decrypt': new Script({
			name: '🔤 字体解密',
			matches: [
				['AI伴学自测界面', '/v2/web/iframe-self-test'],
				['V2学习内容-作业界面', '/v2/web/cloud/student/exercise']
			],
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
async function ai_watch(options: { volume: number; playbackRate: number }) {
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

/**
 * 观看视频
 * @param setting
 * @returns
 */
async function v2_watch(options: { volume: number; playbackRate: number }) {
	const set = async () => {
		await $.sleep(1000);

		const is_digital_human_video = !!document.querySelector('.digital-human-video-element-selector');

		if (is_digital_human_video) {
			// 成绩单里面进AI学伴会直接变成V2版本的视频，可能是雨课堂自身的BUG
			throw new Error('AI学伴视频请在学习内容中进入，不要在成绩单里进入。');
		} else {
			// 这里无法通过直接修改数值来修改倍速和音量，需要调用播放器的接口来修改
			const video_vue_data = document.querySelector<any>('.xtplayer').__vue__;
			video_vue_data.player.options.speed.value = parseFloat(options.playbackRate.toString());
			video_vue_data.player.options.volume.value = options.volume;
			// 应用更改的音量和倍速设置
			video_vue_data.player.init();
		}

		const media = (await waitForElement('video', {
			timeout_seconds: 10 * 1000
		})) as HTMLMediaElement;
		console.log('media', media);
		await $.sleep(1000);
		state.study.currentMedia = media;
		// 重置视频进度
		media.currentTime = 1;
		return state.study.currentMedia;
	};
	$message.info('开始播放');
	const video = await set();

	if (!video) {
		throw new Error('video not found!');
	}

	return new Promise<void>((resolve, reject) => {
		playMedia(() => video?.play());
		video.onpause = async () => {
			if (!video?.ended) {
				await $.sleep(1000);
				video?.play();
			}
		};
		video.onended = () => {
			// 正常切换下一个视频
			resolve();
		};
	});
}
