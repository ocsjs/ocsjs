import { $el, Project, Script, $, $script, $$el, $creator, $model, $message } from '@ocsjs/core';
import { volume } from '../utils/configs';
import { createRangeTooltip, playMedia } from '../utils';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
};

export const ICVEProject = Project.create({
	name: '智慧职教',
	domains: ['icve.com.cn', 'course.icve.com.cn'],
	studyProject: true,
	scripts: {
		study: new Script({
			name: '🧑‍💻 课程学习',
			namespace: 'icve.study.main',
			url: [['课程学习页面', 'course.icve.com.cn/learnspace/learn/learn/templateeight/index.action']],
			configs: {
				notes: {
					defaultValue: $creator.notes([
						['请手动点击任意章节以触发自动学习脚本', '只需点击一次后续无需点击，脚本会自动学习。'],
						[
							'如果视频进入后一直是黑屏，请手动点击播放按钮，',
							'如果还是黑屏，则为该视频无法播放，',
							'请联系智慧职教客服进行询问。'
						]
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
				$script.pin(this);

				await $.sleep(3000);

				this.onConfigChange('volume', (v) => state.study.currentMedia && (state.study.currentMedia.volume = v));
				this.onConfigChange(
					'playbackRate',
					(r) => state.study.currentMedia && (state.study.currentMedia.playbackRate = r)
				);

				const mainContentWin = $el<HTMLIFrameElement>('#mainContent')?.contentWindow as Window & { [x: string]: any };

				if (mainContentWin) {
					const _openLearnResItem: Function = mainContentWin.openLearnResItem;
					mainContentWin.openLearnResItem = async (...args: any[]) => {
						// 调用原函数
						_openLearnResItem.apply(mainContentWin, args);
						await $.sleep(3000);
						await study();
					};
				}

				if (this.cfg.showScrollBar) {
					const bar = $el('.dumascroll_area', mainContentWin.document);
					bar && (bar.style.overflow = 'auto');
				}

				if (this.cfg.expandAll) {
					$$el('.s_sectionlist,.s_sectionwrap', mainContentWin.document).forEach((el) => (el.style.display = 'block'));
				}

				// 任务点
				const jobs = $$el('.item_done_icon:not(.done_icon_show)', mainContentWin.document);

				console.log(jobs);

				/** 学习 */
				const study = async () => {
					const iframe = $el<HTMLIFrameElement>('iframe', mainContentWin.document);
					const win = iframe?.contentWindow;
					if (win) {
						const doc = win.document;
						if (iframe.src.includes('content_video.action')) {
							// 视频
							const video = $el<HTMLVideoElement>('video', doc);
							state.study.currentMedia = video;

							if (video) {
								if (video.ended) {
									video.currentTime = 0;
								}

								video.playbackRate = this.cfg.playbackRate;
								video.volume = this.cfg.volume;

								await new Promise<void>((resolve, reject) => {
									try {
										video.addEventListener('ended', async () => {
											await $.sleep(3000);
											resolve();
										});
										video.addEventListener('pause', async () => {
											if (!video.ended) {
												await $.sleep(1000);
												playMedia(() => video.play());
											}
										});
										// 开始播放
										playMedia(() => video.play());
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

					// 递归调用直到完成为止
					if (jobs.length) {
						const job = jobs.shift();
						// 如果不是当前所处的任务点，则点击，否则可直接开始学习
						if (job) {
							// 这里不要调用 study() !!!，是通过上面回调进行调用 study，这里触发 openLearnResItem 即可
							job.click();
						}
					} else {
						$model('alert', {
							content: '全部任务已完成'
						});
					}
				};
			}
		}),
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
				$script.pin(this);
			}
		})
	}
});
