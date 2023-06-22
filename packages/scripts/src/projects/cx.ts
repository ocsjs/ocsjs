/** global Ext videojs getTeacherAjax jobs */

import {
	OCSWorker,
	defaultAnswerWrapperHandler,
	$creator,
	Project,
	Script,
	$el,
	$gm,
	$$el,
	$,
	StringUtils,
	request,
	defaultQuestionResolve,
	DefaultWork,
	splitAnswer,
	MessageElement,
	domSearch,
	domSearchAll,
	SearchInformation,
	$modal,
	$message
} from '@ocsjs/core';

import { CommonProject } from './common';
import { workNotes, volume, restudy } from '../utils/configs';
import { commonWork, optimizationElementWithImage, removeRedundantWords, simplifyWorkResult } from '../utils/work';
import md5 from 'md5';
// @ts-ignore
import Typr from 'typr.js';
import { $console } from './background';
import { el } from '../../../core/src/utils/dom';
import { CommonWorkOptions, createRangeTooltip, playMedia } from '../utils';

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
		answererWrapperUnsetMessage: undefined as MessageElement | undefined
	}
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
		'hnsyu.net'
	],
	studyProject: true,
	scripts: {
		guide: new Script({
			name: '💡 使用提示',
			url: [
				['首页', 'https://www.chaoxing.com'],
				['旧版个人首页', 'chaoxing.com/space/index'],
				['新版个人首页', 'chaoxing.com/base'],
				['课程首页', 'chaoxing.com/mycourse']
			],
			namespace: 'cx.guide',
			configs: {
				notes: {
					defaultValue: `请手动进入视频、作业、考试页面，脚本会自动运行。`
				}
			},
			oncomplete() {
				CommonProject.scripts.render.methods.pin(this);
			}
		}),
		study: new Script({
			name: '🖥️ 课程学习',
			namespace: 'cx.new.study',
			url: [
				['任务点页面', '/knowledge/cards'],
				['阅读任务点', '/readsvr/book/mooc']
				// 旧版浏览器好像不能识别二级 iframe ， 所以不能使用 'work/doHomeWorkNew' 以及其他二级 iframe 来触发路由
			],
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						['任务点不是顺序执行，如果某一个任务没有动', '请查看是否有其他任务正在学习，耐心等待即可。'],
						'闯关模式请注意题库如果没完成，需要自己完成才能解锁章节。',
						'不要最小化浏览器，可能导致脚本暂停。'
					]).outerHTML
				},
				playbackRate: {
					label: '视频倍速',
					attrs: {
						type: 'range',
						step: 0.5,
						min: 1,
						max: 16
					},
					defaultValue: 1,
					onload() {
						createRangeTooltip(
							this,
							'1',
							(val) =>
								(parseFloat(val) > 2 ? `${val}x - 高倍速警告！` : `${val}x`) +
								'\n\n高倍速(大于1倍)可能导致: \n- 学习记录清空\n- 频繁验证码\n超星后台可以看到学习时长，请谨慎设置❗\n如果设置后无效则是超星不允许使用倍速。'
						);
					}
				},
				volume,
				restudy,
				autoNextPage: {
					label: '自动下一章',
					attrs: { type: 'checkbox' },
					defaultValue: true
				},
				reloadVideoWhenError: {
					label: '视频加载错误时自动刷新',
					attrs: { type: 'checkbox' },
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
					separator: '任务点开关',
					label: '开启-视频/音频自动播放',
					attrs: { type: 'checkbox', title: '开启：音频和视频的自动播放' },
					defaultValue: true
				},
				enablePPT: {
					label: '开启-PPT/书籍自动完成',
					attrs: { type: 'checkbox', title: '开启：PPT/书籍自动翻阅' },
					defaultValue: true
				},
				enableChapterTest: {
					label: '开启-章节测试自动答题',
					attrs: { type: 'checkbox', title: '开启：章节测试自动答题' },
					defaultValue: true
				}
			},
			onrender({ panel }) {
				if (!CommonProject.scripts.settings.cfg.answererWrappers?.length) {
					const setting = el('button', { className: 'base-style-button-secondary' }, '通用-全局设置');
					setting.onclick = () => CommonProject.scripts.render.methods.pin(CommonProject.scripts.settings);
					if (state.study.answererWrapperUnsetMessage === undefined) {
						state.study.answererWrapperUnsetMessage = $message('warn', {
							content: el('span', {}, ['检测到未设置题库配置，将无法自动答题，请切换到 ', setting, ' 页面进行配置。']),
							duration: 0
						});
					}
				}
			},
			async oncomplete() {
				/** iframe 跨域问题， 必须在 iframe 中执行 ， 所以脱离学习脚本运行。 */
				if (/\/readsvr\/book\/mooc/.test(location.href)) {
					$console.log('正在完成书籍/PPT...');
					setTimeout(() => {
						// @ts-ignore
						// eslint-disable-next-line no-undef
						readweb.goto(epage);
					}, 5000);

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
						workOptions: { ...CommonProject.scripts.settings.cfg }
					});
				}
			}
		}),
		work: new Script({
			name: '✍️ 作业考试脚本',
			url: [
				['作业页面', '/mooc2/work/dowork'],
				['考试整卷预览页面', '/mooc2/exam/preview']
			],
			namespace: 'cx.new.work',
			configs: { notes: workNotes },
			async oncomplete() {
				const isExam = /\/exam\/preview/.test(location.href);
				commonWork(this, {
					workerProvider: (opts) => workOrExam(isExam ? 'exam' : 'work', opts)
				});
			}
		}),
		autoRead: new Script({
			name: '🖥️ 自动阅读',
			url: [
				['阅读页面', '/ztnodedetailcontroller/visitnodedetail'],
				['课程首页', /chaoxing.com\/course\/\d+\.html/]
			],
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'请手动点击进入阅读任务点',
						'阅读任务点通常需要挂机一小时',
						'等待完成后次日才会统计阅读时长'
					]).outerHTML
				}
			},
			oncomplete() {
				if (/chaoxing.com\/course\/\d+\.html/.test(location.href)) {
					const texts = $$el('.course_section .chapterText');
					if (texts.length) {
						// 自动进入章节
						texts[0].click();
					}
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
						$console.log('未检测到下一页');
					}
				}, 63 * 1000);
			}
		}),
		versionRedirect: new Script({
			name: '版本切换脚本',
			url: [
				['', 'mooc2=0'],
				['', 'mycourse/studentcourse'],
				['', 'work/getAllWork'],
				['', 'work/doHomeWorkNew'],
				['', 'exam/test\\?'],
				['', 'exam/test/reVersionTestStartNew.*examsystem.*']
			],
			hideInPanel: true,
			async oncomplete() {
				if (top === window) {
					$message('warn', {
						content:
							'OCS网课助手不支持旧版超星, 即将切换到超星新版, 如有其他第三方插件请关闭, 可能有兼容问题频繁频繁切换。'
					});
					// 跳转到最新版本的超星
					await $.sleep(1000);
					const experience = document.querySelector('.experience') as HTMLElement;
					if (experience) {
						experience.click();
					} else {
						const params = new URLSearchParams(window.location.href);
						params.set('mooc2', '1');
						// 兼容考试切换
						params.set('newMooc', 'true');
						params.delete('examsystem');
						window.location.replace(decodeURIComponent(params.toString()));
					}
				}
			}
		}),
		examRedirect: new Script({
			name: '考试整卷预览脚本',
			url: [['新版考试页面', 'exam-ans/exam/test/reVersionTestStartNew']],
			hideInPanel: true,
			oncomplete() {
				$message('info', { content: '即将跳转到整卷预览页面进行考试。' });
				setTimeout(() => $gm.unsafeWindow.topreview(), 3000);
			}
		}),
		rateHack: new Script({
			name: '屏蔽倍速限制',
			hideInPanel: true,
			url: [['', '/ananas/modules/video/']],
			onstart() {
				rateHack();
			}
		}),
		copyHack: new Script({
			name: '屏蔽复制粘贴限制',
			hideInPanel: true,
			url: [['所有页面', /.*/]],
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
											const defaultText = el('span', { innerHTML: ue.textarea.value }).textContent;
											$modal('prompt', {
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
			url: [['课程学习页面', '/mycourse/studentstudy']],
			namespace: 'cx.new.study-dispatcher',
			hideInPanel: true,
			async oncomplete() {
				// 开始任务切换
				const restudy = CXProject.scripts.study.cfg.restudy;

				CommonProject.scripts.render.methods.pin(CXProject.scripts.study);

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

					let chapters = CXAnalyses.getChapterInfos();

					chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);

					if (chapters.length === 0) {
						$message('warn', { content: '页面任务点数量为空! 请刷新重试!' });
					} else {
						const params = new URLSearchParams(window.location.href);
						const courseId = params.get('courseId');
						const classId = params.get('clazzid');
						setTimeout(() => {
							//  进入需要进行的章节，并且当前章节未被选中
							if ($$el(`.posCatalog_active[id="cur${chapters[0].chapterId}"]`).length === 0) {
								$gm.unsafeWindow.getTeacherAjax(courseId, classId, chapters[0].chapterId);
							}
						}, 1000);
					}
				}
			}
		}),
		cxSecretFontRecognize: new Script({
			name: '繁体字识别',
			hideInPanel: true,
			url: [
				['题目页面', 'work/doHomeWorkNew'],
				['考试整卷预览', '/mooc2/exam/preview'],
				['作业', '/mooc2/work/dowork']
			],
			async oncomplete() {
				await mappingRecognize();
			}
		})
	}
});

export function workOrExam(
	type: 'work' | 'exam' = 'work',
	{ answererWrappers, period, thread, redundanceWordsText }: CommonWorkOptions
) {
	$message('info', { content: `开始${type === 'work' ? '作业' : '考试'}` });

	CommonProject.scripts.workResults.methods.init({
		questionPositionSyncHandlerType: 'cx'
	});

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
					return optimizationElementWithImage(titleCloneEl).innerText;
				}
				return '';
			})
			.join(',');

		return removeRedundantWords(
			StringUtils.of(optimizationTitle).nowrap().nospace().toString().trim(),
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
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 0,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) => {
			if (elements.title) {
				// 处理作业和考试题目
				const title = workOrExamQuestionTitleTransform(elements.title);
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
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},

		work: async (ctx) => {
			const { elements, searchInfos } = ctx;
			const typeInput = elements.type[0] as HTMLInputElement;
			const type = getQuestionType(parseInt(typeInput.value));

			if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
				const resolver = defaultQuestionResolve(ctx)[type];
				return await resolver(
					searchInfos,
					elements.options.map((option) => optimizationElementWithImage(option)),
					(type, answer, option) => {
						// 如果存在已经选择的选项
						if (type === 'judgement' || type === 'single' || type === 'multiple') {
							if (option?.parentElement && $$el('[class*="check_answer"]', option.parentElement).length === 0) {
								option.click();
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
		onResultsUpdate(res) {
			CommonProject.scripts.workResults.methods.setResults(simplifyWorkResult(res, workOrExamQuestionTitleTransform));
		},
		/** 监听答题结果 */
		onResolveUpdate(res) {
			if (res.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
					simplifyWorkResult([res], workOrExamQuestionTitleTransform)
				);
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
			console.error(err);
			$message('error', { content: '答题程序发生错误 : ' + err.message });
		});

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
	isStuckInBreakingMode() {
		if (this.isInSpecialMode()) {
			const chapter = top?.document.querySelector('.posCatalog_active');
			if (chapter) {
				// @ts-ignore
				chapter.finish_count = chapter.finish_count ? chapter.finish_count + 1 : 1;
				// @ts-ignore
				if (chapter.finish_count >= 2) {
					// @ts-ignore
					chapter.finish_count = 1;
					return true;
				}
			}
		}
		return false;
	},
	/** 是否处于最后一小节 */
	isInFinalTab() {
		// 上方小节任务栏
		const tabs = Array.from(top?.document.querySelectorAll('.prev_ul li') || []);
		return tabs.length && tabs[tabs.length - 1].classList.contains('active');
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
			chapterId: el.getAttribute('onclick')?.match(/\('(.*)','(.*)','(.*)'\)/)?.[3],
			// @ts-ignore
			unFinishCount: parseInt(el.parentElement.querySelector('.jobUnfinishCount')?.value || '0')
		}));
	},
	/** 检测页面是否使用字体加密 */
	getSecretFont(doc: Document = document) {
		return Array.from(doc.querySelectorAll('.font-cxsecret')).map((font) => {
			// 这里吧选项按钮和文字分离，如果不分离的话 .font-cxsecret 元素下面还包含选项按钮时，替换时会吧按钮也删除掉导致选项按钮不可用
			const after = font.querySelector('.after');
			return after === null ? font : after;
		}) as HTMLElement[];
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

type Attachment = {
	/** 只有当 module 为 音视频时才会有这个属性 */
	isPassed: boolean | undefined;
	/** 是否为任务点 */
	job: boolean | undefined;
	/** 这里注意，如果当前章节测试不是任务点，则没有 jobid */
	jobid?: string;
	property: {
		mid: string;
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

/**
 * cx 任务学习
 */
export async function study(opts: {
	restudy: boolean;
	playbackRate: number;
	volume: number;
	workOptions: CommonWorkOptions;
}) {
	await $.sleep(3000);

	const searchedJobs: Job[] = [];

	let searching = true;

	let attachmentCount: number = $gm.unsafeWindow.attachments?.length || 0;

	/** 考虑到网速级慢的同学，所以10秒后如果还没有任务点才停止 */
	setTimeout(() => {
		searching = false;
	}, 10 * 1000);

	/**
	 * 递归运行任务点，一旦有新的任务点被检测到直接开始
	 * 如果10秒内既没有任务点，也暂停了搜索，则当前则没有任务点
	 */
	const runJobs = async () => {
		// @ts-ignore
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
	const next = () => {
		const curCourseId = $el<HTMLInputElement>('#curCourseId', top?.document);
		const curChapterId = $el<HTMLInputElement>('#curChapterId', top?.document);
		const curClazzId = $el<HTMLInputElement>('#curClazzId', top?.document);
		const count = $$el('#prev_tab .prev_ul li', top?.document);

		// 如果即将切换到下一章节
		if (CXAnalyses.isInFinalTab()) {
			if (CXAnalyses.isStuckInBreakingMode()) {
				return $modal('alert', {
					content: '检测到此章节重复进入, 为了避免无限重复, 请自行手动完成后手动点击下一章, 或者刷新重试。'
				});
			}
		}

		if (CXAnalyses.isInFinalChapter()) {
			if (CXAnalyses.isFinishedAllChapters()) {
				$modal('alert', { content: '全部任务点已完成！' });
			} else {
				$modal('alert', { content: '已经抵达最后一个章节！但仍然有任务点未完成，请手动切换至未完成的章节。' });
			}
		} else {
			if (curChapterId && curCourseId && curClazzId) {
				// @ts-ignore
				top._preChapterId = curChapterId.value;

				/**
				 * count, chapterId, courseId, clazzid, knowledgestr, checkType
				 * checkType 就是询问当前章节还有任务点未完成，是否完成，这里直接不传，默认下一章
				 */
				// @ts-ignore
				$gm.unsafeWindow.top?.PCount.next(
					count.length.toString(),
					curChapterId.value,
					curCourseId.value,
					curClazzId.value,
					''
				);
			} else {
				$console.warn('参数错误，无法跳转下一章，请尝试手动切换。');
			}
		}
	};

	if (CXProject.scripts.study.cfg.autoNextPage) {
		$console.info('页面任务点已完成，即将切换下一章。');
		await $.sleep(5000);
		next();
	} else {
		$console.warn('页面任务点已完成，自动下一章已关闭，请手动切换。');
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
	opts: {
		restudy: boolean;
		playbackRate: number;
		volume: number;
		workOptions: CommonWorkOptions;
		reloadVideoWhenError: boolean;
	},
	searchedJobs: Job[]
): Job | undefined {
	const knowCardWin = $gm.unsafeWindow;

	const searchJobElement = (root: HTMLIFrameElement) => {
		return domSearch(
			{
				media: 'video,audio',
				chapterTest: '.TiMu',
				read: '#img.imglook'
			},
			root.contentWindow!.document
		);
	};

	const search = (root: HTMLIFrameElement): Job | undefined => {
		const win = root.contentWindow;

		const { media, read, chapterTest } = searchJobElement(root);

		if (win && (media || read || chapterTest)) {
			const doc = win.document;

			const attachment: Attachment | undefined =
				// @ts-ignore
				knowCardWin.attachments[getValidNumber(win._jobindex, win.parent._jobindex)];

			// 任务点去重
			if (attachment && searchedJobs.find((job) => job.mid === attachment.property.mid) === undefined) {
				const { name, title, bookname, author } = attachment.property;
				const jobName = name || title || (bookname ? bookname + author : undefined) || '未知任务';

				let func: { (): Promise<any> } | undefined;
				if (media) {
					if (!CXProject.scripts.study.cfg.enableMedia) {
						$console.warn(`音视频自动学习功能已关闭。${jobName} 即将跳过`);
					} else {
						// 重复学习，或者未完成
						if (opts.restudy || attachment.job) {
							func = () => {
								$console.log(`即将${opts.restudy ? '重新' : ''}播放 : `, jobName);
								return mediaTask(opts, media as HTMLMediaElement, doc);
							};
						}
					}
				} else if (chapterTest) {
					if (!CXProject.scripts.study.cfg.enableChapterTest) {
						$console.warn(`章节测试自动答题功能已关闭。${jobName} 即将跳过`);
					} else {
						if (attachment.job) {
							func = () => {
								$console.log('开始答题 : ', jobName);

								return chapterTestTask(root, opts.workOptions);
							};
						}
					}
				} else if (read) {
					if (!CXProject.scripts.study.cfg.enablePPT) {
						$console.warn(`PPT/书籍阅读功能已关闭。${jobName} 即将跳过`);
					} else {
						if (attachment.job) {
							func = () => {
								$console.log('正在学习 ：', jobName);
								return readTask(win);
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
		} else {
			return undefined;
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
 * 播放视频和音频
 */
async function mediaTask(
	setting: { playbackRate: number; volume: number; reloadVideoWhenError: boolean },
	media: HTMLMediaElement,
	doc: Document
) {
	const { playbackRate = 1, volume = 0 } = setting;

	// @ts-ignore
	const { videojs } = domSearch({ videojs: '#video,#audio' }, doc);

	if (!videojs) {
		$console.error('视频检测不到，请尝试刷新或者手动切换下一章。');
		return;
	}

	state.study.videojs = videojs;
	// @ts-ignore
	top.currentMedia = media;

	// 固定视频进度
	fixedVideoProgress();

	// eslint-disable-next-line no-undef
	let reloadInterval: NodeJS.Timer;

	if (setting.reloadVideoWhenError) {
		reloadInterval = setInterval(() => {
			if (doc.documentElement.innerText.includes('网络错误导致视频下载中途失败')) {
				$console.error('视频加载失败，即将刷新页面');
				setTimeout(() => {
					location.reload();
				}, 3000);
			}
		}, 5000);
	}

	/**
	 * 视频播放
	 */
	await new Promise<void>((resolve, reject) => {
		const playFunction = async () => {
			if (!media.ended) {
				await $.sleep(1000);
				media.play();
				media.playbackRate = playbackRate;
			}
		};

		media.addEventListener('pause', playFunction);

		media.addEventListener('ended', () => {
			$console.log('视频播放完毕');
			media.removeEventListener('pause', playFunction);
			clearInterval(reloadInterval);
			resolve();
		});

		$console.log('视频开始播放');
		media.volume = volume;
		playMedia(() => media.play())
			.then(() => {
				media.playbackRate = playbackRate;
			})
			.catch(reject);
	});
}

/**
 * 阅读 ppt
 */
async function readTask(win: Window & { finishJob?: Function }) {
	const finishJob = win.finishJob;
	if (finishJob) finishJob();
	await $.sleep(3000);
}

/**
 * 章节测验
 */
async function chapterTestTask(
	frame: HTMLIFrameElement,
	{ answererWrappers, period, upload, thread, stopSecondWhenFinish, redundanceWordsText }: CommonWorkOptions
) {
	if (answererWrappers === undefined || answererWrappers.length === 0) {
		return $console.warn('检测到题库配置为空，无法自动答题，请前往 “通用-全局设置” 页面进行配置。');
	}

	$console.info('开始章节测试');

	const frameWindow = frame.contentWindow;
	const { TiMu } = domSearchAll({ TiMu: '.TiMu' }, frameWindow!.document);

	CommonProject.scripts.workResults.methods.init();

	const chapterTestTaskQuestionTitleTransform = (titles: (HTMLElement | undefined)[]) => {
		const transformed = StringUtils.of(
			titles.map((t) => (t ? optimizationElementWithImage(t).innerText : '')).join(',')
		)
			.nowrap()
			.nospace()
			.toString()
			.trim()
			/** 超星旧版作业题目冗余数据 */
			.replace(/^\d+[。、.]/, '')
			.replace(/（\d+.\d+分）/, '')
			.replace(/\(..题, .+?分\)/, '')
			.replace(/[[(【（](.+题|名词解释|完形填空|阅读理解)[\])】）]/, '')
			.trim();

		return removeRedundantWords(transformed, redundanceWordsText.split('\n'));
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
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 0,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) => {
			const title = chapterTestTaskQuestionTitleTransform(elements.title);
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
			const { elements, searchInfos } = ctx;
			const typeInput = elements.type[0] as HTMLInputElement;
			const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

			if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
				const resolver = defaultQuestionResolve(ctx)[type];

				const handler: DefaultWork<any>['handler'] = (type, answer, option, ctx) => {
					if (type === 'judgement' || type === 'single' || type === 'multiple') {
						if (option?.parentElement?.querySelector('label input')?.getAttribute('checked') === 'checked') {
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
						if (option?.parentElement) {
							/** 如果存在保存按钮则点击 */
							$el('[onclick*=saveQuestion]', option.parentElement)?.click();
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
		async onResultsUpdate(res, curr) {
			CommonProject.scripts.workResults.methods.setResults(
				simplifyWorkResult(res, chapterTestTaskQuestionTitleTransform)
			);

			// 没有完成时随机作答
			if (!curr.result?.finish && curr.resolving === false) {
				const options = curr.ctx?.elements?.options || [];

				const typeInput = curr.ctx?.elements?.type[0] as HTMLInputElement | undefined;
				const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

				const commonSetting = CommonProject.scripts.settings.cfg;

				if (commonSetting['randomWork-choice'] && (type === 'judgement' || type === 'single' || type === 'multiple')) {
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
		onResolveUpdate(res) {
			if (res.result?.finish) {
				CommonProject.scripts.apps.methods.addQuestionCacheFromWorkResult(
					simplifyWorkResult([res], chapterTestTaskQuestionTitleTransform)
				);
			}
			CommonProject.scripts.workResults.methods.updateWorkState(worker);
		},
		async onElementSearched(elements) {
			const typeInput = elements.type[0] as HTMLInputElement;
			const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

			/** 判断题转换成文字，以便于答题程序判断 */
			if (type === 'judgement') {
				elements.options.forEach((option) => {
					const ri = option.querySelector('.ri');
					const span = document.createElement('span');
					span.innerText = ri ? '√' : '×';
					option.appendChild(span);
				});
			}
		}
	});

	const results = await worker.doWork();

	$message('success', { content: `答题完成，将等待 ${stopSecondWhenFinish} 秒后进行保存或提交。` });
	await $.sleep(stopSecondWhenFinish * 1000);

	// 处理提交
	await worker.uploadHandler({
		type: upload,
		results,
		async callback(finishedRate, uploadable) {
			$console.info(`完成率 ${finishedRate.toFixed(2)} :  ${uploadable ? '5秒后将自动提交' : '5秒后将自动保存'} `);

			await $.sleep(5000);

			if (uploadable) {
				// @ts-ignore 提交
				frameWindow.btnBlueSubmit();

				await $.sleep(3000);
				/** 确定按钮 */
				// @ts-ignore 确定
				frameWindow.submitCheckTimes();
			} else {
				// @ts-ignore 禁止弹窗
				frameWindow.alert = () => {};
				// @ts-ignore 暂时保存
				frameWindow.noSubmit();
			}
		}
	});

	worker.emit('done');
}

/**
 * 获取有效的数字
 * @param nums
 */
export function getValidNumber(...nums: number[]) {
	return nums.map((num) => (typeof num === 'number' ? num : undefined)).find((num) => num !== undefined);
}

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
		: [2, 4, 5, 6, 7, 9, 10].some((t) => t === val)
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
