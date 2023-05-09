import {
	$,
	$$el,
	$creator,
	$el,
	$gm,
	$message,
	$modal,
	$store,
	DefaultWork,
	OCSWorker,
	Project,
	Script,
	defaultAnswerWrapperHandler,
	defaultQuestionResolve,
	domSearch
} from '@ocsjs/core';
import { $console } from './background';
import { CommonWorkOptions, playMedia } from '../utils';
import { volume } from '../utils/configs';
import { CommonProject } from './common';
import { commonWork, optimizationElementWithImage, removeRedundantWords, simplifyWorkResult } from '../utils/work';

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
			name: '🖥️ 课程学习',
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
			name: '🖥️ 学习脚本',
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
				CommonProject.scripts.render.methods.pin(this);

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
				const getActiveModule = () => getActiveNodeList()?.parentElement?.parentElement;
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
									const _module = getActiveModule();

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
								$modal('alert', {
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
		}),
		work: new Script({
			name: '✍️ 作业考试脚本',
			url: [
				['作业页面', 'zjy2.icve.com.cn/study/homework/do.html'],
				['考试页面', 'zjy2.icve.com.cn/study/onlineExam/preview.html']
			],
			namespace: 'zjy.work-and-exam',
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'请手动进入作业/考试页面才能使用自动答题。'
					]).outerHTML
				}
			},
			async oncomplete() {
				commonWork(this, {
					workerProvider: workAndExam
				});
			}
		})
	}
});

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

/**
 * 章节测验
 */
function workAndExam({ answererWrappers, period, redundanceWordsText, thread }: CommonWorkOptions) {
	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'zjy'
	});

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
		root: '.e-q-body',
		elements: {
			title: '.e-q-q',
			options: 'li.e-a'
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 0,
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

		work: async (ctx) => {
			const { elements, searchInfos, root } = ctx;
			const questionTypeNum = parseInt(root.getAttribute('data-questiontype') || '-1');
			const type = getQuestionType(questionTypeNum);

			if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
				const handler: DefaultWork<any>['handler'] = (type, answer, option, ctx) => {
					if (type === 'judgement' || type === 'single' || type === 'multiple') {
						if (option.classList.contains('checked')) {
							// 跳过
						} else {
							option.click();
						}
					} else if (type === 'completion' && answer.trim()) {
						const text = option.querySelector('textarea');
						if (text) {
							text.value = answer;
						}
					}
				};

				return await defaultQuestionResolve(ctx)[type](
					searchInfos,
					elements.options.map((option) => optimizationElementWithImage(option)),
					handler
				);
			}

			return { finish: false };
		},
		/** 完成答题后 */
		async onResultsUpdate(res, curr) {
			CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, titleTransform));
		},
		onResolveUpdate(res) {
			if (res.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(simplifyWorkResult([res], titleTransform));
			}
			CommonProject.scripts.workResults.methods.updateWorkState(worker);
		}
	});

	worker
		.doWork()
		.then(() => {
			$message('info', { content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
			worker.emit('done');
		})
		.catch((err) => {
			$message('error', { content: `作业/考试失败: ${err}`, duration: 0 });
		});

	return worker;
}

function getQuestionType(questionTypeNum: number): 'completion' | 'multiple' | 'judgement' | 'single' | 'unknown' {
	return questionTypeNum === 1
		? 'single'
		: questionTypeNum === 2
		? 'multiple'
		: questionTypeNum === 3
		? 'judgement'
		: questionTypeNum === 4
		? 'completion'
		: questionTypeNum === 4
		? 'completion'
		: 'unknown';
}
