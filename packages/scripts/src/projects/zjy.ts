import {
	$,
	$$el,
	$creator,
	$el,
	$gm,
	$message,
	$model,
	$script,
	$store,
	Project,
	Script,
	domSearch
} from '@ocsjs/core';
import { $console } from './background';
import { playMedia } from '../utils';
import { volume } from '../utils/configs';

const state = {
	loading: false,
	finish: false,
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined
	}
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
		studyDispatcher: new Script({
			name: '🧑‍💻 课程学习',
			url: [['课程页面', 'zjy2.icve.com.cn/study/process/process']],
			namespace: 'zjy.study.dispatcher',
			configs: {
				notes: {
					defaultValue: '请点击任意章节进行学习。'
				}
			}
		}),
		/** 因为阅读脚本跨域，所以这里通过监听页面数据进行回调反馈，通过修改数据，触发学习页面的回调。 */
		read: new Script({
			name: '阅读脚本',
			hideInPanel: true,
			url: [['ppt页面', 'file.icve.com.cn']],
			async oncomplete() {
				await $.sleep(10 * 1000);

				console.log('reading', true);
				$store.setTab('reading', true);
				const fixTime = $gm.unsafeWindow._fixTime || 10;

				while (true) {
					const { gc, Presentation } = $gm.unsafeWindow;

					const { TotalSlides } = Presentation.GetContentDetails();
					if (gc < TotalSlides) {
						console.log(gc, TotalSlides);
						await $.sleep(1000);
						// @ts-ignore
						Presentation.Next();
					} else {
						break;
					}
				}
				$console.info(`PPT播放完成 ${fixTime * 2} 秒后将自动切换下一个任务。`);
				await $.sleep(1000 * fixTime * 2);
				$store.setTab('reading', false);
			}
		}),
		study: new Script({
			name: '🧑‍💻 学习脚本',
			url: [['学习页面', 'zjy2.icve.com.cn/common/directory/directory.html']],
			namespace: 'zjy.study.main',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'如果脚本卡死或者您不想学习，可以点击任意章节继续进行学习。',
						'提示：职教云无法使用倍速。'
					]).outerHTML
				},
				volume: volume
			},
			async onstart() {
				$script.pin(this);

				this.onConfigChange('volume', (volume) => {
					if (state.study.currentMedia) {
						state.study.currentMedia.volume = volume;
					}
				});
			},
			async oncomplete() {
				await $.sleep(1000);
				// 展开目录
				const sildeDirectory = $el('.sildeDirectory');
				sildeDirectory?.click();
				// 收回目录
				await $.sleep(1000);
				sildeDirectory?.click();

				/** 获取当前节点 */
				const getActiveNode = () => $el('li[data-cellid].active');
				/** 获取当前的列表 */
				const getActiveNodeList = () => getActiveNode()?.parentElement?.parentElement;
				/** 获取当前的模块 */
				const getActiveModel = () => getActiveNodeList()?.parentElement?.parentElement;
				/** 获取下一个节点 */
				const getNextNode = async () => {
					// 获取当前节点
					const active = getActiveNode();

					if (active) {
						// 获取在同一列表下的下一个任务点
						const next = $el(`li[data-upcellid="${active.dataset.cellid}"]`);

						if (next) {
							return next;
						}
						// 如果没有说明当前列表已经完成
						else {
							// 获取当前列表
							const list = getActiveNodeList();

							if (list) {
								const nextList = $el(`li[data-uptopicid="${list.dataset.topicid}"]`);

								if (nextList) {
									// 如果还未加载资源
									if ($el('.topicCellContainer', nextList)?.children.length === 0) {
										$el('.topicData', nextList)?.click();
										// 等待加载
										await $.sleep(5000);
									}
									return $el('li[data-upcellid="0"]', nextList);
								}
								// 如果没有说明当前模块已经完成
								else {
									// 获取当前模块
									const _module = getActiveModel();

									if (_module) {
										const modules = $$el('[data-moduleid]');
										let nextModule: HTMLElement | undefined;

										for (let index = 0; index < modules.length; index++) {
											if (modules[index] === _module) {
												nextModule = modules[index + 1];
												break;
											}
										}

										if (nextModule) {
											// 如果还未加载资源
											if ($el('.moduleTopicContainer', nextModule)?.children.length === 0) {
												$el('.moduleData', nextModule)?.click();
												// 等待加载
												await $.sleep(5000);
											}

											const nextList = $el('li[data-uptopicid="0"]', nextModule);
											if (nextList) {
												// 如果还未加载资源
												if ($el('.topicCellContainer', nextList)?.children.length === 0) {
													$el('.topicData', nextList)?.click();
													// 等待加载
													await $.sleep(5000);
												}
												return $el('li[data-upcellid="0"]', nextList);
											} else {
												//
											}
										} else {
											//
										}
									} else {
										//
									}
								}
							} else {
								//
							}
						}
					}
				};

				const studyLoop = async () => {
					const studyNow = $el('#studyNow');
					if (studyNow) {
						studyNow.click();
					}
					// 等待点击
					await $.sleep(3000);
					try {
						const active = getActiveNode();
						if (active) {
							await start(active.innerText || '未知任务', document);
							const next = await getNextNode();
							if (next) {
								next.click();
								await studyLoop();
							} else {
								console.log('检测不到下一章任务点，请检查是否已经全部完成。');
								$model('alert', {
									content: '检测不到下一章任务点，请检查是否已经全部完成。'
								});
							}
						}
					} catch (error) {
						$console.error('未知错误：', error);
					}
				};

				await studyLoop();
			}
		})
	}
});

/**
 * 创建弹出窗口
 * @param url 地址
 * @param winName 窗口名
 * @param width 宽
 * @param height 高
 * @param scrollbars 是否有滚动条
 * @param resizable 是否可调整大小
 */
export function createPopupWindow(
	url: string,
	name: string,
	opts: {
		width: number;
		height: number;
		scrollbars: boolean;
		resizable: boolean;
	}
) {
	const { width, height, scrollbars, resizable } = opts;
	const LeftPosition = screen.width ? (screen.width - width) / 2 : 0;
	const TopPosition = screen.height ? (screen.height - height) / 2 : 0;
	const settings =
		'height=' +
		height +
		',width=' +
		width +
		',top=' +
		TopPosition +
		',left=' +
		LeftPosition +
		',scrollbars=' +
		(scrollbars ? 'yes' : 'no') +
		',resizable=' +
		(resizable ? 'yes' : 'no');

	return window.open(url, name, settings);
}

/**
 * 永久固定显示视频进度
 */
export function fixedVideoProgress(doc: Document) {
	const bar = $el('.jw-controlbar', doc);
	if (state.study.currentMedia && bar) {
		bar.style.display = 'block';
		bar.style.visibility = 'visible';
		bar.style.opacity = '1';
	}
}

function start(name: string, doc: Document) {
	return new Promise<void>((resolve, reject) => {
		(async () => {
			const fixTime = $gm.unsafeWindow._fixTime || 10;
			const { ppt, video, iframe, link, docPlay, nocaptcha } = domSearch(
				{
					// ppt
					ppt: '.page-bar',
					// ppt
					iframe: 'iframe',
					// 视频
					video: 'video',
					// 链接
					link: '#externalLinkDiv',
					// 图文/图片
					docPlay: '#docPlay',
					// 验证码
					nocaptcha: '#waf_nc_block,#nocaptcha'
				},
				doc
			);

			console.log({ doc, ppt, video, iframe, link, docPlay, nocaptcha });

			if (nocaptcha && nocaptcha.style.display !== 'none') {
				$message('warn', { content: '请手动滑动验证码。' });
			} else if (video) {
				// 如果 iframe 不存在则表示只有视频任务，否则表示PPT任务正在运行
				$console.info('开始播放:', name);
				const _video = video as HTMLVideoElement;
				const jp = $gm.unsafeWindow.jwplayer($gm.unsafeWindow.$('.video_container').attr('id'));

				video.onended = async () => {
					$console.info('视频结束：', name);
					await $.sleep(3000);
					resolve();
				};
				// 固定进度
				fixedVideoProgress(doc);
				// 设置音量
				_video.volume = 0;

				if (_video.paused) {
					playMedia(() => jp.play());
				}
			} else if (iframe && (iframe as HTMLIFrameElement).src.startsWith('https://file.icve.com.cn')) {
				// 监听阅读任务执行完毕
				const id =
					(await $store.addTabChangeListener('reading', (reading) => {
						if (reading === false) {
							$store.removeTabChangeListener('reading', id);
							resolve();
						}
					})) || 0;
			} else if (ppt) {
				$console.info('开始播放: ', name);
				const { pageCount, pageCurrentCount, pageNext } = domSearch({
					pageCount: '.MPreview-pageCount',
					pageNext: '.MPreview-pageNext',
					pageCurrentCount: '.MPreview-pageInput'
				});
				if (pageCurrentCount && pageCount && pageNext) {
					// @ts-ignore
					let count = parseInt(pageCurrentCount.value);
					const total = parseInt(pageCount.innerText.replace('/', '').trim() || '0');

					while (count <= total) {
						// @ts-ignore
						pageNext.click();
						await $.sleep(1000);
						count++;
					}
					$console.info(`${name} 播放完成, ${fixTime * 2} 秒后将自动切换下一个任务。`);
					await $.sleep(1000 * fixTime * 2);
					resolve();
				} else {
					$message('error', { content: '未找到PPT进度，请刷新重试或者跳过此任务。' });
				}
			} else if ((link && link.style.display !== 'none') || docPlay) {
				$console.info(`${name} 查看完成，${fixTime}秒后下一个任务`);
				// 等待学习任务进行记录再下一章
				await $.sleep(1000 * fixTime + 1);
				resolve();
			} else {
				$console.error(`${name} : 未知的课件类型，请联系作者进行反馈，${fixTime}秒后下一个任务。`);
				await $.sleep(1000 * fixTime + 1);
				resolve();
			}
		})();
	});
}
