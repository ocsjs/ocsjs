import { $, $elements, Project, Script, $message, $modal, $el, $$el, $ui } from 'easy-us';
import {
	OCSWorker,
	StringUtils,
	createDefaultQuestionResolver,
	defaultWorkTypeResolver,
	defaultAnswerWrapperHandler,
	WorkResult,
	resolveJudgement,
	QuestionTypes
} from '@ocsjs/core';
import { $msgwc, playMedia, CommonWorkOptions } from '../utils';
import { createSteps } from '../utils/ui';
import { restudy, volume, workNotes } from '../utils/configs';
import { waitForElement } from '../utils/study';
import {
	DEFAULT_DECK_SELECTORS,
	analyzeStudentCardsDeck,
	collectUnreadTargets,
	describeStudentCardsDeck
} from './yuketang-courseware-core';
import { CommonProject } from './common';
import { $console, BackgroundProject } from './background';
import { FontDecryptor, findFontUrls, listFontFaces, watchElements } from '../utils/font-decrypt';
import type { WatchController } from '../utils/font-decrypt';
import {
	commonWork,
	buildAnswererEnv,
	createCommonAnswerer,
	dynamicWorkTips,
	extractTextWithImages,
	removeRedundantWords,
	simplifyWorkResult,
	updateDynamicResult
} from '../utils/work';

import debounce from 'lodash/debounce';

/**
 * 雨课堂作业/考试字体解密用的参考特征表（FRB2 位打包格式，wght 250 字重特征）。
 * 由官方 Source Han Sans SC VF 默认实例（ExtraLight）离线生成
 * （生成脚本见 .codebuddy/font_analysis/export_frb2_tables.py），
 * 与平台加密方式无关，无需随平台改字体而更新。
 */
const YKT_EXAM_REF_TABLE_URL = 'https://cdn.ocsjs.com/resources/font/font_ref_yuketang.bin';

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined,
		is_ai_watch_mode: false
	},
	courseware: {
		/** 驱动是否在运行，防止 history 变化时重入 */
		running: false,
		/** 上次处理的课件标识，避免同一课件重复运行 */
		lastDeckId: ''
	}
};

export const YKTProject = Project.create({
	name: '雨课堂',
	domains: [
		'yuketang.cn',
		// 雨课堂考试域名
		'xuetangx.com',
		'gdufemooc.cn'
	],
	scripts: {
		guide: new Script({
			name: '💡 使用提示',
			matches: [
				['雨课堂课程列表', '/v2/web/index'],
				['学习内容界面', '/v2/web/studentLog'],
				['长江雨课堂手机版主页', '/m/v2/course/normalcourse/logs'],
				['课堂界面', '/v2/web/student-lesson-report']
			],
			namespace: 'yuketang.study.guide',
			configs: {
				notes: {
					defaultValue: createSteps(['登录网课平台', '点击课程中任意章节进入学习', '等待脚本自动运行']).outerHTML
				}
			},
			oncomplete(...args) {
				// 手机版，点击视频自动检测并跳转电脑版学习
				if (location.href.includes('/m/v2/course/normalcourse/logs')) {
					return $message.info('请点击任意视频，进入自动学习。');
				}
				if (location.href.includes('/v2/web/student-lesson-report')) {
					return $message.info('课堂任务不支持学习，请切换到视频、作业等任务。');
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
		upsupportNote: new Script({
			name: '不支持提示',
			matches: [['课堂界面', '/v2/web/student-lesson-report']],
			hideInPanel: true,
			oncomplete() {}
		}),
		/**
		 * studentCards 课件自动完成：覆盖图文页（PPT/幻灯片）、视频页、习题页及混合课件。
		 * 原「PPT自动阅读」脚本能力有限（仅点击 .noRead 后即提示手动切换），这里升级为
		 * 状态驱动的主循环：读状态 -> 决策 -> 执行（翻页/播视频/答题）-> 再读状态，直到完成。
		 */
		courseware: new Script({
			name: '📚 课件自动完成',
			matches: [
				['PPT/图文课件', /v2\/web\/studentCards\/.*\/ppt/],
				['视频课件', /v2\/web\/studentCards\/.*\/video/],
				['课件页面', /v2\/web\/studentCards\//]
			],
			namespace: 'yuketang.study.courseware',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'自动完成当前课件：图文逐页阅读、视频播放至结束、习题自动作答（需配置题库）。',
						'混合课件会按「视频 → 图文 → 习题」顺序自动推进。',
						'如果页面结构有变化导致未识别，脚本会停止并给出提示，请反馈页面结构。'
					]).outerHTML
				},
				problemWork: {
					label: '习题自动作答',
					attrs: { type: 'checkbox', title: '课件内出现习题时自动搜题作答（需配置题库）' },
					defaultValue: false
				},
				readInterval: {
					label: '图文停留时长',
					tag: 'select',
					options: [
						['1000', '1 秒'],
						['1500', '1.5 秒'],
						['3000', '3 秒'],
						['5000', '5 秒']
					],
					defaultValue: '1500'
				},
				volume: volume,
				playbackRate: {
					label: '视频倍速',
					tag: 'select',
					defaultValue: '1',
					options: [
						['1', '1 x'],
						['1.25', '1.25 x'],
						['1.5', '1.5 x'],
						['2.0', '2.0 x']
					]
				}
			},
			async oncomplete() {
				state.courseware.lastDeckId = coursewareIdFromUrl();
				await runStudentCardsCourseware({
					volume: this.cfg.volume,
					playbackRate: Number(this.cfg.playbackRate) || 1,
					problemWork: this.cfg.problemWork,
					readInterval: Number(this.cfg.readInterval) || 1500
				});
			},
			/**
			 * 雨课堂是 SPA，课件之间切换走 history 而不重新加载页面，oncomplete 只触发一次。
			 * 这里监听路由变化：课件标识变了才重新运行，同一课件不重复触发。
			 */
			onhistorychanged() {
				const id = coursewareIdFromUrl();
				if (!id || id === state.courseware.lastDeckId) return;
				state.courseware.lastDeckId = id;
				setTimeout(() => {
					runStudentCardsCourseware({
						volume: this.cfg.volume,
						playbackRate: Number(this.cfg.playbackRate) || 1,
						problemWork: this.cfg.problemWork,
						readInterval: Number(this.cfg.readInterval) || 1500
					});
				}, 1500);
			}
		}),
		/**
		 * 旧版 v2/web 学习已废弃、目前大部分雨课堂主要为  ai-workspace， 其中存在区别： 部分 ai 课存在 AI学伴（右侧智能体功能）
		 */
		ai: new Script({
			name: '🖥️ 课程学习',
			matches: [
				['学习中心', '/v2/web/index'],
				['课程列表', '/v2/web/studentLog'],
				['AI学伴课程界面', '/ai-workspace/lms-graph'],
				['AI学伴课程界面手机版', '/ai-workspace/lms-graph-mobile']
			],
			namespace: 'yuketang.study.ai',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'请点击任意小节，脚本会自动运行，并自动下一节。',
						'修改音量、倍速后请刷新页面使设置生效。',
						'课件/PPT 等任务请手动进入触发自动阅读',
						['遇到作业任务点时可自动搜题作答', '（需在 通用-全局设置 中配置题库）。']
					]).outerHTML
				},
				restudy: restudy,
				problemWork: {
					label: '作业自动答题',
					attrs: { type: 'checkbox', title: '遇到作业任务点时自动搜题作答并按设置提交（需配置题库）' },
					defaultValue: true
				},
				discussMode: {
					label: '讨论任务模式',
					tag: 'select',
					defaultValue: 'random' as 'random' | 'first' | 'none',
					options: [
						['random', '随机采用他人评论'],
						['first', '采用第一条评论'],
						['none', '不评论']
					]
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
				if (location.href.includes('ai-workspace/lms-graph-mobile')) {
					$message.warn('即将切换到电脑版AI课程...');
					await $.sleep(3000);
					location.href = location.href.replace('lms-graph-mobile', 'lms-graph');
					return;
				}

				if (location.href.includes('/v2/web/index') || location.href.includes('/v2/web/studentLog')) {
					BackgroundProject.scripts.render.methods.pin(this);
					$message.info('请手动进入到任意章节开始自动学习。');
					return;
				}

				// 监听音量
				this.onConfigChange(
					'volume',
					debounce((val) => {
						if (state.study.is_ai_watch_mode) {
							if (state.study.currentMedia) state.study.currentMedia.volume = val;
						} else {
							$message.info('音量设置已修改，刷新页面后生效');
						}
					}, 200)
				);

				// 监听速度
				this.onConfigChange(
					'playbackRate',
					debounce((val) => {
						if (state.study.is_ai_watch_mode) {
							if (state.study.currentMedia) state.study.currentMedia.playbackRate = val;
						} else {
							$message.info('倍速设置已修改，刷新页面后生效');
						}
					}, 200)
				);

				const getJobs = () => Array.from(document.querySelectorAll<HTMLElement>('div.leaf-item'));
				const getJobName = () =>
					document.querySelector('.leaf-item.is-active .leaf-item-title')?.textContent || '未知任务点';
				const getJobTag = (el: HTMLElement) => (el.querySelector('.leaf-item-tag')?.textContent || '').trim();

				const getNextJob = () => {
					const jobs = getJobs();

					const active_index = jobs.findIndex((job) => job.classList.contains('is-active'));

					return jobs.find((job, i) => {
						const tag_text = getJobTag(job);
						const support = ['视频', '作业', '讨论', '图文'].includes(tag_text.trim());
						const finished = job.querySelector('[class*=yuanquangou]');
						return i > active_index && support && (this.cfg.restudy || !finished);
					});
				};

				try {
					$message.info('等待任务加载中...');
					await waitForElement('.detail-container', {
						timeout_seconds: 10 * 1000
					});
					await $.sleep(3000);
				} catch (e) {
					$message.error('元素加载失败，请刷新界面重试。');
				}

				// 现在界面会自动展开，无需手动展开章节，下列代码已废弃
				// 展开5次章节，确保所有章节都被展开
				const max_level = 5;
				for (let i = 0; i < max_level; i++) {
					document.querySelectorAll<HTMLElement>('.nav-item-title:not(.is-expand )').forEach((el) => el.click());
					await $.sleep(100);
				}

				const study = async () => {
					try {
						if ($el('.detail-container video')) {
							$msgwc.info('即将开始视频学习：' + getJobName());

							// AI数字人视频 （自动阅读）
							if (document.querySelector('.digital-human-video-element-selector')) {
								await ai_watch({
									volume: this.cfg.volume,
									playbackRate: this.cfg.playbackRate
								});
							} else {
								await watch({
									volume: this.cfg.volume,
									playbackRate: this.cfg.playbackRate
								});
							}

							await $.sleep(3000);
						}

						const forum = $el('.detail-container .lms-graph-forum');
						if (forum) {
							$msgwc.info('即将开始自动讨论：' + getJobName());
							// 评论模式复用「课程学习」脚本的 discussMode 设置
							await autoCommentYktForum(forum, this.cfg.discussMode);
							$msgwc.success('自动讨论完成');
							await $.sleep(3000);
						}

						if ($el('.detail-container .lms-graph-exercise')) {
							// 作业任务点：题目在 iframe（#iframeExerciseId -> /v2/web/iframe-exercise）内，
							// 与主页面同源，可通过 contentDocument 访问
							if (this.cfg.problemWork) {
								const exerciseIframe = $el('.detail-container .lms-graph-exercise iframe#iframeExerciseId') as
									| HTMLIFrameElement
									| undefined;
								if (!exerciseIframe) {
									$console.warn('作业任务点结构未识别（缺少 iframe#iframeExerciseId），跳过自动答题。');
								} else if (!exerciseIframe.contentDocument) {
									$console.warn('作业 iframe 无法访问（可能跨域），跳过自动答题。');
								} else {
									$message.info('检测到作业任务点，等待作业页面加载...');
									// 等 iframe 内题目区域渲染；waitFor 超时现在会抛异常，这里吞掉并视为加载失败，跳过自动答题
									const questionRoot = await waitForElement(
										() =>
											exerciseIframe.contentDocument?.querySelector<HTMLElement>('.container-problem .subject-item'),
										{ timeout_seconds: 20, check_period_ms: 200 }
									).catch(() => undefined);
									if (!questionRoot) {
										$console.warn('作业页面加载超时，跳过自动答题。');
									} else {
										// 题库检查/开始倒计时/控制面板由 commonWork 统一处理

										await new Promise<void>((resolve) => {
											commonWork({
												mount_script: this,
												workerProvider: (opts) => {
													return createYktEmbeddedWorkLoop(opts, exerciseIframe.contentDocument!, () => resolve());
												}
											});
										});

										$message.success('作业任务点答题完成。');
									}
								}
							}
							await $.sleep(3000);
						}

						// 图文任务点：若详情区存在“未读”标记，自动逐页阅读。
						// 无标记则完全跳过（不影响视频/讨论/作业流程，避免误操作）。
						const detail = $el('.detail-container');
						if (detail) {
							let round = 0;
							let readAny = false;
							// 未读数量不再下降说明点击无效，直接退出，避免跑满 30 轮空转
							let lastUnread = Infinity;
							while (round++ < 30) {
								const targets = collectUnreadTargets(detail as any, DEFAULT_DECK_SELECTORS);
								if (targets.length === 0) break;
								if (targets.length >= lastUnread) {
									$console.warn(`[yuketang] 图文未读数量未下降（${targets.length}），停止重试`);
									break;
								}
								lastUnread = targets.length;
								if (!readAny) {
									$msgwc.info('即将开始图文阅读：' + getJobName());
									readAny = true;
								}
								for (const target of targets) {
									(target as any)?.click?.();
									await $.sleep(800);
								}
								await $.sleep(500);
							}
							if (readAny) {
								$msgwc.success('图文阅读完成');
								await $.sleep(2000);
							}
						}
					} catch (e) {
						$console.error(`当前任务点无法完成，即将跳转下一节（${e}）`);
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
		exam: new Script({
			name: '自动考试',
			matches: [['考试界面', 'examination.xuetangx.com/exam/']],
			namespace: 'yuketang.study.exam',
			configs: {
				notes: workNotes
			},
			async onhistorychanged(type, ...args) {
				if (type !== 'pushed') return;

				await waitForElement('.exam-main--content .subject-item');
				commonWork({
					mount_script: this,
					workerProvider: (opts) => examination(opts)
				});
			},
			async oncomplete() {
				this.onhistorychanged?.('pushed');
			}
		})
	}
});

/**
 * AI学伴讨论任务点自动评论。
 * 结构依据样本 .codebuddy/yuketan_work/forum.html：
 *   评论列表：.forum-content .forum-item .comment-text
 *   输入框：  .forum-publish textarea.el-textarea__inner
 *   发送按钮：.prompt-send-btn（div；输入为空时带 .disabled，填充后由 Vue 移除，需等待解除禁用再点击）
 *   发言状态：.learning-space-control-unit .control-right .f12（已发言则跳过，防止重复评论）
 * 失败统一抛出错误，由调用方（study 循环）捕获并跳转下一节。
 */
async function autoCommentYktForum(forum: HTMLElement, discussMode: 'random' | 'first' | 'none') {
	// 防止重复评论：检测发言状态（未发言/已发言）
	const speakStatus = forum.querySelector('.learning-space-control-unit .control-right .f12')?.textContent?.trim();
	if (speakStatus?.includes('已发言')) {
		$message.info('当前讨论已发言，跳过评论步骤。');
		return;
	}

	if (discussMode === 'none') {
		$message.info('已设置为不进行评论，跳过评论步骤。');
		return;
	}

	// 等待输入框渲染（waitFor 超时抛出异常，信息由 timeout_message 指定）
	const textarea = (await waitForElement(
		() => forum.querySelector<HTMLTextAreaElement>('.forum-publish textarea.el-textarea__inner'),
		{ timeout_seconds: 20, check_period_ms: 500, timeout_message: '讨论区输入框加载超时。' }
	)) as HTMLTextAreaElement;

	const discusses = Array.from(forum.querySelectorAll('.forum-content .forum-item .comment-text'))
		.map((el) => (el.textContent || '').trim())
		.filter(Boolean);

	if (discusses.length === 0) {
		throw new Error('讨论区暂无评论可参考，无法自动评论。');
	}

	const content = discussMode === 'first' ? discusses[0] : discusses[Math.floor(Math.random() * discusses.length)];

	textarea.value = content;
	textarea.dispatchEvent(new Event('input', { bubbles: true }));

	// 填充后等待发送按钮解除禁用（.disabled 状态下点击无效）
	// waitFor resolve 时已保证元素存在（超时走 reject），此处断言为非空
	const send_btn = (await waitForElement(() => forum.querySelector<HTMLElement>('.prompt-send-btn:not(.disabled)'), {
		timeout_seconds: 10,
		check_period_ms: 500,
		timeout_message: '讨论区发送按钮未解除禁用，评论提交失败。'
	})) as HTMLElement;
	send_btn.click();
	await $.sleep(1000);
}

/** 雨课堂加密文字元素选择器（平台统一用此类标记密文） */
const YKT_ENCRYPTED_SELECTOR = '.xuetangx-com-encrypted-font';

/**
 * 各字体的解密器实例（懒创建）。
 * 以字体源（URL）为 key：同一字体映射表终身缓存复用；
 * SPA 切换到新作业/考试下发了新字体文件时，新 URL 会创建新的解密器，
 * 避免旧映射表误用到新置换字体上。
 */
const fontDecryptors = new Map<string, FontDecryptor>();

/** 页面动态内容监听器（SPA 路由切换时先 stop 再重建） */
let fontWatchController: WatchController | undefined;

/**
 * 雨课堂作业/考试界面加密字体动态解密。
 *
 * 加密原理：页面下发的 exam_font_*.ttf 是 SourceHanSansSC-VF 的子集，
 * 字体中码点 X 的字形轮廓实际画的是另一个字（每次下发的置换表不同），
 * 因此"静态映射表"方案不可行，必须对当前页面的字体实时破解。
 *
 * 动态场景：题目默认隐藏，点击题号才渲染题目内容。本实现通过
 * watchElements 监听 DOM 变化，新出现的加密文字自动增量解密——
 * 同一字体的映射表只完整破解一次并常驻内存，切题时只需破解
 * 新出现的少量字符（通常 0~10 字，毫秒级完成）。
 *
 * @see 算法详解见 utils/font-decrypt/bitmap.ts 文件头注释
 */
async function setupYuketangFontDecrypt(doc: Document = document) {
	// 停止上一次页面（SPA 路由切换）遗留的监听器，避免重复解密
	fontWatchController?.stop();
	fontWatchController = undefined;
	const dec_msg = $message.info({ content: '字体解密中...', duration: 0 });

	// 尝试等待加密文字元素渲染（SPA 异步加载）；超时也不返回——
	// 监听器会在加密文字后续出现时自动解密（如从其他页面 SPA 跳转进来）
	// 注意：不能用 waitForElement——它写死全局 document，而加密文字可能在
	// iframe 的 document 里（会白等整个超时）。这里按 doc 短轮询，即时命中。
	const waitStart = Date.now();
	// 正文已渲染且连续多次轮询均无密文：本题无加密文字（如纯公式题），提前放行，
	// 迟到的密文仍由下方 watchElements 监听器兜底解密
	let noCipherStable = 0;
	while (!doc.querySelector(YKT_ENCRYPTED_SELECTOR) && Date.now() - waitStart < 3000) {
		const bodyRendered = !!doc.querySelector('.container-problem .problem-body, .exam-body, .subject-item');
		noCipherStable = bodyRendered ? noCipherStable + 1 : 0;
		if (noCipherStable >= 3) {
			$console.log('题目已渲染且未检测到加密文字，跳过初始解密等待。');
			break;
		}
		await $.sleep(200);
	}
	if (!doc.querySelector(YKT_ENCRYPTED_SELECTOR)) {
		$console.log('暂未检测到加密文字，将持续监听页面变化。');
		dec_msg?.remove();
	}

	let firstDecrypt = true;
	const decryptEls = async (els: HTMLElement[]) => {
		// 只处理仍带加密标记的元素，并在任何异步操作【之前】改标为"解密中"：
		// 并发的重复调用（监听器/主动解密）会把这些元素过滤掉，
		// 否则【已解密的明文】会被再次过映射表（双重解密必然产生乱码）
		els = els.filter((el) => el.classList.contains('xuetangx-com-encrypted-font'));
		if (els.length === 0) {
			return;
		}
		for (const el of els) {
			el.classList.remove('xuetangx-com-encrypted-font');
			el.classList.add('xuetangx-com-font-decrypting');
		}

		// 解密失败的元素做失败标记（fail-open）：
		// 文字按原样（密文）保留，避免残留导致就绪判定每题白等超时
		const markFailed = (groupEls: HTMLElement[]) => {
			for (const el of groupEls) {
				el.classList.remove('xuetangx-com-font-decrypting');
				el.classList.add('xuetangx-com-font-decrypt-failed');
			}
		};

		// 字体源在每次解密时重新解析（惰性）：SPA 切换到新作业/考试时
		// 平台会下发新字体文件，不能使用初始化时缓存的旧 URL。
		// 雨课堂加密字体 URL 特征：fe_font/product/exam_font_*.ttf
		const findExamFontUrl = (): string | undefined => {
			const faces = listFontFaces(doc);
			// 1. @font-face 规则（族名含 exam/decrypt，或 src 匹配考试字体特征）
			const face = faces.find((f) => /exam|decrypt/i.test(f.family) || /exam_font|fe_font/.test(f.src));
			if (face) {
				return face.src;
			}
			// 2. 资源加载记录（findFontUrls 已改为读取目标 document 所属 window 的 performance）
			return findFontUrls(doc).find((u) => /exam_font|fe_font/.test(u));
		};

		// 考试字体可能晚于密文元素加载（@font-face 动态注入、字体文件异步请求），
		// 必须等待重试；绝不能 fallback 到其他字体——用错误字体破解出的
		// 垃圾映射比不解密更糟（密文被置换成另一套乱码且难以察觉）
		let examFontUrl = findExamFontUrl();
		const fontWaitStart = Date.now();
		while (!examFontUrl && Date.now() - fontWaitStart < 10_000) {
			await $.sleep(300);
			examFontUrl = findExamFontUrl();
		}
		if (!examFontUrl) {
			$console.warn(
				`[font-decrypt] 等待考试字体超时（@font-face=[${listFontFaces(doc)
					.map((f) => f.family)
					.join(', ')}], 字体文件=[${findFontUrls(doc).join(', ')}]），跳过解密。`
			);
			markFailed(els);
			return;
		}

		// 字体族匹配不到 @font-face 时，fallback 只允许使用考试字体
		const resolveFontSource = (family: string) => {
			const faces = listFontFaces(doc);
			return faces.find((f) => family.includes(f.family) || f.family.includes(family))?.src ?? examFontUrl;
		};

		// 按元素实际使用的 font-family 分组（可能一页多个置换字体）
		const groups = new Map<string, HTMLElement[]>();
		for (const el of els) {
			// 元素可能位于 iframe 内，必须用其所属 document 的 window 取计算样式
			const view = el.ownerDocument.defaultView ?? window;
			const family = (view.getComputedStyle(el).fontFamily || '').split(',')[0].replace(/["']/g, '').trim();
			const group = groups.get(family) ?? [];
			group.push(el);
			groups.set(family, group);
		}
		for (const [family, groupEls] of groups) {
			const fontSource = resolveFontSource(family);
			if (!fontSource) {
				$console.warn(`[font-decrypt] 未找到字体 ${family} 对应的字体文件，跳过解密。`);
				markFailed(groupEls);
				continue;
			}
			try {
				let decryptor = fontDecryptors.get(fontSource);
				if (!decryptor) {
					decryptor = await FontDecryptor.create(fontSource, {
						refTableUrl: YKT_EXAM_REF_TABLE_URL,
						// 雨课堂加密字体是可变字体（wght 250-900），必须锁定为特征表对应的默认实例字重
						fontWeight: '250'
					});
					fontDecryptors.set(fontSource, decryptor);
				}
				await decryptor.decrypt(groupEls);
				// 解密后必须移除加密字体类：元素文本已还原为明文，
				// 继续用加密字体渲染会显示成错误的字形
				for (const el of groupEls) {
					el.classList.remove('xuetangx-com-font-decrypting');
					el.classList.add('xuetangx-com-font-decrypted');
				}
				if (firstDecrypt) {
					firstDecrypt = false;
					if (dec_msg) dec_msg.textContent = '字体解密完成，切换题目时将自动解密新内容。';
				}
			} catch (err) {
				$console.error(`[font-decrypt] 字体 ${family} 解密失败：`, String(err));
				markFailed(groupEls);
			}
		}
		setTimeout(() => {
			dec_msg?.remove();
		}, 3000);
	};

	// 当前文档的解密处理器（供主动解密调用）
	activeDecryptHandler = decryptEls;
	// 监听 DOM：初始内容 + 题目切换等动态渲染出的加密文字自动增量解密
	fontWatchController = watchElements(doc, YKT_ENCRYPTED_SELECTOR, (found) => enqueueYktDecrypt(found));
	$console.log('字体动态解密已启动。');
}

/** 当前文档的解密处理器（由 setupYuketangFontDecrypt 设置） */
let activeDecryptHandler: ((els: HTMLElement[]) => Promise<void>) | undefined;
/** 解密调用串行队列（监听器与主动解密共用，防止并发重复解密） */
let decryptChain: Promise<void> = Promise.resolve();

/** 将一批元素送入解密串行队列（元素级去重在处理器内部完成） */
function enqueueYktDecrypt(els: HTMLElement[]): Promise<void> {
	const run = decryptChain.then(() => activeDecryptHandler?.(els));
	decryptChain = run.then(
		() => undefined,
		() => undefined
	);
	return run;
}

/**
 * 【API】立即解密 doc 中所有当前密文元素并等待完成。
 *
 * 答题程序读题前必须调用：不依赖监听器防抖/时序，直接同步触发解密，
 * 返回时 DOM 文本已稳定为明文（解密失败的元素按原样保留密文）。
 */
async function decryptYktNow(doc: Document): Promise<void> {
	await ensureYktFontDecrypt(doc);
	const els = Array.from(doc.querySelectorAll<HTMLElement>(YKT_ENCRYPTED_SELECTOR));
	if (els.length) {
		await enqueueYktDecrypt(els);
	}
	// 等所有已排队的解密（包括监听器触发的）完成
	await decryptChain;
}

let fontDecryptSetupPromise: Promise<void> | undefined;
/** 当前监听器绑定的 document（iframe 切换后 contentDocument 会变，需重新安装） */
let fontDecryptSetupDoc: Document | undefined;

/**
 * 确保字体动态解密已启动（按 document 幂等）。
 * 字体解密脚本（可由用户关闭）和答题程序（读题前必须有明文）共用此入口。
 * 注意：AI学伴流程中每个作业任务点都是新 iframe（新 contentDocument），
 * doc 变化时必须重新安装监听器，否则新页面的密文永远不会被解密。
 */
function ensureYktFontDecrypt(doc: Document = document): Promise<void> {
	if (!fontDecryptSetupPromise || fontDecryptSetupDoc !== doc) {
		fontDecryptSetupDoc = doc;
		fontDecryptSetupPromise = setupYuketangFontDecrypt(doc).catch((err) => {
			// 失败允许下次重试
			fontDecryptSetupPromise = undefined;
			fontDecryptSetupDoc = undefined;
			throw err;
		});
	}
	return fontDecryptSetupPromise;
}

/**
 * 从 .item-type 文本解析题型（如 "4.单选题(1分)"）。
 * 填空/简答统一按 completion 处理（无选项，逐空填写）。
 */
function parseYktQuestionType(typeText: string): 'single' | 'multiple' | 'judgement' | 'completion' | undefined {
	if (typeText.includes('单选')) {
		return 'single';
	}
	if (typeText.includes('多选')) {
		return 'multiple';
	}
	if (typeText.includes('判断')) {
		return 'judgement';
	}
	// 填空/简答/问答/主观题统一按 completion 处理（无选项，直接填充答案）
	if (
		typeText.includes('填空') ||
		typeText.includes('简答') ||
		typeText.includes('问答') ||
		typeText.includes('主观')
	) {
		return 'completion';
	}
	return undefined;
}

/** 当前激活题目的标识（题号+题型，如 "4.单选题(1分)"），用于检测切题与防死循环 */
function currentYktQuestionMarker(doc: Document): string {
	return doc.querySelector('.container-problem .subject-item .item-type')?.textContent?.replace(/\s+/g, '') ?? '';
}

/**
 * 填充主观题的 UEditor 富文本编辑器。
 *
 * 优先使用页面 UEditor API（`UE.getEditor(容器id).setContent`，
 * 会触发 contentchange 使"提交"按钮解除禁用）；API 不可用时
 * 直接写入编辑器 iframe 的 body 并派发 input 事件兜底。
 */
function fillYktUEditor(iframe: HTMLIFrameElement, answer: string) {
	// 纯文本答案转义为安全 HTML（按换行分段）
	const html =
		'<p>' +
		answer.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n+/g, '</p><p>') +
		'</p>';
	// UEditor 容器 id 形如 ueditor-<rand>（注意与 iframe 的 ueditor_<n> 下划线区分）
	const containerId = iframe.closest('[id^="ueditor-"]')?.id;
	const ue = (iframe.ownerDocument.defaultView as any)?.UE;
	if (containerId && ue) {
		try {
			const editor = ue.getEditor(containerId);
			// ready(fn)：编辑器未初始化完成时会延迟执行
			editor.ready(() => editor.setContent(html));
			return;
		} catch (err) {
			$console.warn('[answer] UEditor API 填充失败，尝试直接写入：', String(err));
		}
	}
	const body = iframe.contentDocument?.body;
	if (body) {
		body.innerHTML = html;
		body.dispatchEvent(new Event('input', { bubbles: true }));
	}
}

/**
 * 提交当前题目的答案。
 * 雨课堂平台切换题目不会自动保存答案，必须每题作答后立即点击"提交"。
 * 返回是否成功发起提交（按钮不可用说明本题无可提交内容）。
 */
async function submitYktCurrentQuestion(doc: Document, order: string): Promise<boolean> {
	/** 本题在导航中是否已出现完成标记（提交成功的可靠信号）。
	 *  注意必须用题号定位：提交成功后平台会自动切到下一题，active 已变化。
	 *  选择题等显示 .icon-status 图标；主观题提交后显示"未批改"文本状态（无图标）。 */
	const hasStatusMark = () => {
		const item = doc.querySelector(`.problems-aside .subject-item.J_order[data-order="${order}"]`);
		return (
			!!item?.querySelector('.icon-status') || !!item?.querySelector('.text-status')?.textContent?.includes('未批改')
		);
	};
	// 实测发现偶发"点击提交但未生效"（按钮恢复可用但无完成标记），需要重试
	for (let attempt = 0; attempt < 2; attempt++) {
		// 提交按钮可能会出现额外文本，例如（剩余 x 次 提交）
		const submitBtn = Array.from(
			doc.querySelectorAll<HTMLButtonElement>('.problem-box button.el-button--primary')
		).find((b) => b.textContent?.trim().includes('提交') && !b.disabled && !b.classList.contains('is-disabled'));
		if (!submitBtn) {
			// 按钮不可用：已提交成功（按钮变为"已提交"/禁用）或无答案可提交
			return attempt > 0 ? hasStatusMark() : false;
		}
		submitBtn.click();
		await $.sleep(1000);
		// 等待提交完成（以导航状态标记为准），超时进入重试判定
		const waitStart = Date.now();
		while (Date.now() - waitStart < 10_000) {
			if (hasStatusMark()) {
				return true;
			}
			await $.sleep(300);
		}
	}
	$console.error('未检测到完成状态。');
	return false;
}

/**
 * 等待当前题目"可用"。就绪条件（需连续两次满足，防 Vue 分批渲染与解密竞态）：
 *   1. 题目标识已渲染（切题后 marker 变化）
 *   2. 正文 .problem-body 有非空文本或图片（防止"题号先渲染、正文经 XHR 后到"时读到空/密文；
 *      纯公式题题干只有 img.kfformula，无文本）
 *   3. 无残留密文/解密中的元素（解密通过 decryptYktNow 主动触发，不依赖监听器时序）
 * 超时后放行（降级处理）。
 */
async function waitYktQuestionReady(prevMarker: string | null, doc: Document, timeoutMs = 15000) {
	const start = Date.now();
	// 1. 等题目渲染：首题等 marker 出现；切题后等 marker 变化
	while (Date.now() - start < timeoutMs) {
		const marker = currentYktQuestionMarker(doc);
		if (marker && marker !== prevMarker) {
			break;
		}
		await $.sleep(200);
	}
	// 2. 等"正文已渲染且已解密"
	let stable = 0;
	while (Date.now() - start < timeoutMs) {
		// 主动解密当前密文并等待完成（幂等；无密文时立即返回）
		await decryptYktNow(doc);
		// 纯公式/图片题题干没有文本（仅 img.kfformula 等），图片也算有效内容，
		// 否则会一直误判"正文未渲染"而等待到超时
		const body = doc.querySelector('.container-problem .problem-body');
		const hasContent = !!body?.textContent?.trim() || !!body?.querySelector('img');
		const hasCipher = !!doc.querySelector(
			`.container-problem ${YKT_ENCRYPTED_SELECTOR}, .container-problem .xuetangx-com-font-decrypting`
		);
		if (hasContent && !hasCipher) {
			stable++;
			if (stable >= 2) {
				return;
			}
		} else {
			stable = 0;
		}
		await $.sleep(200);
	}
	$console.warn(`[answer] 等待题目就绪超时（${timeoutMs}ms），将就绪状态降级继续。`);
}

/**
 * 雨课堂作业答题 worker（逐题切换作答）。
 *
 * 页面特点：同一时刻 DOM 中只有当前一题（.container-problem .subject-item），
 * 通过点击"下一题"或左侧题号切换，内容为 Vue 动态渲染且文字可能被字体加密。
 *
 * 流程（参考 zhs.ts 校内学分课 xnkWork 的逐题作答模式）：
 *   确保字体解密启动 -> 等题目渲染+解密 -> 搜题作答 -> 点"下一题" -> 循环
 */
/** 横线填空题的答案输入框选择器（class 为主，placeholder 兜底） */
const YKT_BLANK_INPUT_SELECTOR = 'input.blank-item-dynamic, input[placeholder="输入答案"]';

/**
 * 克隆题目元素用于文本提取，并将新版公式图片还原为 LaTeX 文本。
 *
 * 雨课堂新版公式题为 <img class="kfformula" src="data:image/png;base64,...">，
 * LaTeX 源码保存在 data-latex 属性（data-slatex 为反斜杠双写的转义版，仅作兜底）。
 * 若直接提取 img src，会向题干/选项注入大段 base64 文本导致搜题失败；
 * 这里在克隆体上将公式图片替换为 $...$ 包裹的 LaTeX 文本（不破坏页面显示），
 * 普通图片仍走 extractTextWithImages 的 URL 提取逻辑。
 */
function cloneYktForTextExtract(el: HTMLElement): HTMLElement {
	const clone = el.cloneNode(true) as HTMLElement;
	for (const img of Array.from(clone.querySelectorAll('img.kfformula'))) {
		const latex = img.getAttribute('data-latex') || (img.getAttribute('data-slatex') || '').replace(/\\\\/g, '\\');
		img.replaceWith(latex.trim() ? ` $${latex}$ ` : ' [公式] ');
	}
	return clone;
}

/**
 * 提取题干文本：横线填空题的答案输入框（placeholder="输入答案"）无文本内容，
 * 提取时会"消失"导致题库无法识别这是填空题；
 * 这里先克隆元素并把每个横线输入框替换为 ____ 文本再提取，
 * 如 "…内容包括：____、____、____、____。"
 */
function extractYktTitleText(el: HTMLElement): string {
	const clone = cloneYktForTextExtract(el);
	for (const input of Array.from(clone.querySelectorAll(YKT_BLANK_INPUT_SELECTOR))) {
		input.replaceWith('____');
	}
	return extractTextWithImages(clone).text;
}

function createYktAnswerWorker({
	answererWrappers,
	period,
	thread,
	redundanceWordsText,
	answerSeparators
}: CommonWorkOptions) {
	const redundanceWords = redundanceWordsText.split('\n').filter(Boolean);
	const titleTransform = (titles: (HTMLElement | undefined)[]) =>
		titles
			// 纯公式/图片题干 innerText 为空但仍是有效题目（公式会提取为 LaTeX 文本），不能过滤
			.filter((t) => !!t && (!!t.textContent?.trim() || !!t.querySelector('img')))
			.map((t) =>
				t
					? removeRedundantWords(
							StringUtils.of(extractYktTitleText(t)).nowrap(' ').nospace().toString().trim(),
							redundanceWords
					  )
					: ''
			)
			.join(',');

	/** 选项文本：取选项内容部分（去掉 A/B/C/D 字母与勾选框） */
	const optionText = (option: HTMLElement) => {
		// 判断题选项为 √/× 图标（无文本，input value="true/false"），
		// 用 value 合成文本供默认答案解析器匹配（对/错词表）
		const input = option.querySelector('input');
		if (input?.value === 'true') {
			return '对';
		}
		if (input?.value === 'false') {
			return '错';
		}
		const textEl = option.querySelector('.radioText, .checkboxText');
		// 经克隆提取：选项中的 kfformula 公式图片同样还原为 LaTeX 文本
		return extractTextWithImages(cloneYktForTextExtract((textEl as HTMLElement) ?? option)).text;
	};

	// OCSWorker 的 root 传字符串时会在【全局 document】上查询，
	// 而雨课堂作业在 iframe 内（AI学伴课程页内嵌 iframe-exercise），
	// 必须传元素数组；doWork 每次调用都会重新读取 root，
	// 因此数组内容由 runYktAnswerLoop 在每次作答前从目标 document 实时刷新。
	const questionRootRef: HTMLElement[] = [];

	const worker = new OCSWorker({
		// 当前激活题目的容器（注意与左侧导航 .problems-aside 中的同名 .subject-item 区分）
		root: questionRootRef,
		// 元素观察器：页面 hash 跳转/任务点切换导致作业 iframe 重建、
		// 题目容器脱离文档时，自动关闭答题并警告（3 秒阈值覆盖正常切题重渲染）
		rootObserver: {
			enabled: true,
			onRootLost: () => {
				// 关闭答题的同时清空搜索结果面板，避免残留过期结果
				CommonProject.scripts.workResults.methods.clearResults();
			}
		},
		elements: {
			// 题干：选择题/主观题为 .problem-body；填空题的题干与空格输入框混排在
			// .item-body 的第一个 div 中（无 .problem-body），取该容器兜底
			title: (root) => {
				const pb = $$el('.problem-body', root as HTMLElement);
				return pb.length ? pb : $$el('.item-body > div', root as HTMLElement).slice(0, 1);
			},
			type: '.item-type',
			options: (root) => {
				// 选择题为选项 label（element-ui radio/checkbox）
				const labels = $$el('ul[class*="list-unstyled"] li label', root);
				if (labels.length) {
					return labels;
				}
				// 主观题为 UEditor 富文本编辑器（iframe 作为填充目标）；
				// 填空题为横线输入框（blank-item-dynamic / placeholder="输入答案"）；简答为原生 textarea
				const editors = $$el('iframe[id^="ueditor_"]', root);
				if (editors.length) {
					return editors;
				}
				const blanks = $$el(YKT_BLANK_INPUT_SELECTOR, root);
				return blanks.length ? blanks : $$el('textarea', root);
			}
		},
		thread: thread ?? 1,
		answerSeparators: answerSeparators.split(',').map((s) => s.trim()),
		answerer: createCommonAnswerer({
			titleTransform: (elements) => titleTransform(elements.title),
			optionsTransform: (elements, ctx) => {
				// 顺带解析题型写入上下文
				ctx.type = parseYktQuestionType(elements.type?.[0]?.textContent ?? '');
				if (ctx.type === 'completion') {
					return '';
				}
				return (elements.options ?? []).map((o: HTMLElement) => optionText(o)).join('\n');
			},
			answererWrappers,
			period
		}),
		work: async (ctx) => {
			const type = ctx.type ?? defaultWorkTypeResolver(ctx) ?? 'single';
			const resolver = createDefaultQuestionResolver(ctx, (o: HTMLElement) => optionText(o))[type];
			if (!resolver) {
				return { finish: false };
			}
			return await resolver(
				ctx.searchInfos,
				(ctx.elements.options ?? []) as HTMLElement[],
				async (t, answer, option) => {
					if (t === 'judgement' || t === 'single' || t === 'multiple') {
						// element-ui：is-checked / input.checked 表示已选中，避免重复点击导致取消选择
						if (
							option &&
							!option.classList.contains('is-checked') &&
							(option.querySelector('input') as HTMLInputElement | null)?.checked !== true
						) {
							option.click();
							await $.sleep(300);
						}
					} else if (t === 'completion' && answer.trim()) {
						if (option?.tagName === 'IFRAME') {
							// 主观题：UEditor 富文本编辑器
							fillYktUEditor(option as unknown as HTMLIFrameElement, answer);
							await $.sleep(300);
						} else {
							// 填空题为 input 文本框，简答为 textarea
							const input =
								option?.tagName === 'TEXTAREA' || option?.tagName === 'INPUT'
									? (option as unknown as HTMLInputElement | HTMLTextAreaElement)
									: (option?.querySelector('textarea,input') as HTMLInputElement | HTMLTextAreaElement | null);
							if (input) {
								input.value = answer;
								// Vue 受控组件必须派发 input 事件才能同步数据
								input.dispatchEvent(new Event('input', { bubbles: true }));
								await $.sleep(200);
							}
						}
					}
				}
			);
		},
		// 检测到题目即在结果面板占位（等待搜索中），随后状态推进原地更新
		onQuestionDetected(current) {
			updateDynamicResult(current, titleTransform);
		},
		onResultsUpdate(current, _, res) {
			// 逐题更新搜索结果面板（等待搜索中→等待答题中→已答题/失败）
			updateDynamicResult(current, titleTransform);
		}
	});

	return { worker, questionRootRef };
}

/**
 * 逐题作答循环（独立作业页与 AI 学伴内嵌任务点共用）：
 * 作答当前题 -> 立即提交本题（平台切题不保存答案）-> 点击"下一题" -> 等待切换与解密 -> 继续。
 * 返回全部题目的作答结果与是否全部完成（用于结尾统计与提示）。
 *
 * @param questionRootRef 题目容器引用数组（doWork 每次调用都重新读取，
 *                        这里在每次作答前从 doc 实时刷新）
 * @param doc             题目所在的 document（作业在 iframe 内时为 iframe.contentDocument）
 */
/**
 * 等待平台风控验证码完成。
 *
 * 作业自动答题触发风控时页面出现 #homework-automation-risk-challenge 元素，
 * 必须由用户手动完成验证，否则无法继续自动答题。
 * 元素不存在时立即返回；存在则挂起直到用户完成验证（元素消失）。
 */
async function waitYktCaptcha(doc: Document): Promise<void> {
	// 作业在 iframe 内，优先在 doc 中查找；兜底顶层 document
	const getCaptcha = () => doc.querySelector('#homework-automation-risk-challenge');
	if (!getCaptcha()) {
		return;
	}
	$console.warn('[answer] 检测到平台风控验证码，等待手动完成...');
	const message = $message.warn({
		content: '检测到平台风控验证码，请手动完成验证，完成后将自动继续答题。',
		duration: 0
	});
	CommonProject.scripts.settings.methods.notificationBySetting(
		'雨课堂脚本：检测到平台风控验证码，请手动完成验证，完成后将自动继续答题。',
		{ duration: 0 }
	);
	await new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			if (!getCaptcha()) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
	message?.remove();
	$message.success('验证码已完成，继续自动答题。');
}

/**
 * 雨课堂的切换序号确认、如果有未保存的题目会出现弹窗，这里等待用户确认
 * 包括：批量未保存答案的提交、单题未保存答案提交
 */
async function waitYktWorkConfirmDialog(doc: Document): Promise<void> {
	const getDialog = () => {
		const els = Array.from(
			doc.querySelectorAll<HTMLElement>('.homework-problem-change-guard-dialog,.homework-problem-batch-submit-dialog')
		);
		if (
			els.some(
				(e) => e?.parentElement?.classList.contains('el-dialog__wrapper') && e?.parentElement.style.display !== 'none'
			)
		) {
			return true;
		}
	};
	if (!getDialog()) {
		return;
	}
	$console.warn('[answer] 检测到作业存在未保存答案，等待手动确认...');
	const message = $message.warn({
		content: '检测到作业存在未保存答案，请手动确认 。',
		duration: 0
	});
	CommonProject.scripts.settings.methods.notificationBySetting('雨课堂脚本：检测到作业存在未保存答案，请手动确认 。', {
		duration: 0
	});
	await new Promise<void>((resolve) => {
		const interval = setInterval(() => {
			if (!getDialog()) {
				clearInterval(interval);
				resolve();
			}
		}, 1000);
	});
	message?.remove();
}

async function runYktAnswerLoop(
	worker: OCSWorker<any>,
	questionRootRef: HTMLElement[],
	doc: Document
): Promise<{ results: WorkResult<any>[]; completedAll: boolean }> {
	const allResults: WorkResult<any>[] = [];
	try {
		// 答题依赖解密后的明文，无论字体解密脚本是否开启都要确保启动
		await ensureYktFontDecrypt(doc);
	} catch (err) {
		$console.error('字体解密初始化失败：', String(err));
	}

	// 左侧导航中的"未完成"题号，满足以下任一条件均视为已完成，不应重复作答
	// （否则可能把已提交的正确答案改错）：
	//   1. 含 .icon-status 图标标记（success=已提交且正确，danger=已提交但错误）
	//   2. 含"未批改"文本状态（.text-status，已作答待批改——无 .icon-status，需按文本排除）
	const getUnfinishedNavItems = () =>
		Array.from(doc.querySelectorAll<HTMLElement>('.problems-aside .subject-item.J_order')).filter((el) => {
			if (el.querySelector('.icon-status')) {
				return false;
			}
			if (el.querySelector('.text-status')?.textContent?.includes('未批改')) {
				return false;
			}
			return true;
		});

	// 已处理的题号（按 data-order 记录，不依赖平台状态刷新，防重复作答）
	const processedOrders = new Set<string>();
	const processedMarkers = new Set<string>();
	let prevMarker: string | null = null;
	let completedAll = false;
	while (worker.isClose === false) {
		// 风控验证码检测：每次切题（点击下一题/题号）后、作答前执行，
		// 出现 #homework-automation-risk-challenge 时挂起等待用户手动完成验证
		await waitYktCaptcha(doc);
		if (worker.isClose) {
			break;
		}
		// 每轮重新计算未完成列表（提交后平台会更新状态标记）
		const unfinished = getUnfinishedNavItems().filter(
			(el) => !processedOrders.has(el.getAttribute('data-order') ?? '')
		);
		if (unfinished.length === 0) {
			completedAll = true;
			break;
		}
		// 当前激活的未完成题优先作答，否则点击切换到第一个未完成题
		let target = unfinished.find((n) => n.classList.contains('active'));
		if (!target) {
			target = unfinished[0];
			prevMarker = currentYktQuestionMarker(doc);
			target.click();
			await $.sleep(1000);
			await waitYktWorkConfirmDialog(doc);
		}
		await waitYktQuestionReady(prevMarker, doc);
		const marker = currentYktQuestionMarker(doc);
		// 防死循环：marker 重复说明切换失败/状态异常
		if (marker && processedMarkers.has(marker)) {
			$console.warn(`[answer] 题目 "${marker}" 重复出现（切换失败或状态未刷新），终止作答以防死循环。`);
			break;
		}
		if (marker) {
			processedMarkers.add(marker);
		}
		const order = target.getAttribute('data-order') ?? '';
		processedOrders.add(order);
		// 刷新题目容器引用（doWork 每次调用都重新读取 root 数组）
		questionRootRef.splice(
			0,
			questionRootRef.length,
			...Array.from(doc.querySelectorAll<HTMLElement>('.container-problem .subject-item'))
		);
		if (questionRootRef.length === 0) {
			break;
		}
		try {
			const results = await worker.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug });
			allResults.push(...results);
			const finished = !!results[0]?.result?.finish;
			// 平台切换题目不会保存答案，必须每题作答后立即提交
			if (finished) {
				const submitted = await submitYktCurrentQuestion(doc, order);
				if (!submitted) {
					$console.warn(`[answer] 本题提交失败: ${marker}`);
				}
			}
			await $.sleep(1000);
			// 防止用户手动选择、脚本点击下一题而不是提交按钮 => 导致的确认弹窗。
			await waitYktWorkConfirmDialog(doc);
		} catch (err) {
			$console.error('[answer] 答题异常，终止作答：', String(err));
			break;
		}
	}
	return { results: allResults, completedAll };
}

/**
 * 创建作业答题 Worker 并驱动"逐题作答 -> 逐题提交 -> 下一题"主循环
 *（平台切题不保存答案，必须逐题提交）。
 * 全部完成后任务点自动标记完成，学习流程继续下一节。
 */
function createYktEmbeddedWorkLoop(opts: CommonWorkOptions, doc: Document, onDone: () => void) {
	// 一题一题动态作答，结果逐题累积，标记为动态答题器以显示手动清空按钮
	CommonProject.scripts.workResults.methods.init({ dynamic: true });

	const { worker, questionRootRef } = createYktAnswerWorker(opts);
	dynamicWorkTips(worker);
	(async () => {
		const { results, completedAll } = await runYktAnswerLoop(worker, questionRootRef, doc);
		worker.emit('done');

		// 平台切换题目不会保存答案，作答循环中已逐题提交。
		// 未全部完成时给出醒目提示，由用户手动处理剩余题目
		const finishCount = results.filter((r) => r.result?.finish).length;
		if (!completedAll) {
			$message.warn({
				content: `题目未全部完成（已作答提交 ${finishCount}/${results.length} 题），请手动检查剩余题目。`,
				duration: 60
			});
		} else {
			$message.success({ content: `作业完成，全部 ${finishCount} 题已作答并逐题提交。` });
		}
		onDone();
	})();
	return worker;
}

/** 课件自动完成驱动配置 */
interface CoursewareOptions {
	volume: number;
	playbackRate: number;
	/** 是否对课件内习题自动作答（调用 OCS 题库） */
	problemWork: boolean;
	/** 图文页停留时长（毫秒），平台规则 ≥1s */
	readInterval?: number;
}

/** 获取 studentCards 课件根组件（页面 Vue 实例，userscript 与页面同上下文可访问 __vue__） */
function getCoursewareVm(): any {
	const el = document.querySelector('.studentCoursewarePPT__component');
	return el ? (el as any).__vue__ : undefined;
}

/** 获取 basePPT 子组件（负责翻页、播放器、计时上报） */
function getCoursewareBase(): any {
	const el = document.querySelector('.basePPT__component');
	return el ? (el as any).__vue__ : undefined;
}

/** 判断某页类型：优先读 Vue 字段，字段缺失时用 DOM 分类兜底；混合页按习题处理 */
function coursewareSlideKind(slide: any, domKind?: string): 'graphic' | 'video' | 'exercise' {
	if (slide && slide.Problem) return 'exercise';
	if (slide && (typeof slide.noWatch === 'boolean' || slide.hasMedia)) return 'video';
	if (domKind === 'video') return 'video';
	if (domKind === 'exercise' || domKind === 'mixed') return 'exercise';
	return 'graphic';
}

/** 从 URL 取课件标识（studentCards/{courseId}/{classId}/{deckId}），非课件页返回空串 */
function coursewareIdFromUrl(): string {
	const match = location.pathname.match(/\/v2\/web\/studentCards\/([^/]+)\/([^/]+)\/([^/]+)/);
	return match ? match.slice(1, 4).join('/') : '';
}

/**
 * studentCards 课件自动完成主驱动（用户只需打开课件）。
 *
 * 实测（2026-11）：页面为 Vue + Swiper，`allSlides` 每页含 `noRead`（未读）、`noWatch/hasMedia`（视频）、
 * `Problem`（习题）。平台规则：图文页停留≥1s；视频页需真实观看≥90%（按 getVideoWatchProgress 的 watch_length
 * 累计真实播放时长）；习题页需完成作答（此处调用 OCS 题库）。逐页切换并处理，直到全部完成。
 *
 * Vue 字段缺失（平台改版 / 无 `__vue__`）时，用 DOM 分析结果兜底判定页类型与完成状态。
 */
async function runStudentCardsCourseware(options: CoursewareOptions) {
	// 防重入：oncomplete 与 onhistorychanged 可能同时触发
	if (state.courseware.running) {
		$console.warn('[courseware] 上一次课件任务仍在运行，忽略本次触发');
		return;
	}
	state.courseware.running = true;
	try {
		await runStudentCardsCoursewareInner(options);
	} finally {
		state.courseware.running = false;
	}
}

async function runStudentCardsCoursewareInner(options: CoursewareOptions) {
	$message.info({ content: '正在自动完成课件（打开后无需操作）...', duration: 5 });

	const vm = (await waitForElement(() => getCoursewareVm(), { timeout_seconds: 30, check_period_ms: 500 }).catch(
		() => undefined
	)) as any;
	if (!vm) {
		$message.warn('未检测到课件组件，请确认已进入课件页面。');
		return;
	}

	/** 当前页是否已完成：Vue 字段优先，缺失时回退 DOM 未读标记 */
	const isPageDone = (idx: number) => {
		const cur = getCoursewareVm();
		const slide = cur && cur.allSlides ? cur.allSlides[idx] : undefined;
		if (slide && typeof slide.noRead === 'boolean') return slide.noRead === false;
		const page = analyzeStudentCardsDeck(document as any).pages[idx];
		return !!page && !page.unread;
	};

	const slides = (vm.allSlides || []) as any[];
	$msgwc.info(`共 ${slides.length} 页，开始自动完成`);
	$console.log(`[courseware] ${describeStudentCardsDeck(analyzeStudentCardsDeck(document as any))}`);

	for (let i = 0; i < slides.length; i++) {
		if (!getCoursewareVm()) {
			$console.warn('[courseware] 课件已关闭，停止自动完成。');
			break;
		}
		const slide = slides[i];
		// 已完成页直接跳过，避免重复播放已完成视频
		if (isPageDone(i)) {
			$console.log(`[courseware] 第${i + 1}页已完成，跳过`);
			continue;
		}
		const domPage = analyzeStudentCardsDeck(document as any).pages[i];
		const kind = coursewareSlideKind(slide, domPage && domPage.kind);
		const pageName = `第${i + 1}页(${kind === 'graphic' ? '图文' : kind === 'video' ? '视频' : '习题'})`;

		try {
			// 切到该页（会触发平台计时/上报）
			const base = getCoursewareBase();
			if (base && typeof base.thumbSwiperClick === 'function') {
				base.thumbSwiperClick(i);
			} else {
				const swiper = (document.querySelector('.pptSwiper') as any)?.swiper;
				swiper && swiper.slideTo(i);
			}
			await $.sleep(1200);

			if (kind === 'graphic') {
				$msgwc.info(`${pageName} 阅读中...`);
				await $.sleep(Math.max(1000, options.readInterval ?? 1500));
			} else if (kind === 'video') {
				$msgwc.info(`${pageName} 播放视频（需看满 90%，请保持页面打开，可长时间挂机）...`);
				await watchCoursewareVideo(i, options);
			} else {
				if (options.problemWork) {
					$msgwc.info(`${pageName} 调用 OCS 题库作答中...`);
					const done = await solveCoursewareProblem(i);
					if (!done && getCoursewareVm()) {
						$msgwc.warn(`${pageName} 未确认完成，重试一次`);
						await $.sleep(1000);
						await solveCoursewareProblem(i);
					}
				} else {
					$msgwc.info(`${pageName} 已跳过（未开启习题自动作答）`);
				}
			}

			// 等待该页 noRead 清除（完成信号），最多 20s
			const start = Date.now();
			while (Date.now() - start < 20000) {
				if (!getCoursewareVm() || isPageDone(i)) break;
				await $.sleep(1000);
			}
		} catch (e) {
			$console.error(`[courseware] ${pageName} 处理失败：${e}`);
		}
	}

	$message.success({ content: '课件自动完成结束（若仍有未完成，请刷新重试或检查题库/网络）。', duration: 0 });
}

/**
 * 播放课件内视频直到观看达到 90%。
 * 使用页面播放器（video.xt_video_player）+ getVideoWatchProgress() 的真实 watch_length 判定；
 * 尝试把播放器倍速调到 options.playbackRate（平台最高 2x），以缩短挂机时间。
 */
async function watchCoursewareVideo(idx: number, options: CoursewareOptions) {
	const slideEl = document.querySelectorAll<HTMLElement>('.pptSwiper .swiper-slide')[idx];
	const box = slideEl?.querySelector<HTMLElement>('.video-box');
	box?.click();

	const video = (await waitForElement(
		() =>
			Array.from(document.querySelectorAll<HTMLVideoElement>('video.xt_video_player'))
				.filter((v) => v.offsetParent !== null)
				.pop(),
		{ timeout_seconds: 20, check_period_ms: 500 }
	).catch(() => undefined)) as HTMLVideoElement | undefined;
	if (!video) {
		$console.warn('[courseware] 视频元素未加载，跳过。');
		return;
	}

	const rate = Math.min(2, Math.max(1, Number(options.playbackRate) || 1));
	const volume = Math.min(1, Math.max(0, Number(options.volume) || 0));
	const applyRate = () => {
		try {
			const cmp = Array.from(document.querySelectorAll<HTMLElement>('.audioCmp')).find((e) => (e as any).__vue__);
			const player = cmp && (cmp as any).__vue__.player;
			if (player && player.options) {
				// 与同文件 watch() 一致：改 speed/volume 后必须调用 player.init() 才生效
				let changed = false;
				if (player.options.speed && player.options.speed.value !== rate) {
					player.options.speed.value = rate;
					changed = true;
				}
				if (player.options.volume && player.options.volume.value !== volume) {
					player.options.volume.value = volume;
					changed = true;
				}
				if (changed && typeof player.init === 'function') player.init();
			}
			if (video.playbackRate !== rate) video.playbackRate = rate;
		} catch {
			// 忽略
		}
	};

	applyRate();
	try {
		await video.play();
	} catch {
		$console.warn('[courseware] 自动播放被拦截，请手动点击一次页面。');
	}

	const deadline = Date.now() + 90 * 60 * 1000; // 单页最多 90 分钟安全上限
	let lastLog = 0;
	while (Date.now() < deadline) {
		await $.sleep(5000);
		if (!getCoursewareVm()) return;
		applyRate();

		const cur = getCoursewareVm();
		if (cur && cur.allSlides[idx] && cur.allSlides[idx].noRead === false) {
			$msgwc.success('视频已完成（≥90%）');
			return;
		}
		if (video.ended) {
			$msgwc.info('视频播放结束');
			return;
		}
		// 读取真实观看进度
		try {
			const cmp = Array.from(document.querySelectorAll<HTMLElement>('.audioCmp')).find((e) => (e as any).__vue__);
			const vm = cmp && (cmp as any).__vue__;
			const wp = vm && vm.getVideoWatchProgress ? await vm.getVideoWatchProgress() : null;
			if (wp) {
				// 返回结构：{ message, code, data: { "slideIndex:videoId": { rate, watch_length, video_length } } }
				const bag = (wp as any).data || wp;
				const key = Object.keys(bag).find((k) => /^\d+:/.test(k));
				const rec = key ? (bag as any)[key] : null;
				if (rec && typeof rec.rate === 'number') {
					if (Date.now() - lastLog > 15000) {
						lastLog = Date.now();
						$console.log(`[courseware] 视频观看进度 ${(rec.rate * 100).toFixed(1)}%`);
					}
					if (rec.rate >= 0.9) {
						$msgwc.success('视频观看已达 90%');
						return;
					}
				}
			}
		} catch {
			// 忽略
		}
	}
	$console.warn('[courseware] 视频等待超时。');
}

/**
 * 用 OCS 题库对当前页的图片型习题作答（选项为 A/B/C/D 图片）。
 * 把整页封面作为题干图片、各选项图片作为选项图片，交给 OCS 的题库管线（支持图片题优化/OCR），
 * 题库返回选项字母后点击对应 `div.problembullet[data-label]` 并点提交。
 */
async function solveCoursewareProblem(idx: number): Promise<boolean> {
	const vm = getCoursewareVm();
	const slide = vm && vm.allSlides ? vm.allSlides[idx] : undefined;
	const problem = slide && slide.Problem;
	if (!problem) return false;

	const workOptions = CommonProject.scripts.settings.methods.getWorkOptions();
	if (!workOptions.answererWrappers || workOptions.answererWrappers.length === 0) {
		$console.warn('[courseware] 未配置题库，无法自动答题。');
		return false;
	}

	const slideEl = document.querySelectorAll<HTMLElement>('.pptSwiper .swiper-slide')[idx];
	const bullets = Array.from(slideEl.querySelectorAll<HTMLElement>('.problembullet[data-label]'));
	const cover = problem.Result && problem.Result.cover;
	// 题面与选项都在整页图片里，选项只是 A/B/C/D 标签：把整页图作为题干图片交给 OCS 题库（AI/OCR）识别
	const optionText = bullets.map((b) => b.getAttribute('data-label')).join('\n');

	let answer = '';
	try {
		const { env } = await buildAnswererEnv({
			type: 'single',
			title: '',
			options: optionText,
			titleImages: cover ? [cover] : [],
			optionsImages: [],
			enableImageOptimize: CommonProject.scripts.settings.cfg.imageOptimize
		});
		const infos = await defaultAnswerWrapperHandler(workOptions.answererWrappers, env);
		const first = infos && infos[0] && infos[0].results && infos[0].results[0];
		answer = first ? String(first.answer || '') : '';
	} catch (e) {
		$console.warn('[courseware] 题库请求失败：' + e);
		return false;
	}

	const letters = (answer.toUpperCase().match(/[A-D]/g) || []).filter((x, i, a) => a.indexOf(x) === i);
	if (letters.length === 0) {
		$console.warn('[courseware] 题库未返回可识别的选项字母：' + answer);
		return false;
	}
	for (const letter of letters) {
		const bullet = bullets.find((b) => b.getAttribute('data-label') === letter);
		if (bullet && !bullet.classList.contains('chosen')) {
			bullet.click();
			await $.sleep(300);
		}
	}
	const submit = slideEl.querySelector<HTMLElement>('.quizImg.submitButton');
	if (submit) {
		submit.click();
		await $.sleep(2000);
	}

	const start = Date.now();
	while (Date.now() - start < 15000) {
		const cur = getCoursewareVm();
		if (cur && cur.allSlides[idx] && cur.allSlides[idx].noRead === false) {
			$msgwc.success('习题已完成');
			return true;
		}
		await $.sleep(1000);
	}
	return false;
}

/**
 * 观看视频
 * @param setting
 * @returns
 */
async function watch(options: { volume: number; playbackRate: number }) {
	const set = async () => {
		await $.sleep(1000);

		// 这里无法通过直接修改数值来修改倍速和音量，需要调用播放器的接口来修改
		const video_vue_data = document.querySelector<any>('.xtplayer')?.__vue__;
		if (video_vue_data) {
			video_vue_data.player.options.speed.value = parseFloat(options.playbackRate.toString());
			video_vue_data.player.options.volume.value = options.volume;
			// 应用更改的音量和倍速设置
			video_vue_data.player.init();
		}

		const media = (await waitForElement('video', {
			timeout_seconds: 10 * 1000,
			timeout_message: '视频元素加载超时'
		})) as HTMLMediaElement;
		console.log('media', media);
		await $.sleep(1000);
		state.study.currentMedia = media;
		// 重置视频进度
		media.currentTime = 1;
		return media;
	};
	$message.info('开始播放');

	return new Promise<void>((resolve, reject) => {
		/** 当前正在播放的视频元素 */
		let currentVideo: HTMLMediaElement | undefined;
		/** 视频切换检测定时器 */
		let videoCheckInterval: ReturnType<typeof setInterval> | undefined;
		/** 连续获取视频失败的次数，防止无限重试 */
		let failCount = 0;

		const clearCheckInterval = () => {
			if (videoCheckInterval !== undefined) {
				clearInterval(videoCheckInterval);
				videoCheckInterval = undefined;
			}
		};

		const bindEvents = (video: HTMLMediaElement) => {
			video.onpause = async () => {
				if (!video.ended) {
					await $.sleep(1000);
					video.play();
				}
			};
			video.onended = () => {
				clearCheckInterval();
				$msgwc.success('视频学习完成');
				// 正常播放结束
				resolve();
			};
		};

		const watch = async () => {
			try {
				const media = await set();

				if (!media) {
					// 视频不存在，稍后重新观看
					failCount++;
					if (failCount >= 5) {
						reject(new Error('video not found!'));
						return;
					}
					$message.info({ content: '未检测到视频，稍后重试...' });
					setTimeout(watch, 3000);
					return;
				}

				failCount = 0;
				currentVideo = media;
				bindEvents(media);
				playMedia(() => media.play());

				// 检测视频是否被切换，切换后重新观看并继承当前 promise 的 resolve
				clearCheckInterval();
				videoCheckInterval = setInterval(() => {
					if (currentVideo?.isConnected === false) {
						clearCheckInterval();
						$message.info({ content: '检测到视频切换...' });
						resolve();
					}
				}, 3000);
			} catch (e) {
				clearCheckInterval();
				reject(e);
			}
		};

		watch();
	});
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
			timeout_seconds: 10 * 1000,
			timeout_message: 'AI数字人视频元素加载超时'
		})) as HTMLMediaElement;
		console.log('media', media);
		await $.sleep(1000);
		state.study.currentMedia = media;
		state.study.is_ai_watch_mode = true;

		// 如果已经播放完了，则重置视频进度
		media.currentTime = 1;
		// 音量
		media.volume = options.volume;
		media.playbackRate = options.playbackRate;
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
 * 26年新版随堂练习界面，单独界面-从侧边栏任务中进入
 */
function examination(opts: CommonWorkOptions) {
	$message.info(`开始考试`);
	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'yuketang_exam'
	});

	const redundanceWords = opts.redundanceWordsText.split('\n').filter(Boolean);
	const titleTransform = (titles: (HTMLElement | undefined)[]) =>
		titles
			.filter((t) => t?.innerText)
			.map((t) =>
				t
					? removeRedundantWords(
							StringUtils.of(extractYktTitleText(t)).nowrap(' ').nospace().toString().trim(),
							redundanceWords
					  )
					: ''
			)
			.join(',');

	// 这里跟章节测试的连线题不一样，章节测试是新版连线题
	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.exam-main--content .subject-item',
		elements: {
			title: ['h3', 'h4', 'h5', 'h6'].map((h) => `${h.trim()}.clearfix.exam-font`).join(','),
			options: 'ul.list-unstyled li',
			textareas: (root) => {
				// 主观题为 UEditor 富文本编辑器（iframe 作为填充目标）；
				// 填空题为横线输入框（blank-item-dynamic / placeholder="输入答案"）；简答为原生 textarea
				const editors = $$el('iframe[id^="ueditor_"]', root);
				if (editors.length) {
					return editors;
				}
				const blanks = $$el(YKT_BLANK_INPUT_SELECTOR, root);
				return blanks.length ? blanks : $$el('textarea', root);
			}
		},
		thread: opts.thread ?? 1,
		answerSeparators: opts.answerSeparators.split(',').map((s) => s.trim()),
		/** 默认搜题方法构造器 */
		answerer: createCommonAnswerer({
			titleTransform: (elements, ctx) => {
				if (elements.title) {
					return titleTransform(elements.title);
				}
				return '';
			},
			answererWrappers: opts.answererWrappers,
			period: opts.period
		}),

		work: async (ctx) => {
			const { elements, searchInfos } = ctx;

			// 在非预览模式下会出现多个干扰项 type，这里提取正确的

			const type: QuestionTypes = (() => {
				const cl = ctx?.root?.querySelector('.item-type')?.textContent?.trim() || '';
				return cl.includes('单选题')
					? 'single'
					: cl.includes('多选题')
					? 'multiple'
					: cl.includes('判断题')
					? 'judgement'
					: cl.includes('填空题')
					? 'completion'
					: undefined;
			})();

			// 通用单选多选题
			if (type && (type === 'multiple' || type === 'single')) {
				const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text)[type];
				return await resolver(searchInfos, elements.options as HTMLElement[], async (type, answer, option) => {
					const label = option.querySelector('label');
					if (!label?.classList.contains('is-checked') || !option.querySelector('.el-icon-check')) {
						label?.click();
						await $.sleep(500);
					}
				});
			}
			// 判断题处理
			else if (type && type === 'judgement') {
				const answersGroup = searchInfos.map((info) => info.results.map((res) => res.answer));
				const optionTexts = ['对', '错'];
				const result = resolveJudgement(answersGroup, optionTexts);
				if (result.finish && result.option) {
					const index = optionTexts.indexOf(result.option);
					ctx.elements.options[index]?.click();
					return { finish: true };
				}
				return { finish: false };
			} else if (type === 'completion') {
				const resolver = createDefaultQuestionResolver(ctx, (o) => extractTextWithImages(o).text).completion;
				return await resolver(searchInfos, elements.textareas as HTMLElement[], async (type, answer, option) => {
					if (option?.tagName === 'IFRAME') {
						// 主观题：UEditor 富文本编辑器
						fillYktUEditor(option as unknown as HTMLIFrameElement, answer);
						await $.sleep(300);
					} else {
						// 填空题为 input 文本框，简答为 textarea
						const input =
							option?.tagName === 'TEXTAREA' || option?.tagName === 'INPUT'
								? (option as unknown as HTMLInputElement | HTMLTextAreaElement)
								: (option?.querySelector('textarea,input') as HTMLInputElement | HTMLTextAreaElement | null);
						if (input) {
							input.value = answer;
							// Vue 受控组件必须派发 input 事件才能同步数据
							input.dispatchEvent(new Event('input', { bubbles: true }));
							await $.sleep(200);
						}
					}
				});
			}
			return { finish: false };
		},
		/** 元素准备完毕后回调（仅一次）：填充全部题目，面板立即显示全部题目 */
		async onResultsInit(_curr, _index, res) {
			await CommonProject.scripts.workResults.methods.fillAll(
				res.map((r, i) => simplifyWorkResult(r, titleTransform, i))
			);
		},

		/** 完成答题后 */
		async onResultsUpdate(current, index, res) {
			await CommonProject.scripts.workResults.methods.update(index, simplifyWorkResult(current, titleTransform, index));
		}
	});

	worker
		.doWork({ enable_debug: BackgroundProject.scripts.dev.cfg.enable_answerer_debug })
		.then(() => {
			$message.info({ content: '随堂练习完成，请自行检查后保存或提交。', duration: 0 });
			worker.emit('done');
		})
		.catch((err) => {
			console.error(err);
			$message.error('答题程序发生错误 : ' + err.message);
		});

	return worker;
}
