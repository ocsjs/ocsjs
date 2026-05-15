/** global Ext videojs getTeacherAjax jobs */

import {
	OCSWorker,
	defaultAnswerWrapperHandler,
	$,
	StringUtils,
	request,
	createDefaultQuestionResolver,
	DefaultWork,
	splitAnswer,
	domSearch,
	domSearchAll,
	SearchInformation
} from '@ocsjs/core';
import { $modal, h, $store, MessageElement, Project, Script, $el, $gm, $$el, $ui, cors, $message } from 'easy-us';

import { CommonProject } from './common';
import { workNotes, volume, playbackRate, dropdownStyle } from '../utils/configs';
import {
	answerWrapperEmptyWarning,
	commonWork,
	optimizationElementWithImage,
	removeRedundantWords,
	simplifyWorkResult
} from '../utils/work';
import md5 from 'md5';
// @ts-ignore
import Typr from 'typr.js';
import { $console, BackgroundProject } from './background';
import { CommonWorkOptions, playMedia } from '../utils';
import { waitForElement, waitForMedia } from '../utils/study';

// @ts-ignore
let top: Window = globalThis.top;

try {
	/**
	 *
	 *  将繁体字映射载入内存。
	 *  为什么不存 localStorage 和 GM_setValue
	 *  localStorage: 存在被检测风险，谁都能访问
	 *  GM_setValue: 文件太大影响I/O速度
	 */
	// @ts-ignore
	top.typrMapping = top.typrMapping || undefined;

	// @ts-ignore 任务点
	top.jobs = top.jobs || [];

	// @ts-ignore 当前视频
	top.currentMedia = top.currentMedia || undefined;

	// 加 try 是因为跨域面板无法操作
} catch {}

const state = {
	study: {
		videojs: Object.create({}),
		hacked: false,
		answererWrapperUnsetMessage: undefined as MessageElement | undefined,
		playbackRateWarningListenerId: 0
	}
};

type VideoQuizStrategy = 'random' | 'ignore';

type Attachment = {
	/** 只有当 module 为 音视频（并且已经播放完成）时才会有这个属性 */
	isPassed: boolean | undefined;
	/** 是否为任务点（音视频播放完成后此属性不存在） */
	job: boolean | undefined;
	/** 这里注意，如果当前章节测试不是任务点，则没有 jobid 或者未空字符串 */
	jobid?: string;
	property: {
		mid: string;
		/** 任务点id，固定存在 */
		_jobid: string;
		module: 'insertbook' | 'insertdoc' | 'insertflash' | 'work' | 'insertaudio' | 'insertvideo';
		name?: string;
		author?: string;
		bookname?: string;
		publisher?: string;
		title?: string;
	};
};

type Job = {
	mid: string;
	attachment: Attachment;
	func: { (): Promise<void> } | undefined;
};
export const CXProject = Project.create({
	name: '超星学习通',
	domains: [
		'chaoxing.com',
		'edu.cn',
		'org.cn',
		// 学银在线
		'xueyinonline.com',
		/** 其他域名 */
		'hnsyu.net',
		'qutjxjy.cn',
		'ynny.cn',
		'hnvist.cn',
		'fjlecb.cn',
		'gdhkmooc.com',
		'cugbonline.cn',
		'zjelib.cn',
		'cqrspx.cn',
		'neauce.com',
		'zhihui-yun.com',
		'cqie.cn',
		'ccqmxx.com',
		'jxgmxy.com',
		'jnzyjsxy.cn',
		// 超星学习通PPT，2025下半年更新的PTT图书新域名
		'sslibrary.com'
	],
	scripts: {
		/**
		 * 创建超星独立脚本防止污染其他脚本环境
		 */
		env: new Script({
			name: '环境准备脚本',
			matches: [['所有页面', /.*/]],
			hideInPanel: true,
			onstart() {
				/**
				 * 于 4.9.20 后更新，出现顶层套壳页面跨域 :
				 * top : zjelib.cn <body>
				 * iframe : mooc1.xxx.zjelib.cn/.../mycourse/studentstudy/...  <iframe src=....>
				 * 导致top指向zjelib跨域无法访问，所以这里尝试寻找真正的top窗口对象，只有域名中包含 /mycourse/studentstudy 才是可操作的 top
				 */
				try {
					let _self = self;
					let _try_count = 10;
					while (_self.parent !== undefined && _try_count > 0) {
						if (_self.location.href.includes('/mycourse/studentstudy')) {
							top = _self;
							console.log('[ocsjs] top change to ' + top.location.href);
							break;
						} else {
							_try_count--;
							// @ts-ignore
							_self = _self.parent;
						}
					}
				} catch (e) {
					console.warn('[ocsjs] fail of find top');
					console.warn(e);
					// @ts-ignore
					top = globalThis.top;
				}
			}
		}),
		guide: new Script({
			name: '💡 使用提示',
			matches: [
				['首页', 'https://www.chaoxing.com'],
				['旧版个人首页', 'chaoxing.com/space/index'],
				['新版个人首页', 'chaoxing.com/base'],
				['学习页面', 'chaoxing.com/mycourse'],
				['新版学习页面', 'chaoxing.com/mooc2-ans/mycourse']
			],
			namespace: 'cx.guide',
			configs: {
				notes: {
					defaultValue: `请手动进入视频、作业、考试页面，脚本会自动运行。`
				}
			},
			oncomplete() {
				if (['mycourse/studentstudy'].some((path) => location.href.includes(path))) {
					$message.success('已进入学习页面，请等待自动运行...');
					return;
				}
				$message.info('请手动进入视频、作业、考试页面，脚本会自动运行。');
			}
		}),
		study: new Script({
			name: '🖥️ 课程学习',
			namespace: 'cx.new.study',
			matches: [
				['任务点页面', '/knowledge/cards'],
				['阅读任务点', '/readsvr/book/mooc']
				// 旧版浏览器好像不能识别二级 iframe ， 所以不能使用 'work/doHomeWorkNew' 以及其他二级 iframe 来触发路由
			],
			configs: {
				notes: {
					defaultValue: $ui.notes([
						['任务点不是顺序执行，如果某一个任务没有动', '请查看是否有其他任务正在学习，耐心等待即可。'],
						'闯关模式请注意题库如果没完成，需要自己完成才能解锁章节。',
						'请勿凌晨刷课，部分学校课程可能会清空进度。',
						['⚠️目前超星倍速风控严重，如果高倍速', '完成后被清空还原，请调到1-2倍速学习！']
					]).outerHTML
				},
				playbackRate: playbackRate,
				volume: volume,
				videoQuizStrategy: {
					label: '视频内题目',
					tag: 'select',
					options: [
						['random', '随机答题'],
						['ignore', '忽略']
					],
					attrs: {
						title:
							'视频有时在学习过程中会弹出题目，这个好像并不计算在分数内，所以可以忽略，视频可以正常观看，这里提供几个方法处理题目'
					},
					defaultValue: 'random' as VideoQuizStrategy
				},
				mode: {
					label: '跳转模式',
					tag: 'select',
					options: [
						['next', '完成后跳转下一节', '完成小节后，自动点击下一节按钮'],
						['job', '完成后跳转未完成任务点', '如果未找到任务点，则会直接结束脚本运行，目前处于试验阶段。'],
						['manually', '完成后暂停，等待手动跳转', '适用于自己手动运行']
					],
					defaultValue: 'next' as 'next' | 'job' | 'manually'
				},
				restudy: {
					label: '复习模式',
					attrs: { title: '已经完成的视频继续学习，并从当前的章节往下开始学习', type: 'checkbox' },
					defaultValue: false
				},
				forceLearn: {
					label: '强制学习',
					attrs: {
						title: '视频一般分为：非任务点、任务点、和已完成任务点，当遇到“非任务点”时需要开启此选项才会进行学习',
						type: 'checkbox'
					},
					defaultValue: false
				},
				backToFirstWhenFinish: {
					label: '完成全部后重新学习',
					attrs: {
						type: 'checkbox',
						title: '当章节已经学习完成至最后一章时，跳转到第一个章节重新开始学习。'
					},
					defaultValue: false
				},
				showTextareaWhenEdit: {
					label: '编辑时显示自定义编辑框',
					attrs: {
						type: 'checkbox',
						title:
							'超星默认禁止在编辑框中复制粘贴，开启此选项可以在文本框编辑时生成一个自定义编辑框进行编辑，脚本会将内容同步到编辑框中。'
					},
					defaultValue: true
				},
				notifyWhenHasFaceRecognition: {
					label: '出现人脸识别时通知我',
					attrs: {
						type: 'checkbox'
					},
					defaultValue: true
				},
				enables: {
					...dropdownStyle,
					label: '高级设置',
					attrs: { type: 'checkbox' },
					defaultValue: false
				},
				/**
				 *
				 * 开启的任务点
				 *
				 * media : 音视频
				 * ppt : 文档和书籍翻阅
				 * test : 章节测试
				 * read : 阅读
				 * live : 直播课
				 *
				 */
				enableMedia: {
					elementClassName: 'config-details',
					showIf: 'cx.new.study.enables',
					label: '视频/音频自动播放',
					attrs: { type: 'checkbox', title: '开启：音频和视频的自动播放' },
					defaultValue: true
				},
				enablePPT: {
					elementClassName: 'config-details',
					showIf: 'cx.new.study.enables',
					label: 'PPT/书籍自动完成',
					attrs: { type: 'checkbox', title: '开启：PPT/书籍自动翻阅' },
					defaultValue: true
				},
				enableChapterTest: {
					elementClassName: 'config-details',
					showIf: 'cx.new.study.enables',
					label: '章节测试自动答题',
					attrs: { type: 'checkbox', title: '开启：章节测试自动答题' },
					defaultValue: true
				},
				enableHyperlink: {
					elementClassName: 'config-details',
					showIf: 'cx.new.study.enables',
					label: '链接任务自动完成',
					attrs: { type: 'checkbox', title: '开启：链接任务自动完成' },
					defaultValue: true
				}
			},
			onrender({ panel }) {
				if (!CommonProject.scripts.settings.cfg.answererWrappers?.length) {
					answerWrapperEmptyWarning(10);
				}

				// 高倍速警告
				this.offConfigChange(state.study.playbackRateWarningListenerId);
				state.study.playbackRateWarningListenerId =
					this.onConfigChange('playbackRate', (playbackRate) => {
						if (playbackRate > 2) {
							$modal.alert({
								title: '⚠️高倍速警告',
								content: $ui.notes([
									'⚠️高倍速可能导致学习记录清空/回退',
									'⚠️超星后台可以看到学习时长，请谨慎设置',
									'⚠️如已清空/回退，请降低倍速至1-2倍'
								]),
								maskCloseable: false,
								confirmButtonText: '我已知晓风险'
							});
						}
					}) || 0;
			},
			// 这里不使用 oncompelete ，如果某个资源一直在加载中，就会导致 oncomplete 一直无法触发，导致脚本无法运行，所以改为 onactive 只要匹配上就会触发
			async onactive() {
				/** iframe 跨域问题， 必须在 iframe 中执行 ， 所以脱离学习脚本运行。 */
				if (/\/readsvr\/book\/mooc/.test(location.href)) {
					// 26年上半学期新阅读任务点，计时翻页，达到一定时间才能翻下一页，这里等待时间然后执行翻页完成任务。
					if (document.querySelector('#reader')) {
						// @ts-ignore
						require(['reader'], (_reader) => {
							waitForElement('.readerPager').then(() => {
								setTimeout(async () => {
									const jumper = document.querySelector<HTMLSelectElement>('#pagejump');
									if (_reader?.goPage && jumper) {
										// 等待时间
										const timing = parseInt(new URL(location.href).searchParams.get('timing')?.toString() || '60') + 3;
										console.log(timing);
										await $.sleep(timing * 1000);
										/**
											 *  1:书名页
												2:版权页
												3:前言页
												4:目录页
												5:正文275页
												7:封底页
											*/
										jumper.value = '5';
										jumper.dispatchEvent(new Event('change'));
										console.log('已跳转正文页');
										await $.sleep(timing * 1000);
										jumper.value = '7';
										jumper.dispatchEvent(new Event('change'));
										console.log('已跳转封底页');
										await $.sleep(timing * 1000);
										Array.from(document.querySelectorAll<HTMLElement>('.readerPager'))
											.filter((el) => el.style.zIndex === '101')[0]
											.click();
										console.log('阅读完成');
									}
								}, 3000);
							});
						});
					}
					// 普通阅读任务点，id 是 #ReadWeb
					else {
						$console.log('正在完成书籍/PPT...');
						setTimeout(() => {
							// @ts-ignore
							// eslint-disable-next-line no-undef
							readweb.goto(epage);
						}, 5000);
					}
					return;
				}

				// 主要处理
				if (/\/knowledge\/cards/.test(location.href)) {
					const updateMediaState = () => {
						// @ts-ignore
						if (top.currentMedia) {
							// @ts-ignore 倍速设置
							top.currentMedia.playbackRate = parseFloat(this.cfg.playbackRate.toString());
							// @ts-ignore 音量设置
							top.currentMedia.volume = this.cfg.volume;
						}
					};

					this.onConfigChange('playbackRate', updateMediaState);
					this.onConfigChange('volume', updateMediaState);

					await study({
						...this.cfg,
						playbackRate: parseFloat(this.cfg.playbackRate.toString()),
						workOptions: CommonProject.scripts.settings.methods.getWorkOptions()
					});
				}
			}
		}),
		work: new Script({
			name: '✍️ 作业考试脚本',
			matches: [
				['作业页面', '/mooc2/work/dowork'],
				['考试整卷预览页面', '/mooc2/exam/preview']
			],
			namespace: 'cx.new.work',
			configs: { notes: workNotes },
			async oncomplete() {
				const isExam = /\/exam\/preview/.test(location.href);
				commonWork(this, {
					workerProvider: (opts) => workOrExam(isExam ? 'exam' : 'work', { ...opts, preview_mode: true }),
					enable_control_panel: true
				});
			}
		}),
		autoRead: new Script({
			name: '🖥️ 自动阅读',
			matches: [
				['阅读页面', '/ztnodedetailcontroller/visitnodedetail'],
				['课程目录', /chaoxing.com\/course\/\d+\.html/],
				['课程目录', /chaoxing.com\/mooc-ans\/course\/\d+\.html/],
				['积分课阅读课程目录', '/mooc-ans/zt/portal']
			],
			namespace: 'cx.new.auto-read',
			configs: {
				notes: {
					defaultValue: $ui.notes(['点击任意章节开始自动阅读', '阅读任务次日才会统计阅读时长']).outerHTML
				},
				restartAfterFinish: {
					label: '无限阅读',
					attrs: { type: 'checkbox', title: '阅读完成最后一章后从头第一章继续阅读' },
					defaultValue: false
				}
			},
			oncomplete() {
				// 置顶
				CommonProject.scripts.render.methods.pin(this);
				$message.info('请手动点击任意章节开始自动阅读');

				// 自动进入章节功能，如果不是阅读页面则自动进入
				if (location.href.includes('/ztnodedetailcontroller/visitnodedetail') === false) {
					startAtFirst();
					return;
				}

				let top = 0;
				const interval = setInterval(() => {
					top += (document.documentElement.scrollHeight - window.innerHeight) / 60;
					window.scrollTo({
						behavior: 'smooth',
						top: top
					});
				}, 1000);

				setTimeout(() => {
					clearInterval(interval);
					// 下一页
					const next = $el('.nodeItem.r i');
					if (next) {
						next.click();
					} else {
						if (this.cfg.restartAfterFinish) {
							setTimeout(() => startAtFirst(), 3000);
							$message.info({ content: '即将重新从头开始阅读', duration: 10 });
							$console.log('即将重新从头开始阅读');
						} else {
							$message.success({ content: '阅读任务已完成', duration: 0 });
							$console.log('未检测到下一页');
						}
					}
				}, (60 + 3) * 1000);

				// 点击第一个章节
				function startAtFirst() {
					const texts = $$el('.course_section .chapterText');
					if (texts.length) {
						texts[0].click();
					}
				}
			}
		}),
		/**
		 * 有时候进入课程会默认在，任务页面，会出现任务为空，部分用户会以为没有章节任务，所以添加此脚本
		 */
		pageRedirect: new Script({
			name: '章节页面自动切换脚本',
			matches: [['课程任务页面', 'pageHeader=0']],
			hideInPanel: true,
			async oncomplete() {
				if (top === window) {
					const a = document.querySelector<HTMLElement>('a[title="章节"]');
					if (a) {
						await $.sleep(1000);
						// 跳转到最新版本的超星
						a.click();
						$message.info({
							content: '已经为您自动切换到章节列表页面，手动进入任意章节即可开始自动学习！'
						});
					}
				}
			}
		}),
		versionRedirect: new Script({
			name: '版本切换脚本',
			matches: [
				['', 'mooc2=0'],
				['', 'mycourse/studentcourse'],
				['', 'work/getAllWork'],
				['', 'work/doHomeWorkNew'],
				['', 'exam/test\\?'],
				['', 'mooc-ans/mycourse/studentstudy']
			],
			hideInPanel: true,
			async oncomplete() {
				if (top === window) {
					$message.warn({
						content:
							'OCS网课助手不支持旧版超星, 即将切换到超星新版, 如有其他第三方插件请关闭, 可能有兼容问题导致频繁切换。',
						duration: 0
					});
					// 跳转到最新版本的超星
					await $.sleep(2000);

					// 检测是否有人脸识别
					await waitForFaceRecognition();

					const experience = document.querySelector('.experience') as HTMLElement;
					if (experience) {
						experience.click();
					} else {
						const newUrl = new URL(window.location.href);
						if (window.location.href.includes('mooc-ans/mycourse/studentstudy')) {
							newUrl.pathname = '/mycourse/studentstudy';
						}
						const params = newUrl.searchParams;
						let changed = false;
						if (params.get('mooc2') !== '1') {
							params.set('mooc2', '1');
							changed = true;
						}

						// 兼容考试切换
						if (params.get('newMooc') !== 'true') {
							params.set('newMooc', 'true');
							changed = true;
						}
						if (changed) window.location.replace(newUrl);
					}
				}
			}
		}),
		examRedirect: new Script({
			name: '考试整卷预览脚本',
			matches: [
				['新版考试页面', 'exam-ans/exam/test/reVersionTestStartNew'],
				// 2023/9月 新增
				['新版考试页面2', 'mooc-ans/exam/test/reVersionTestStartNew']
			],
			hideInPanel: true,
			oncomplete() {
				if ($gm.unsafeWindow.document.querySelector('.mark_info')?.textContent?.includes('不允许整卷预览')) {
					$message.warn({
						content: $ui.notes([
							'由于当前考试禁止整卷预览，各题为独立新页面，只能一个个答题',
							'在考完前禁止手动切换题目，否则会导致重复答题！',
							'完成后或者开考前请手动删除搜索结果！',
							'想加快速度请更改通用-全局设置-高级设置-搜题间隔，设置为 1-3 秒即可。'
						]),
						duration: 0
					});
					const isExam = /\/exam\/test/.test(location.href);
					const workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
					commonWork(CXProject.scripts.work, {
						// 因为超星是每个题目一个页面，这里加快开始速度，避免等待，默认5秒，这里加快为默认3秒间隔
						start_delay_seconds: workOptions.period,
						enable_control_panel: true,
						workerProvider: (opts) => workOrExam(isExam ? 'exam' : 'work', { ...opts, preview_mode: false, thread: 1 })
					});
					return;
				}
				$message.info({ content: '即将跳转到整卷预览页面进行考试。' });
				setTimeout(() => $gm.unsafeWindow.topreview(), 3000);
			}
		}),
		rateHack: new Script({
			name: '屏蔽倍速限制',
			hideInPanel: true,
			matches: [['', '/ananas/modules/video/']],
			onstart() {
				rateHack();
			}
		}),
		copyHack: new Script({
			name: '屏蔽复制粘贴限制',
			hideInPanel: true,
			matches: [['所有页面', /.*/]],
			methods() {
				return {
					/** 解除输入框无法复制粘贴 */
					hackEditorPaste() {
						try {
							const instants = $gm.unsafeWindow?.UE?.instants || [];
							for (const key in instants) {
								const ue = instants[key];

								/**
								 * 新建一个文本框给用户编辑，然后同步到超星编辑器，防止http下浏览器无法读取剪贴板
								 */

								// eslint-disable-next-line no-proto
								if (ue?.textarea) {
									ue.body.addEventListener('click', async () => {
										// http 下无法读取剪贴板，通过弹窗让用户输入然后同步到编辑器
										if (CXProject.scripts.study.cfg.showTextareaWhenEdit) {
											const defaultText = h('span', { innerHTML: ue.textarea.value }).textContent;
											$modal.prompt({
												content:
													'请在此文本框进行编辑，防止超星无法复制粘贴。(如需关闭请前往设置: 课程学习-编辑时显示自定义编辑框)',
												width: 800,
												inputDefaultValue: defaultText || '',
												modalInputType: 'textarea',
												onConfirm: (val = '') => {
													ue.setContent(
														val
															.split('\n')
															.map((line) => `<p>${line}</p>`)
															.join('')
													);
												}
											});
										}
									});

									if ($gm.unsafeWindow.editorPaste) {
										ue.removeListener('beforepaste', $gm.unsafeWindow.editorPaste);
									}
									if ($gm.unsafeWindow.myEditor_paste) {
										ue.removeListener('beforepaste', $gm.unsafeWindow.myEditor_paste);
									}
								}
							}
						} catch {}
					}
				};
			},
			oncomplete() {
				const hackInterval = setInterval(() => {
					if (typeof $gm.unsafeWindow.UE !== 'undefined') {
						clearInterval(hackInterval);
						this.methods.hackEditorPaste();
						console.log('已解除输入框无法复制粘贴限制');
					}
				}, 500);
			}
		}),
		studyDispatcher: new Script({
			name: '课程学习调度器',
			matches: [['课程学习页面', '/mycourse/studentstudy']],
			namespace: 'cx.new.study-dispatcher',
			hideInPanel: true,
			async oncomplete() {
				// 开始任务切换
				const restudy = CXProject.scripts.study.cfg.restudy;

				CommonProject.scripts.render.methods.pin(CXProject.scripts.study);

				let chapters = await CXAnalyses.waitForChapterInfos();

				if (!restudy) {
					// 如果不是复习模式，则寻找需要运行的任务
					const params = new URLSearchParams(window.location.href);
					const mooc = params.get('mooc2');
					/** 切换新版 */
					if (mooc === null) {
						params.set('mooc2', '1');
						window.location.replace(decodeURIComponent(params.toString()));
						return;
					}

					// 过滤掉已完成的章节
					chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);

					if (chapters.length === 0) {
						$message.warn({ content: '页面任务点数量为空! 请刷新重试!' });
					} else {
						const params = new URLSearchParams(window.location.href);
						const courseId = params.get('courseId');
						const classId = params.get('clazzid');
						setTimeout(() => {
							//  进入需要进行的章节，并且当前章节未被选中
							if ($$el(`.posCatalog_active[id="cur${chapters[0].chapterId}"]`).length === 0) {
								$gm.unsafeWindow.getTeacherAjax(courseId, classId, chapters[0].chapterId);
								// 自动滚动
								setTimeout(() => {
									CXAnalyses.scrollToActiveChapter();
								}, 1000);
							}
						}, 1000);
					}
				} else {
					// 自动滚动
					setTimeout(() => {
						CXAnalyses.scrollToActiveChapter();
					}, 1000);
				}
			}
		}),
		cxSecretFontRecognize: new Script({
			name: '繁体字识别',
			hideInPanel: true,
			matches: [
				['题目页面', 'work/doHomeWorkNew'],
				['考试整卷预览', '/mooc2/exam/preview'],
				['作业', '/mooc2/work/dowork']
			],
			async oncomplete() {
				await mappingRecognize();
			}
		}),
		// 积分课提示
		jfkGuide: new Script({
			name: '💡 积分课使用提示',
			matches: [['积分课页面', '/plaza']],
			namespace: 'cx.jfk.guide',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'积分课请进入课程后，开启复习模式，并且关闭自动下一章',
						'课程完成后请手动切换，如果由脚本进行自动跳转会出现乱跳转的可能。'
					]).outerHTML
				}
			},
			oncomplete(...args) {
				CommonProject.scripts.render.methods.pin(this);
			}
		})
	}
});

function workOrExam(
	type: 'work' | 'exam' = 'work',
	{
		answererWrappers,
		period,
		thread,
		redundanceWordsText,
		answerSeparators,
		answerMatchMode,
		preview_mode
	}: CommonWorkOptions & {
		// 整卷预览模式
		preview_mode: boolean;
	}
) {
	$message.info(`开始${type === 'work' ? '作业' : '考试'}`);

	if (preview_mode) {
		CommonProject.scripts.workResults.methods.init({
			questionPositionSyncHandlerType: 'cx'
		});
	}

	// 处理作业和考试题目的方法
	const workOrExamQuestionTitleTransform = (titles: (HTMLElement | undefined)[]) => {
		const optimizationTitle = titles
			.map((titleElement) => {
				if (titleElement) {
					const titleCloneEl = titleElement.cloneNode(true) as HTMLElement;
					const childNodes = titleCloneEl.childNodes;
					// 删除序号
					childNodes[0].remove();
					// 删除题型
					childNodes[0].remove();
					// 显示图片链接在题目中
					return optimizationElementWithImage(titleCloneEl, true).innerText;
				}
				return '';
			})
			.join(',');

		return removeRedundantWords(
			StringUtils.of(optimizationTitle).nowrap(' ').nospace().toString().trim(),
			redundanceWordsText.split('\n')
		);
	};

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.questionLi',
		elements: {
			title: [
				/** 题目标题 */
				(root) => $el('h3', root) as HTMLElement
				// /** 连线题第一组 */
				// (root) => $el('.line_wid_half.fl', root),
				// /** 连线题第二组 */
				// (root) => $el('.line_wid_half.fr', root)
			],
			options: '.answerBg .answer_p, .textDIV, .eidtDiv',
			type: type === 'exam' ? 'input[name^="type"]' : 'input[id^="answertype"]',
			lineAnswerInput: '.line_answer input[name^=answer]',
			lineSelectBox: '.line_answer_ct .selectBox ',
			/** 阅读理解 */
			reading: '.reading_answer',
			/** 完形填空 */
			filling: '.filling_answer'
		},
		thread: thread ?? 1,
		answerSeparators: answerSeparators.split(',').map((s) => s.trim()),
		answerMatchMode: answerMatchMode,
		/** 默认搜题方法构造器 */
		answerer: (elements, ctx) => {
			if (elements.title) {
				// 处理作业和考试题目
				const title = workOrExamQuestionTitleTransform(elements.title);
				if (title) {
					const typeInput = elements.type[0] as HTMLInputElement;
					return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
						await $.sleep((period ?? 3) * 1000);
						return defaultAnswerWrapperHandler(answererWrappers, {
							type: (typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined) || 'unknown',
							title,
							options:
								ctx.type === 'completion'
									? ''
									: ctx.elements.options.map((o) => optimizationElementWithImage(o, true).innerText).join('\n')
						});
					});
				} else {
					throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
				}
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},

		work: async (ctx) => {
			const { elements, searchInfos } = ctx;
			const typeInput = elements.type[0] as HTMLInputElement;
			const type = getQuestionType(parseInt(typeInput.value));

			if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
				const resolver = createDefaultQuestionResolver(ctx)[type];
				return await resolver(
					searchInfos,
					elements.options.map((option) => optimizationElementWithImage(option)),
					async (type, answer, option) => {
						// 如果存在已经选择的选项
						if (type === 'judgement' || type === 'single' || type === 'multiple') {
							if (option?.parentElement && $$el('[class*="check_answer"]', option.parentElement).length === 0) {
								option.click();
								await $.sleep(500);
							}
						} else if (type === 'completion' && answer.trim()) {
							const text = option?.querySelector('textarea');
							const textareaFrame = option?.querySelector('iframe');
							if (text) {
								text.value = answer;
							}
							if (textareaFrame?.contentDocument) {
								textareaFrame.contentDocument.body.innerHTML = answer;
							}
							if (option?.parentElement?.parentElement) {
								/** 如果存在保存按钮则点击 */
								$el('[onclick*=saveQuestion]', option?.parentElement?.parentElement)?.click();
								await $.sleep(500);
							}
						}
					}
				);
			}
			// 连线题自定义处理
			else if (type && type === 'line') {
				for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
					let ans = answers;
					if (ans.length === 1) {
						ans = splitAnswer(ans[0]);
					}
					if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
						//  选择答案
						for (let index = 0; index < elements.lineSelectBox.length; index++) {
							const box = elements.lineSelectBox[index];
							if (ans[index]) {
								$el(`li[data=${ans[index]}] a`, box)?.click();
								await $.sleep(200);
							}
						}

						return { finish: true };
					}
				}

				return { finish: false };
			}
			// 完形填空
			else if (type && type === 'fill') {
				return readerAndFillHandle(searchInfos, elements.filling);
			}
			// 阅读理解
			else if (type && type === 'reader') {
				return readerAndFillHandle(searchInfos, elements.reading);
			}

			return { finish: false };
		},

		/** 完成答题后 */
		async onResultsUpdate(current, _, res) {
			// 非预览模式，直接追加，想要清楚只能手动清空
			if (!preview_mode) {
				if (current.result?.finish) {
					await CommonProject.scripts.workResults.methods.appendResults(
						simplifyWorkResult(res, workOrExamQuestionTitleTransform)
					);
					CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
						simplifyWorkResult([current], workOrExamQuestionTitleTransform)
					);
				}
				return;
			}

			CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, workOrExamQuestionTitleTransform));
			CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);
			if (current.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
					simplifyWorkResult([current], workOrExamQuestionTitleTransform)
				);
			}
		}
	});

	if (preview_mode) {
		worker
			.doWork()
			.then(() => {
				$message.info({ content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
				worker.emit('done');
			})
			.catch((err) => {
				console.error(err);
				$message.error('答题程序发生错误 : ' + err.message);
			});
	} else {
		const getNextBtn = () => document.querySelector('[onclick="getTheNextQuestion(1)"]') as HTMLElement;
		let next = getNextBtn();

		(async () => {
			while (next && worker.isClose === false) {
				await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
				await $.sleep(1000);
				next = getNextBtn();
				next?.click();
				await $.sleep(1000);
			}

			$message.success({ content: '作业/考试完成，请自行检查后保存或提交。', duration: 0 });
			worker.emit('done');
			// 搜索完成后才会同步答案与题目的显示，防止题目错乱
			CommonProject.scripts.workResults.cfg.questionPositionSyncHandlerType = 'cx';
		})();
	}

	return worker;
}

/**
 * 繁体字识别-字典匹配
 * @see 参考 https://bbs.tampermonkey.net.cn/thread-2303-1-1.html
 */
async function mappingRecognize(doc: Document = document) {
	let typrMapping = Object.create({});
	try {
		// @ts-ignore
		top.typrMapping = top.typrMapping || (await loadTyprMapping());
		// @ts-ignore
		typrMapping = top.typrMapping;
	} catch {
		// 超星考试可能嵌套其他平台中，所以会存在跨域，这里需要处理一下跨域情况，如果是跨域直接在当前页面加载字库
		typrMapping = await loadTyprMapping();
	}

	/** 判断是否有繁体字 */
	const fontFaceEl = Array.from(doc.head.querySelectorAll('style')).find((style) =>
		style.textContent?.includes('font-cxsecret')
	);

	const base64ToUint8Array = (base64: string) => {
		const data = window.atob(base64);
		const buffer = new Uint8Array(data.length);
		for (let i = 0; i < data.length; ++i) {
			buffer[i] = data.charCodeAt(i);
		}
		return buffer;
	};

	const fontMap = typrMapping;
	if (fontFaceEl && Object.keys(fontMap).length > 0) {
		// 解析font-cxsecret字体
		const font = fontFaceEl.textContent?.match(/base64,([\w\W]+?)'/)?.[1];

		if (font) {
			$console.log('正在识别繁体字');

			const code = Typr.parse(base64ToUint8Array(font));

			// 匹配解密字体
			const match: any = {};
			for (let i = 19968; i < 40870; i++) {
				// 中文[19968, 40869]
				const Glyph = Typr.U.codeToGlyph(code, i);
				if (!Glyph) continue;
				const path = Typr.U.glyphToPath(code, Glyph);
				const hex = md5(JSON.stringify(path)).slice(24); // 8位即可区分
				match[i.toString()] = fontMap[hex];
			}
			const fonts = CXAnalyses.getSecretFont(doc);
			// 替换加密字体
			fonts.forEach((el, index) => {
				let html = el.innerHTML;
				for (const key in match) {
					const word = String.fromCharCode(parseInt(key));
					const value = String.fromCharCode(match[key]);

					// 如果相同，则不需要替换
					if (word === value) {
						continue;
					}

					while (html.indexOf(word) !== -1) {
						html = html.replace(word, value);
					}
				}

				el.innerHTML = html;
				el.classList.remove('font-cxsecret'); // 移除字体加密
			});

			$console.log('识别繁体字完成。');
		} else {
			$console.log('未检测到繁体字。');
		}
	}
}

async function loadTyprMapping() {
	try {
		$console.log('正在加载繁体字库。');
		return await request('https://cdn.ocsjs.com/resources/font/table.json', {
			type: 'GM_xmlhttpRequest',
			method: 'get',
			responseType: 'json'
		});
	} catch (err) {
		$console.error('载繁体字库加载失败，请刷新页面重试：', String(err));
	}
}

/**
 * cx分析工具
 */
const CXAnalyses = {
	/** 是否处于闯关模式或者解锁模式 */
	isInSpecialMode() {
		return Array.from(top?.document.querySelectorAll('.catalog_points_sa,.catalog_points_er') || []).length !== 0;
	},
	/** 是否为闯关模式，并且当前章节卡在最后一个待完成的任务点 */
	async isStuckInBreakingMode() {
		if (this.isInSpecialMode()) {
			const chapter = top?.document.querySelector<HTMLElement>('.posCatalog_active');
			if (chapter) {
				const id = chapter.getAttribute('id');
				if (id) {
					// 超星好像会重绘组件，导致无法绑定属性到元素中，所以这里使用页面全局变量存储
					const counter = (await $store.getTab('chapter_counter')) || Object.create({});
					let count = Reflect.get(counter, id);
					count = count ? count + 1 : 1;
					Reflect.set(counter, id, count);

					let res = false;
					if (count >= 3) {
						Reflect.set(counter, id, 1);
						res = true;
					}
					await $store.setTab('chapter_counter', counter);
					return res;
				}
			}
		}
		return false;
	},
	/**
	 * 是否处于最后一小节
	 * 当小节为0，返回 true
	 */
	isInFinalTab() {
		// 上方小节任务栏
		const tabs = Array.from<HTMLElement>(top?.document.querySelectorAll('.prev_ul li') || []);
		if (tabs.length === 0) {
			return true;
		}
		return tabs[tabs.length - 1].classList.contains('active');
	},
	/** 是否处于最后一个章节 */
	isInFinalChapter() {
		return Array.from(top?.document.querySelectorAll('.posCatalog_select') || [])
			.pop()
			?.classList.contains('posCatalog_active');
	},
	/** 是否完成全部章节 */
	isFinishedAllChapters() {
		return this.getChapterInfos().every((chapter) => chapter.unFinishCount === 0);
	},
	/** 获取所有章节信息 */
	getChapterInfos() {
		return Array.from(top?.document.querySelectorAll('[onclick^="getTeacherAjax"]') || []).map((el) => ({
			element: el as HTMLElement,
			chapterId: el.getAttribute('onclick')?.match(/\('(.*)','(.*)','(.*)'\)/)?.[3],
			// @ts-ignore
			unFinishCount: parseInt(el.parentElement.querySelector('.jobUnfinishCount')?.value || '0')
		}));
	},
	scrollToActiveChapter() {
		const activeChapter = top?.document.querySelector<HTMLElement>('.posCatalog_active');
		if (activeChapter) {
			activeChapter.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	},
	/**
	 * 等待并获取章节信息，直到获取到章节信息为止
	 * - 可设置超时时间（单位秒），默认10秒
	 * - 超时后返回空数组
	 */
	waitForChapterInfos(timeout = 10) {
		return new Promise<any[]>((resolve, reject) => {
			const interval = setInterval(() => {
				const res = this.getChapterInfos();
				if (res.length > 0) {
					clearInterval(interval);
					clearInterval(to);
					resolve(res);
				}
			}, 1000);

			const to = setTimeout(() => {
				clearInterval(interval);
				resolve([]);
			}, timeout * 1000);
		});
	},
	/** 检测页面是否使用字体加密 */
	getSecretFont(doc: Document = document) {
		return Array.from(doc.querySelectorAll('.font-cxsecret')).map((font) => {
			// 这里吧选项按钮和文字分离，如果不分离的话 .font-cxsecret 元素下面还包含选项按钮时，替换时会吧按钮也删除掉导致选项按钮不可用
			const after = font.querySelector('.after');
			return after === null ? font : after;
		}) as HTMLElement[];
	},
	/**
	 * 检测当前章节是否完成
	 */
	isCurrentChapterFinished() {
		const job = top?.document.querySelector('.posCatalog_active');
		if (job) {
			if (job.querySelector('.icon_Completed') !== null) {
				return true;
			}
		}
		return false;
	}
};

/**
 * 屏蔽倍速限制
 */
function rateHack() {
	state.study.hacked = false;
	let dragCount = 0;
	try {
		hack();
		window.document.addEventListener('readystatechange', hack);
		window.addEventListener('load', hack);
	} catch (e) {
		console.error(e);
	}

	function hack() {
		const videojs = $gm.unsafeWindow.videojs;
		const Ext = $gm.unsafeWindow.Ext;

		if (typeof videojs !== 'undefined' && typeof Ext !== 'undefined') {
			if (state.study.hacked) {
				return;
			}
			state.study.hacked = true;

			const _origin = videojs.getPlugin('seekBarControl');
			const plugin = videojs.extend(videojs.getPlugin('plugin'), {
				constructor: function (videoExt: any, data: any) {
					const _sendLog = data.sendLog;
					data.sendLog = (...args: any[]) => {
						if (args[1] === 'drag') {
							dragCount++;
							// 开始播放的时候偶尔会卡顿，导致一直触发 drag 事件（超星的BUG）
							// 这里如果卡顿太多，尝试暂停视频，然后等待视频自动开始。
							if (dragCount > 100) {
								dragCount = 0;
								$el('video')?.pause();
							}
						} else {
							_sendLog.apply(data, args);
						}
					};

					_origin.apply(_origin.prototype, [videoExt, data]);
				}
			});

			videojs.registerPlugin('seekBarControl', plugin);

			// 重写超星视频插件
			Ext.define('ans.VideoJs', {
				override: 'ans.VideoJs',
				constructor: function (data: any) {
					this.addEvents(['seekstart']);
					this.mixins.observable.constructor.call(this, data);
					const vjs = videojs(data.videojs, this.params2VideoOpt(data.params), function () {});
					Ext.fly(data.videojs).on('contextmenu', function (f: any) {
						f.preventDefault();
					});
					Ext.fly(data.videojs).on('keydown', function (f: any) {
						if (f.keyCode === 32 || f.keyCode === 37 || f.keyCode === 39 || f.keyCode === 107) {
							f.preventDefault();
						}
					});

					// 保存清晰度设置
					if (vjs.videoJsResolutionSwitcher) {
						vjs.on('resolutionchange', function () {
							const cr = vjs.currentResolution();
							const re = cr.sources ? cr.sources[0].res : false;
							Ext.setCookie('resolution', re);
						});
					}

					// 保存公网设置
					if (vjs.videoJsPlayLine) {
						vjs.on('playlinechange', function () {
							const cp = vjs.currentPlayline();
							Ext.setCookie('net', cp.net);
						});
					}

					// 下面连着一个倍速限制方法，这里直接不写，实现可以倍速
				}
			});
		}
	}
}

/**
 * cx 任务学习
 */
export async function study(
	opts: typeof CXProject.scripts.study.cfg & {
		workOptions: CommonWorkOptions;
	}
) {
	await $.sleep(3000);

	const searchedJobs: Job[] = [];

	let searching = true;

	let attachmentCount: number = $gm.unsafeWindow.attachments?.length || 0;

	const wait_timeout = 3 + attachmentCount * 2;

	/** 考虑到网速级慢的同学，所以10秒后如果还没有任务点才停止 */
	setTimeout(() => {
		searching = false;
	}, Math.min(wait_timeout, 10) * 1000);

	/**
	 * 递归运行任务点，一旦有新的任务点被检测到直接开始
	 * 如果10秒内既没有任务点，也暂停了搜索，则当前则没有任务点
	 */
	const runJobs = async () => {
		const job = searchJob(opts, searchedJobs);
		// 如果存在任务点
		if (job && job.func) {
			try {
				await job.func();
			} catch (e) {
				$console.error('未知错误', e);
			}

			await $.sleep(1000);
			await runJobs();
		}
		// 每次 search 一次，就减少一次文件数量
		// 如果不加这个判断，三个任务中，中间的任务不是任务点，则会导致下面的任务全部不执行。
		else if (attachmentCount > 0) {
			attachmentCount--;
			await $.sleep(1000);
			await runJobs();
		}
		// 或者正在搜索
		else if (searching) {
			await $.sleep(1000);
			await runJobs();
		}
	};

	await runJobs();

	// @ts-ignore
	top._preChapterId = '';

	// 下一章
	const next = async () => {
		if (CXAnalyses.isInFinalTab()) {
			if (await CXAnalyses.isStuckInBreakingMode()) {
				return $modal.alert({
					content:
						'检测到当前课程为闯关模式（有小旗帜图标）, 但是已经重复进入多次，应该是章节测试没有完成，或者其他情况导致，请手动完成章节测试，然后手动点击下一章。'
				});
			}
		}

		if (CXAnalyses.isInFinalChapter()) {
			let content = '';

			if (opts.backToFirstWhenFinish) {
				content = '已经抵达最后一个章节，10秒后返回第一个章节重新开始。';
				setTimeout(() => {
					top?.document.querySelector<HTMLElement>('.posCatalog_name')?.click();
				}, 10 * 1000);

				$message.info({ content, duration: 30 });
			} else {
				if (CXAnalyses.isFinishedAllChapters()) {
					content = '全部任务点已完成！';
				} else {
					content = '已经抵达最后一个章节！但仍然有任务点未完成，请手动切换至未完成的章节。';
				}

				$modal.alert({ content: content });
			}

			CommonProject.scripts.settings.methods.notificationBySetting(content, {
				duration: 0,
				extraTitle: '超星学习通学习脚本'
			});
			return;
		}

		if (CXProject.scripts.study.cfg.mode === 'job') {
			// 检测当前章节是否完成，如果已经完成则下一章
			// 如果没有需要完成的章节，则暂停运行

			if (CXAnalyses.isInFinalTab()) {
				// 找到未完成
				const elements = CXAnalyses.getChapterInfos()
					.filter((el) => el.unFinishCount > 0 || el.element.parentElement?.classList.contains('posCatalog_active'))
					.map((el) => el.element.parentElement as HTMLElement);
				if (elements.length === 0) {
					const content = '全部任务点已完成！';
					$modal.alert({ content: content });
					CommonProject.scripts.settings.methods.notificationBySetting(content, {
						duration: 0,
						extraTitle: '超星学习通学习脚本'
					});
					return;
				}

				let nextChapter = elements[0];
				// 如果当前章节未完成，则跳转到下一个未完成章节
				const currentIndex = elements.findIndex((el) => el.classList.contains('posCatalog_active'));
				if (currentIndex !== -1 && currentIndex + 1 < elements.length) {
					nextChapter = elements[currentIndex + 1];
					CXAnalyses.scrollToActiveChapter();
					setTimeout(() => {
						nextChapter.querySelector<HTMLElement>('.posCatalog_name')?.click();
					}, 1000);
				}
			}
		} else if (CXProject.scripts.study.cfg.mode === 'next') {
			const curCourseId = $el<HTMLInputElement>('#curCourseId', top?.document);
			const curChapterId = $el<HTMLInputElement>('#curChapterId', top?.document);
			const curClazzId = $el<HTMLInputElement>('#curClazzId', top?.document);
			const count = $$el('#prev_tab .prev_ul li', top?.document);

			// 自动下一个小节（点击下一节）
			if (curChapterId && curCourseId && curClazzId) {
				// @ts-ignore
				top._preChapterId = curChapterId.value;
				CXAnalyses.scrollToActiveChapter();
				// 等待跳转动画完成
				await $.sleep(200);

				/**
				 * count, chapterId, courseId, clazzid, knowledgestr, checkType
				 * checkType 就是询问当前章节还有任务点未完成，是否完成，这里直接不传，默认下一章
				 */
				// @ts-ignore
				top?.PCount.next(count.length.toString(), curChapterId.value, curCourseId.value, curClazzId.value, '');
			} else {
				$console.warn('参数错误，无法跳转下一章，请尝试手动切换。');
			}
		} else {
			$console.warn('未知的跳转模式，请联系作者反馈');
		}
	};

	if (CXProject.scripts.study.cfg.mode !== 'manually') {
		const msg = '页面任务点已完成，即将跳转。';
		$message.success({ content: msg });
		$console.info(msg);
		await $.sleep(5000);
		next();
	} else {
		const msg = '页面任务点已完成，自动跳转已关闭，请手动跳转。';
		$message.warn({ content: msg, duration: 0 });
		$console.warn(msg);
	}
}

function searchIFrame(root: Document) {
	let list = Array.from(root.querySelectorAll('iframe'));
	const result: HTMLIFrameElement[] = [];
	while (list.length) {
		const frame = list.shift();

		try {
			if (frame && frame?.contentWindow?.document) {
				result.push(frame);
				const frames = frame?.contentWindow?.document.querySelectorAll('iframe');
				list = list.concat(Array.from(frames || []));
			}
		} catch (e) {
			// @ts-ignore
			console.log(e.message);
		}
	}
	return result;
}

/**
 * 搜索任务点
 */
function searchJob(
	opts: typeof CXProject.scripts.study.cfg & {
		workOptions: CommonWorkOptions;
	},
	searchedJobs: Job[]
): Job | undefined {
	const knowCardWin = $gm.unsafeWindow;

	const searchJobElement = (root: HTMLIFrameElement) => {
		return domSearch(
			{
				videojs: '#video,#audio',
				chapterTest: '.TiMu',
				read: '#img.imglook',
				pptWithAudio: '.swiper-container',
				hyperlink: '#hyperlink',
				timereader: 'iframe[name="bookifame"][src*="timing"]'
			},
			root.contentWindow!.document
		);
	};

	const search = (root: HTMLIFrameElement): Job | undefined => {
		const win = root.contentWindow;

		const { videojs, read, chapterTest, hyperlink, pptWithAudio, timereader } = searchJobElement(root);

		if (win && (videojs || read || chapterTest || hyperlink || pptWithAudio || timereader)) {
			// 获取任务点数据字符串
			const frame_data_str =
				win.frameElement?.getAttribute('data') ||
				// 带音频的PPT，套了两层iframe
				(win.frameElement as HTMLIFrameElement)?.contentWindow?.parent.frameElement?.getAttribute('data') ||
				'{}';
			const frame_data = JSON.parse(frame_data_str);
			const target_jobid = frame_data.jobid || frame_data._jobid;
			if (!target_jobid) {
				return;
			}

			// 获取任务点数据
			const attachment: Attachment | undefined = (knowCardWin.attachments as any[]).find((attachment) => {
				const attachment_jobid = attachment.jobid || attachment.property._jobid;
				if (!attachment_jobid) {
					return false;
				}
				return String(attachment_jobid) === String(target_jobid);
			});

			// 任务点去重
			if (attachment && searchedJobs.find((job) => job.mid === attachment.property.mid) === undefined) {
				const { name, title, bookname, author } = attachment.property;
				const jobName = name || title || (bookname ? bookname + author : undefined) || '未知任务';

				const work_type = attachment.job ? 'job' : attachment.isPassed ? 'finished' : 'not-job';

				let func: { (): Promise<any> } | undefined;

				if (videojs) {
					if (!CXProject.scripts.study.cfg.enableMedia) {
						const msg = `音视频自动学习功能已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
						$message.warn({ content: msg, duration: 10 });
						$console.warn(msg);
					} else {
						if (
							// 未完成
							work_type === 'job' ||
							// 重复学习
							(work_type === 'finished' && opts.restudy) ||
							// 强制学习
							(work_type === 'not-job' && opts.forceLearn)
						) {
							func = () => {
								const msg =
									`即将${
										work_type === 'finished' && opts.restudy
											? '重新'
											: work_type === 'not-job' && opts.forceLearn
											? '强制'
											: ''
									}播放 : ` + jobName;
								$message.info({ content: msg });
								$console.log(msg);
								return JobRunner.media(opts, win.document);
							};
						}
					}
				} else if (chapterTest) {
					if (!CXProject.scripts.study.cfg.enableChapterTest) {
						const msg = `章节测试自动答题功能已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
						$message.warn({ content: msg, duration: 10 });
						$console.warn(msg);
					} else {
						const status = win.document.querySelector<HTMLElement>('.testTit_status');

						// 已完成
						if (status?.classList.contains('testTit_status_complete')) {
							const msg = `章节测试已完成 : ` + jobName;
							$message.success({ content: msg });
							$console.log(msg);
						} else {
							if (
								// 未完成
								work_type === 'job' ||
								// / 强制学习
								(work_type === 'not-job' && CommonProject.scripts.settings.cfg['work-when-no-job'])
							) {
								if (opts.workOptions.answererWrappers === undefined || opts.workOptions.answererWrappers.length === 0) {
									answerWrapperEmptyWarning(0);
								} else {
									func = () => {
										const msg = `开始答题 : ` + jobName;
										$message.info({ content: msg });
										$console.log(msg);
										return JobRunner.chapter(root, opts.workOptions);
									};
								}
							}
							if (work_type === 'not-job' && CommonProject.scripts.settings.cfg['work-when-no-job'] === false) {
								const msg = `当前作业 ${jobName} 不是任务点，但待完成，如需开启自动答题请前往：通用-全局设置，开启强制答题。`;
								$message.warn({ content: msg });
								$console.warn(msg);
							}
						}
					}
				} else if (read || pptWithAudio || timereader) {
					if (!CXProject.scripts.study.cfg.enablePPT) {
						const msg = `PPT/书籍阅读功能已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
						$message.warn({ content: msg, duration: 10 });
						$console.warn(msg);
					} else {
						if (attachment.job) {
							func = () => {
								const msg = `正在学习 : ` + jobName;
								$message.info({ content: msg });
								$console.log(msg);
								if (read) {
									return JobRunner.read(win);
								} else if (timereader) {
									return JobRunner.timereader(timereader as HTMLIFrameElement);
								} else {
									return JobRunner.readPPTWithAudio(win);
								}
							};
						}
					}
				} else if (hyperlink) {
					if (!CXProject.scripts.study.cfg.enableHyperlink) {
						const msg = `链接任务点已被关闭（在上方菜单栏，超星学习通-课程学习中开启）。${jobName} 即将跳过`;
						$message.warn({ content: msg, duration: 10 });
						$console.warn(msg);
					} else {
						if (attachment.job) {
							func = () => {
								const msg = `正在完成链接阅读任务 : ` + jobName;
								$message.info({ content: msg });
								$console.log(msg);
								return JobRunner.hyperlink(hyperlink);
							};
						}
					}
				}

				const job = {
					mid: attachment.property.mid,
					attachment: attachment,
					func: func
				};

				searchedJobs.push(job);

				return job;
			}
		}
	};

	let job;

	for (const iframe of searchIFrame(knowCardWin.document)) {
		job = search(iframe);
		if (job) {
			return job;
		}
	}

	return job;
}

/**
 * 永久固定显示视频进度
 */
export function fixedVideoProgress() {
	if (state.study.videojs) {
		const { bar } = domSearch({ bar: '.vjs-control-bar' }, state.study.videojs as any);
		if (bar) {
			bar.style.opacity = '1';
		}
	}
}

/**
 * 任务点运行器
 */
const JobRunner = {
	/**
	 * 播放视频和音频
	 */
	async media(
		setting: {
			playbackRate: number;
			volume: number;
			videoQuizStrategy: VideoQuizStrategy;
		},
		doc: Document
	) {
		const { playbackRate = 1, volume = 0 } = setting;

		const media = await waitForMedia({ root: doc });

		// @ts-ignore
		const { videojs } = domSearch({ videojs: '#video,#audio' }, doc);

		if (!videojs || !media) {
			$console.error('视频检测不到，请尝试刷新或者手动切换下一章。');
			return;
		}

		state.study.videojs = videojs;
		// @ts-ignore
		top.currentMedia = media;

		// 固定视频进度
		fixedVideoProgress();

		// 随机作答视频内题目
		if (setting.videoQuizStrategy === 'random') {
			const loop = async () => {
				const submitBtn = () => doc.querySelector<HTMLElement>('#videoquiz-submit');
				if (submitBtn()) {
					const list = Array.from(doc.querySelectorAll<HTMLElement>('.ans-videoquiz-opt label'));
					const answer = list[Math.floor(Math.random() * list.length)];
					answer?.click();
					submitBtn()?.click();
					await $.sleep(3000);
					// 隐藏视频内题目元素
					const container = doc.querySelector<HTMLElement>('#video .ans-videoquiz');
					const components = Array.from(doc.querySelectorAll<HTMLElement>('.x-component-default'));
					if (container) {
						container.remove();
					}
					if (components.length) {
						for (const com of components) {
							com.style.display = 'none';
						}
					}
				}
				await $.sleep(3000);
				await loop();
			};
			loop();
		}

		/**
		 * 视频播放
		 */
		return new Promise<void>((resolve, reject) => {
			// 检测视频
			const reloadInterval = setInterval(() => {
				const errorDiv = doc.querySelector<HTMLElement>('.vjs-modal-dialog-content');
				if (
					['视频文件损坏', '网络错误导致视频下载中途失败', '视频因格式不支持', '网络的问题无法加载'].some((s) =>
						errorDiv?.innerText.includes(s)
					)
				) {
					$console.error('检测到视频加载失败，即将跳过视频。');
					$message.error('检测到视频加载失败，即将跳过视频。');
					setTimeout(resolve, 3000);
				}
			}, 3000);

			const playFunction = async () => {
				// 这里先判断，再检测，否则后续添加多个 await 会导致视频启动等待时间过长，导致用户误认为脚本失效
				if (hasFaceRecognition()) await waitForFaceRecognition();
				if (hasNewFaceRecognition()) await waitForNewFaceRecognition();
				if (media.ended === false) {
					await $.sleep(1000);
					media.play();
					media.playbackRate = playbackRate;
				}
			};

			media.addEventListener('pause', playFunction);

			media.addEventListener('ended', () => {
				media.removeEventListener('pause', playFunction);
				$console.log('视频播放完毕');
				clearInterval(reloadInterval);
				resolve();
			});

			$console.log('视频开始播放');
			media.volume = volume;

			// 重置视频进度
			media.currentTime = 0;

			// 使用 setTimeout 解决 The play() request was interrupted by a call to pause() 问题
			setTimeout(() => {
				playMedia(() => media.play())
					.then(() => {
						media.playbackRate = playbackRate;
					})
					.catch(reject);
			}, 200);
		});
	},
	/**
	 * 阅读，PPT
	 */
	async read(win: Window & { finishJob?: Function }) {
		const finishJob = win.finishJob;
		if (finishJob) finishJob();
		await $.sleep(3000);
	},
	/**
	 * 时间阅读
	 */
	async timereader(iframe: HTMLIFrameElement) {
		const src = iframe.getAttribute('src')?.toString() || '';
		const timing = src ? parseInt(new URL(src).searchParams.get('timing')?.toString() || '60') : 60;
		$message.info({
			content: `正在学习长时阅读任务，请稍等，不要切换..（预计${(timing + 3) * 3}秒）`,
			duration: (timing + 3) * 3
		});
		// 这里依靠 onactive 第一个跨域处理程序，等待处理后继续即可
		// 一共有三步，第一步等待timing，然后切换正文页，然后是封底页，最后点击一次PPT文档切换界面，即可完成任务
		await $.sleep((timing + 3) * 3 * 1000);
		$message.success('长时阅读任务完成！');
		await $.sleep(5000);
	},
	/**
	 * 章节测验
	 */
	async chapter(
		frame: HTMLIFrameElement,
		{
			answererWrappers,
			period,
			upload,
			thread,
			stopSecondWhenFinish,
			redundanceWordsText,
			answerSeparators,
			answerMatchMode
		}: CommonWorkOptions
	) {
		if (answererWrappers === undefined || answererWrappers.length === 0) {
			return answerWrapperEmptyWarning(0);
		}

		$console.info('开始章节测试');
		const visual_state = CommonProject.scripts.render.cfg.visual;

		const frameWindow = frame.contentWindow;
		const { TiMu } = domSearchAll({ TiMu: '.TiMu' }, frameWindow!.document);

		// 最大化面板
		CORSUtils.panelNormal();
		CommonProject.scripts.workResults.methods.init();
		// 固定显示答题结果面板
		CORSUtils.pinWorkPanel();

		const chapterTestTaskQuestionTitleTransform = (titles: (HTMLElement | undefined)[]) => {
			const removed = removeRedundantWords(
				titles.map((t) => (t ? optimizationElementWithImage(t, true).innerText : '')).join(','),
				redundanceWordsText.split('\n')
			);

			return (
				removed
					.trim()
					/** 超星旧版作业题目冗余数据 */
					.replace(/^\d+[。、.]/, '')
					.replace(/（\d+\.\d+分）/, '')
					.replace(/\(..题, \d+?分\)/, '')
					.replace(/\(..题, \d+\.\d+分\)/, '')
					.replace(/[[(【（](..题|名词解释|完形填空|阅读理解)[\])】）]/, '')
					.trim()
			);
		};

		/** 新建答题器 */
		const worker = new OCSWorker({
			root: TiMu,
			elements: {
				title: '.Zy_TItle .clearfix',
				/**
				 * 兼容各种选项
				 *
				 * ul li .after 单选多选
				 * ul li label:not(.after) 判断题
				 * ul li textarea 填空题
				 */
				options: 'ul li .after,ul li textarea,ul textarea,ul li label:not(.before)',
				type: 'input[id^="answertype"]',
				lineAnswerInput: '.line_answer input[name^=answer]',
				lineSelectBox: '.line_answer_ct .selectBox '
			},
			thread: thread ?? 1,
			answerSeparators: answerSeparators.split(',').map((s) => s.trim()),
			answerMatchMode: answerMatchMode,
			/** 默认搜题方法构造器 */
			answerer: (elements, ctx) => {
				const title = chapterTestTaskQuestionTitleTransform(elements.title);
				if (title) {
					const typeInput = elements.type[0] as HTMLInputElement;

					return CommonProject.scripts.apps.methods.searchAnswerInCaches(title, async () => {
						await $.sleep((period ?? 3) * 1000);
						return defaultAnswerWrapperHandler(answererWrappers, {
							type: (typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined) || 'unknown',
							title,
							options:
								ctx.type === 'completion'
									? ''
									: ctx.elements.options.map((o) => optimizationElementWithImage(o, true).innerText).join('\n')
						});
					});
				} else {
					throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
				}
			},

			work: async (ctx) => {
				const { elements, searchInfos } = ctx;
				const typeInput = elements.type[0] as HTMLInputElement;
				const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

				if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
					const resolver = createDefaultQuestionResolver(ctx)[type];

					const handler: DefaultWork<any>['handler'] = (type, answer, option, ctx) => {
						if (type === 'judgement' || type === 'single' || type === 'multiple') {
							// 检查是否已经选择
							const checked =
								option?.parentElement?.querySelector('label input')?.getAttribute('checked') === 'checked' ||
								// 适配2023/9月最新版本
								option?.parentElement?.getAttribute('aria-checked') === 'true';
							if (checked) {
								// 跳过
							} else {
								option?.click();
							}
						} else if (type === 'completion' && answer.trim()) {
							const text = option?.parentElement?.querySelector('textarea');
							const textareaFrame = option?.parentElement?.querySelector('iframe');
							if (text) {
								text.value = answer;
							}
							if (textareaFrame?.contentDocument) {
								textareaFrame.contentDocument.body.innerHTML = answer;
							}
							if (option?.parentElement?.parentElement) {
								/** 如果存在保存按钮则点击 */
								$el('[onclick*=saveQuestion]', option.parentElement.parentElement)?.click();
							}
						}
					};

					return await resolver(
						searchInfos,
						elements.options.map((option) => optimizationElementWithImage(option)),
						handler
					);
				}
				// 连线题自定义处理
				else if (type && type === 'line') {
					for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
						let ans = answers;
						if (ans.length === 1) {
							ans = splitAnswer(ans[0]);
						}
						if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
							//  选择答案
							for (let index = 0; index < elements.lineSelectBox.length; index++) {
								const box = elements.lineSelectBox[index];
								if (ans[index]) {
									$el(`li[data=${ans[index]}] a`, box)?.click();
									await $.sleep(200);
								}
							}

							return { finish: true };
						}
					}

					return { finish: false };
				}

				return { finish: false };
			},

			/** 完成答题后 */
			async onResultsUpdate(curr, _, res) {
				CommonProject.scripts.workResults.methods.setResults(
					simplifyWorkResult(res, chapterTestTaskQuestionTitleTransform)
				);

				if (curr.result?.finish) {
					CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
						simplifyWorkResult([curr], chapterTestTaskQuestionTitleTransform)
					);
				}
				CommonProject.scripts.workResults.methods.updateWorkStateByResults(res);

				// 没有完成时随机作答
				if (curr.result?.finish === false && curr.resolved === true) {
					const options = curr.ctx?.elements?.options || [];

					const typeInput = curr.ctx?.elements?.type[0] as HTMLInputElement | undefined;
					const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

					const commonSetting = CommonProject.scripts.settings.cfg;

					if (
						commonSetting['randomWork-choice'] &&
						(type === 'judgement' || type === 'single' || type === 'multiple')
					) {
						$console.log('正在随机作答');

						const option = options[Math.floor(Math.random() * options.length)];
						// @ts-ignore 随机选择选项
						option?.parentElement?.querySelector('a,label')?.click();
					} else if (commonSetting['randomWork-complete'] && type === 'completion') {
						$console.log('正在随机作答');

						// 随机填写答案
						for (const option of options) {
							const textarea = option?.parentElement?.querySelector('textarea');
							const completeTexts = commonSetting['randomWork-completeTexts-textarea'].split('\n').filter(Boolean);
							const text = completeTexts[Math.floor(Math.random() * completeTexts.length)];
							const textareaFrame = option?.parentElement?.querySelector('iframe');

							if (text) {
								if (textarea) {
									textarea.value = text;
								}
								if (textareaFrame?.contentDocument) {
									textareaFrame.contentDocument.body.innerHTML = text;
								}
							} else {
								$console.error('请设置随机填空的文案');
							}

							await $.sleep(500);
						}
					}
				}
			},
			async onElementSearched(elements) {
				const typeInput = elements.type[0] as HTMLInputElement;
				const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

				/** 判断题转换成文字，以便于答题程序判断 */
				if (type === 'judgement') {
					elements.options.forEach((option) => {
						const opt = option?.textContent?.trim() || '';
						if (opt.includes('对') || opt.includes('错')) {
							// 2023/8/5日后超星已修复判断题，将图片修改成文字，如果已经有对错的文本，则不需要再转换
						}
						// 如果是英语的对错题目，他是一个英文单词 True,False
						else if (opt === 'True') {
							option.textContent = '√';
						} else if (opt === 'False') {
							option.textContent = 'x';
						}
						// 支持香港地区的繁体字
						else if (opt === '對') {
							option.textContent = '√';
						} else if (opt === '錯') {
							option.textContent = 'x';
						} else {
							const ri = option.querySelector('.ri');
							const span = document.createElement('span');
							span.innerText = ri ? '√' : '×';
							option.appendChild(span);
						}
					});
				}
			}
		});

		const results = await worker.doWork();

		const msg = `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。`;
		$console.info(msg);
		$message.info({ content: msg, duration: stopSecondWhenFinish });
		await $.sleep(stopSecondWhenFinish * 1000);

		// 处理提交
		await worker.uploadHandler({
			type: upload,
			results,
			async callback(finishedRate, uploadable) {
				const msg = `完成率 ${finishedRate.toFixed(2)}% :  ${uploadable ? '3秒后将自动提交' : '3秒后将自动保存'} `;
				$console.info(msg);
				$message.success({ content: msg, duration: 3 });

				await $.sleep(3000);

				if (uploadable) {
					// @ts-ignore 提交
					frameWindow.btnBlueSubmit();

					await $.sleep(3000);
					/** 确定按钮 */
					// @ts-ignore 确定
					frameWindow.submitCheckTimes();
					// @ts-ignore 2024/4 更新后上方函数无法关闭弹窗，需要手动关闭确定弹窗
					top.$('#workpop').hide();
				} else {
					// @ts-ignore 禁止弹窗
					frameWindow.alert = () => {};
					// @ts-ignore 暂时保存
					frameWindow.noSubmit();
				}
			}
		});

		// 还原尺寸状态
		if (visual_state === 'minimize' && CommonProject.scripts.render.cfg.visual !== 'minimize') {
			CORSUtils.panelMinimize();
		}

		worker.emit('done');
	},
	/**
	 * 带音频的PPT
	 */
	async readPPTWithAudio(win: Window & { swiperNext?: Function }) {
		// 关闭音视频声音
		win.document.querySelectorAll('audio').forEach((audio) => {
			audio.addEventListener('play', () => {
				audio.muted = true;
			});
		});

		// 阅读PPT
		const len = win.document.querySelectorAll('.swiper-container .swiper-slide').length;
		for (let index = 0; index < len; index++) {
			win.swiperNext?.();
			await $.sleep(1000);
		}
		await $.sleep(3000);
	},
	/**
	 * 链接任务点
	 */
	async hyperlink(a: HTMLElement) {
		// 修改点击事件，防止出现弹窗
		const _click = a.onclick;
		a.onclick = () => false;
		// 点击完成
		a.click();
		// 还原点击事件
		a.onclick = _click;
		await $.sleep(3000);
	}
};

/**
 * cx 题目类型 ：
 * 0 单选题
 * 1 多选题
 * 2 简答题
 * 3 判断题
 * 4 填空题
 * 5 名词解释
 * 6 论述题
 * 7 计算题
 * 8 其他题(大概率是填空题)
 * 9 分录题
 * 10 资料题
 * 11 连线题
 * 14 完形填空
 * 15 阅读理解
 */
function getQuestionType(
	val: number
): 'single' | 'multiple' | 'judgement' | 'completion' | 'line' | 'fill' | 'reader' | undefined {
	return val === 0
		? 'single'
		: val === 1
		? 'multiple'
		: val === 3
		? 'judgement'
		: [2, 4, 5, 6, 7, 8, 9, 10].some((t) => t === val)
		? 'completion'
		: val === 11
		? 'line'
		: val === 14
		? 'fill'
		: val === 15
		? 'reader'
		: undefined;
}

/** 阅读理解和完形填空的共同处理器 */
async function readerAndFillHandle(searchInfos: SearchInformation[], list: HTMLElement[]) {
	for (const answers of searchInfos.map((info) => info.results.map((res) => res.answer))) {
		let ans = answers;

		if (ans.length === 1) {
			ans = splitAnswer(ans[0]);
		}

		if (ans.filter(Boolean).length !== 0 && list.length !== 0) {
			for (let index = 0; index < ans.length; index++) {
				const item = list[index];
				if (item) {
					/** 获取每个小题中的准确答案选项 并点击 */
					$el(`span.saveSingleSelect[data="${ans[index]}"]`, item)?.click();
					await $.sleep(200);
				}
			}

			return { finish: true };
		}
	}

	return { finish: false };
}

function hasFaceRecognition() {
	// 人脸元素有时候 src 属性为空字符串，所以这里需要判断 src 是否为空字符串，如是则人脸识别会出现。
	const faces = $$el<HTMLImageElement>('#fcqrimg', top?.document);
	let active = false;
	for (const face of faces) {
		const src = face.getAttribute('src');
		if (src) {
			active = true;
			break;
		}
	}
	return active;
}

function hasNewFaceRecognition() {
	const faces = $$el<HTMLImageElement>('.chapterVideoFaceMaskDiv', top?.document);
	let active = false;
	for (const face of faces) {
		if (face.style.display !== 'none') {
			active = true;
			break;
		}
	}
	return active;
}

/**
 * 等待新版人脸识别，视频开头会出现的人脸识别
 */
function waitForNewFaceRecognition() {
	let notified = false;

	return new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			// 人脸元素有时候 src 属性为空字符串，所以这里需要判断 src 是否为空字符串，如是则人脸识别会出现。
			const active = hasNewFaceRecognition();
			if (active) {
				if (!notified) {
					notified = true;
					const msg = '检测到人脸识别，请手动进行识别后脚本才会继续运行。';
					if (CXProject.scripts.study.cfg.notifyWhenHasFaceRecognition) {
						CommonProject.scripts.settings.methods.notificationBySetting(msg, { duration: 0 });
					}
					$message.warn({ content: msg, duration: 0 });
					$console.warn(msg);
				}
			} else {
				clearInterval(interval);
				resolve();
			}
		}, 3000);
	});
}
/**
 * 等待人脸识别
 */
function waitForFaceRecognition() {
	let notified = false;

	return new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			// 人脸元素有时候 src 属性为空字符串，所以这里需要判断 src 是否为空字符串，如是则人脸识别会出现。
			const active = hasFaceRecognition();
			if (active) {
				if (!notified) {
					notified = true;
					const msg = '检测到人脸识别，请手动进行识别后脚本才会继续运行。';
					if (CXProject.scripts.study.cfg.notifyWhenHasFaceRecognition) {
						CommonProject.scripts.settings.methods.notificationBySetting(msg, { duration: 0 });
					}
					$message.warn({ content: msg, duration: 0 });
					$console.warn(msg);
				}
			} else {
				clearInterval(interval);
				resolve();
			}
		}, 3000);
	});
}

/**
 * 答题程序位于其他 iframe 中，而 methods.pin 等 是依赖于 setTab 方法的，所以需要重新定义一个顶层函数来调用 pin 方法
 * 跨域调用
 */

const CORSUtils = {
	pinWorkPanel: cors.defineTopFunction(() => {
		CommonProject.scripts.render.methods.pin(CommonProject.scripts.workResults);
	}),
	panelNormal: cors.defineTopFunction(() => {
		CommonProject.scripts.render.methods.normal();
	}),
	panelMinimize: cors.defineTopFunction(() => {
		CommonProject.scripts.render.methods.minimize();
	})
};
