/** global Ext videojs getTeacherAjax  */

import {
	OCSWorker,
	defaultAnswerWrapperHandler,
	$creator,
	Project,
	Script,
	$script,
	$el,
	$gm,
	$$el,
	$,
	$model,
	StringUtils,
	CommonWorkOptions,
	request,
	defaultQuestionResolve,
	DefaultWork,
	splitAnswer,
	$message,
	MessageElement,
	$store,
	domSearch,
	domSearchAll,
	SearchResult
} from '@ocsjs/core';

import { CommonProject } from './common';
import { auto, workConfigs, volume, restudy } from '../utils/configs';
import { createWorkerControl, optimizationTextWithImage } from '../utils/work';
import md5 from 'md5';
// @ts-ignore
import Typr from 'typr.js';
import { $console } from './background';
import { el } from '../../../core/src/utils/dom';
import { createRangeTooltip } from '../utils';
import debounce from 'lodash/debounce';

/**
 *
 *  将繁体字映射载入内存。
 *  为什么不存 localStorage 和 GM_setValue
 *  localStorage: 存在被检测风险，谁都能访问
 *  GM_setValue: 文件太大影响I/O速度
 */
// @ts-ignore
$gm.unsafeWindow.typrMapping = undefined;

const state = {
	study: {
		currentMedia: undefined as HTMLMediaElement | undefined,
		videojs: Object.create({}),
		hacked: false
	}
};

export const CXProject = Project.create({
	name: '学习通',
	level: 99,
	domains: ['chaoxing.com', 'edu.cn', 'org.cn'],
	studyProject: true,
	scripts: {
		study: new Script({
			name: '课程学习',
			namespace: 'cx.new.study',
			url: [
				['任务点页面', '/knowledge/cards'],
				['阅读任务点', '/readsvr/book/mooc']
			],
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'自动答题前请在 “通用-全局设置” 中设置题库配置。',
						['任务点不是顺序执行，如果某一个任务没有动', '请查看是否有其他任务正在学习，耐心等待即可。'],
						'闯关模式请注意题库如果没完成，需要自己完成才能解锁章节。'
					]).outerHTML
				},
				playbackRate: {
					label: '视频倍速',
					attrs: {
						type: 'range',
						title:
							'高倍速(大于1倍)可能导致: \n- 学习记录清空\n- 频繁验证码\n超星后台可以看到学习时长\n请谨慎设置❗\n如果设置后无效则是超星不允许使用倍速。',
						step: 0.5,
						min: 1,
						max: 16
					},
					defaultValue: 1,
					onload() {
						createRangeTooltip(this, '1', (val) => (parseFloat(val) > 2 ? `${val}x - 高倍速警告！` : `${val}x`));
					}
				},
				volume,
				restudy
			},
			onrender({ panel }) {
				if (!CommonProject.scripts.settings.cfg.answererWrappers?.length) {
					const setting = el('button', { className: 'base-style-button-secondary' }, '通用-全局设置');
					setting.onclick = () => $script.pin(CommonProject.scripts.settings);
					panel.body.replaceChildren(
						el('hr'),
						el('div', {}, [
							'【警告】检测到未设置题库配置，将无法自动答题，',
							el('br'),
							'请切换到 ',
							setting,
							' 页面进行配置。'
						])
					);
				}
			},
			async oncomplete() {
				/** iframe 跨域问题， 必须在 iframe 中执行 ， 所以脱离学习脚本运行。 */
				if (/\/readsvr\/book\/mooc/.test(location.href)) {
					$console.log('阅读脚本启动');
					setTimeout(() => {
						// @ts-ignore
						// eslint-disable-next-line no-undef
						readweb.goto(epage);
					}, 5000);

					return;
				}

				await $.sleep(5000);

				const updateMediaState = () => {
					if (state.study.currentMedia) {
						// 倍速设置
						state.study.currentMedia.playbackRate = parseFloat(this.cfg.playbackRate.toString());
						// 音量设置
						state.study.currentMedia.volume = this.cfg.volume;
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
		}),
		chapterGuide: new Script({
			name: '章节提示',
			namespace: 'cx.chapter.guide',
			url: [['课程章节', '/mooc2-ans/mycourse/studentcourse']],
			level: 9,
			configs: {
				notes: { defaultValue: '请点击任意章节进入课程。' },
				autoStudy: {
					label: '5秒后自动进入课程',
					defaultValue: true,
					attrs: { type: 'checkbox' }
				}
			},
			oncomplete() {
				$script.pin(this);
				const run = () => {
					if (this.cfg.autoStudy) {
						this.cfg.notes = '请点击任意章节进入课程，5秒后自动进入。';
						const list = $$el('.catalog_task .catalog_jindu');
						setTimeout(() => {
							if (list.length) {
								list[0].click();
							} else {
								this.cfg.notes = '全部任务已完成！';
								$model('alert', {
									content: '全部任务已完成！',
									notification: true,
									notificationOptions: { important: true, duration: 0 }
								});
							}
						}, 5000);
					}
				};
				run();
				this.onConfigChange('autoStudy', run);
			}
		}),
		work: new Script({
			name: '作业脚本',
			url: [['作业页面', '/mooc2/work/dowork']],
			namespace: 'cx.new.work',
			level: 99,
			configs: workConfigs,
			async oncomplete() {
				const changeMsg = () => $message('info', { content: '检测到设置更改，请重新进入，或者刷新作业页面进行答题。' });
				this.onConfigChange('upload', changeMsg);
				this.onConfigChange('auto', changeMsg);

				let worker: OCSWorker<any> | undefined;
				let warn: MessageElement | undefined;

				this.on('render', () => createWorkerControl(this, () => worker));
				this.event.on('start', () => start());
				this.event.on('restart', () => {
					worker?.emit('close');
					$message('info', { content: '3秒后重新答题。' });
					setTimeout(start, 3000);
				});

				/** 开始答题 */
				const start = async () => {
					warn?.remove();
					// 识别繁体字
					await mappingRecognize();
					worker = workOrExam('work', CommonProject.scripts.settings.cfg);
				};

				if (this.cfg.auto) {
					// 自动开始
					$creator.workPreCheckMessage({
						onrun: start,
						ondone: () => {
							this.event.emit('done');
						},
						...CommonProject.scripts.settings.cfg
					});
				} else {
					this.event.emit('done');
					warn = $message('warn', {
						duration: 0,
						content: '自动答题已被关闭！请手动点击开始答题，或者忽略此警告'
					});
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
		exam: new Script({
			name: '考试脚本',
			url: [['整卷预览页面', '/mooc2/exam/preview']],
			namespace: 'cx.new.exam',
			level: 99,
			configs: {
				notes: {
					defaultValue: $creator.notes([
						'答题前请在 “通用-全局设置” 中设置题库配置，才能开始自动答题。',
						'可以搭配 “通用-在线搜题” 一起使用。',
						'考试请在脚本自动答题完成后自行检查，自己点击提交，脚本不会自动提交。',
						'如果开启后脚本仍然没有反应，请刷新页面重试。'
					]).outerHTML
				},
				auto: auto
			},
			async oncomplete() {
				// 删除水印
				$$el('body > .mask_div').forEach((el) => el.remove());

				const changeMsg = () => $message('info', { content: '检测到设置更改，请重新进入，或者刷新作业页面进行答题。' });

				this.onConfigChange('auto', changeMsg);

				let worker: OCSWorker<any> | undefined;
				let warn: MessageElement | undefined;

				this.event.on('start', () => start());
				this.event.on('restart', () => {
					worker?.emit('close');
					$message('info', { content: '3秒后重新答题。' });
					setTimeout(start, 3000);
				});

				/** 开始考试 */
				const start = async () => {
					warn?.remove();
					// 识别繁体字
					await mappingRecognize();
					worker = workOrExam('exam', { ...CommonProject.scripts.settings.cfg, upload: 'nomove' });
				};

				/** 显示答题控制按钮 */
				createWorkerControl(this, () => worker);

				this.on('render', () => createWorkerControl(this, () => worker));

				if (this.cfg.auto) {
					$creator.workPreCheckMessage({
						onrun: start,
						ondone: () => {
							this.event.emit('done');
						},
						...CommonProject.scripts.settings.cfg,
						upload: 'nomove'
					});
				} else {
					this.event.emit('done');
					warn = $message('warn', {
						duration: 0,
						content: '自动答题已被关闭！请手动点击开始答题，或者忽略此警告'
					});
				}
			}
		}),
		guide: new Script({
			name: '使用提示',
			url: [
				['首页', 'https://www.chaoxing.com'],
				['旧版个人首页', 'chaoxing.com/space/index'],
				['新版个人首页', 'chaoxing.com/base'],
				['课程首页', 'chaoxing.com/mycourse']
			],
			level: 99,
			namespace: 'cx.guide',
			configs: {
				notes: {
					defaultValue: `请手动进入视频、作业、考试页面，脚本会自动运行。`
				}
			},
			onactive() {
				$script.pin(this);
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
			onstart() {
				try {
					if (typeof $gm.unsafeWindow.$EDITORUI !== 'undefined') {
						const EDITORUI = $gm.unsafeWindow.$EDITORUI;
						for (const key in EDITORUI) {
							const ui = EDITORUI[key];
							// eslint-disable-next-line no-proto
							if (ui?.__proto__?.uiName === 'editor') {
								ui.editor.removeListener('beforepaste', $gm.unsafeWindow.editorPaste);
								$console.log('成功屏蔽复制粘贴限制');
							}
						}
					}
				} catch {}
			},
			oncomplete() {
				this.onstart?.();
				setTimeout(() => this.onstart?.(), 5000);
			}
		}),
		recognize: new Script({
			name: '繁体字识别',
			url: [['章节测试', '/work/doHomeWorkNew']],
			hideInPanel: true,
			oncomplete() {
				setTimeout(async () => {
					await mappingRecognize();
				}, 3000);
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

				$script.pin(CXProject.scripts.study);

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
		})
	}
});

export function workOrExam(
	type: 'work' | 'exam' = 'work',
	{ answererWrappers, period, timeout, retry, upload, thread, skipAnswered, uncheckAllChoice }: CommonWorkOptions
) {
	$message('info', { content: `开始${type === 'work' ? '作业' : '考试'}` });

	// 清空搜索结果
	$store.setTab('common.work-results.results', []);
	// 置顶搜索结果面板
	$script.pin(CommonProject.scripts.workResults);

	/** 新建答题器 */
	const worker = new OCSWorker({
		root: '.questionLi',
		elements: {
			title: [
				/** 题目标题 */
				(root) => $el('h3', root)
				// /** 连线题第一组 */
				// (root) => $el('.line_wid_half.fl', root),
				// /** 连线题第二组 */
				// (root) => $el('.line_wid_half.fr', root)
			],
			options: '.answerBg .answer_p, .textDIV, .eidtDiv',
			type: type === 'exam' ? 'input[name^="type"]' : 'input[id^="answertype"]',
			lineAnswerInput: '.line_answer input[name^=answer]',
			lineSelectBox: '.line_answer_ct .selectBox ',
			checkedChoice: '[class*="check_answer"]',
			/** 阅读理解 */
			reading: '.reading_answer',
			/** 完形填空 */
			filling: '.filling_answer'
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 0,
		timeout: timeout ?? 30,
		retry: retry ?? 2,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) => {
			const title: string = StringUtils.of(
				elements.title
					.filter((t) => t.innerText)
					.map((t) => optimizationTextWithImage(t))
					.join(',')
			)
				.nowrap()
				.nospace()
				.toString()
				.trim()
				/** 新版题目冗余 */
				.replace(/\d+\.\s*\((.+题|名词解释|完形填空|阅读理解), .+分\)/, '')
				/** 旧版题目冗余 */
				.replace(/[[|(|【|（]..题[\]|)|】|）]/, '')
				.trim();

			if (title) {
				return defaultAnswerWrapperHandler(answererWrappers, { type, title, root: ctx.root });
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},

		work: async (ctx) => {
			const { elements, searchResults } = ctx;
			const typeInput = elements.type[0] as HTMLInputElement;
			const type = getQuestionType(parseInt(typeInput.value));

			if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
				const resolver = defaultQuestionResolve(ctx)[type];

				return await resolver(searchResults, elements.options, (type, answer, option) => {
					// 如果存在已经选择的选项
					if (skipAnswered && elements.checkedChoice.length) {
						// 跳过
					} else {
						if (type === 'judgement' || type === 'single' || type === 'multiple') {
							if (elements.checkedChoice.length === 0) {
								option.click();
							}
						} else if (type === 'completion' && answer.trim()) {
							const text = option.querySelector('textarea');
							const textareaFrame = option.querySelector('iframe');
							if (text) {
								text.value = answer;
							}
							if (textareaFrame?.contentDocument) {
								textareaFrame.contentDocument.body.innerHTML = answer;
							}
							if (option.parentElement) {
								/** 如果存在保存按钮则点击 */
								$el('[onclick*=saveQuestion]', option.parentElement)?.click();
							}
						}
					}
				});
			}
			// 连线题自定义处理
			else if (type && type === 'line') {
				for (const answers of searchResults.map((res) => res.answers.map((ans) => ans.answer))) {
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
				return readerAndFillHandle(searchResults, elements.filling);
			}
			// 阅读理解
			else if (type && type === 'reader') {
				return readerAndFillHandle(searchResults, elements.reading);
			}

			return { finish: false };
		},

		/** 完成答题后 */
		onResultsUpdate(res) {
			$store.setTab('common.work-results.results', $.simplifyWorkResult(res));
		},
		onResolveUpdate(res) {
			CommonProject.scripts.workResults.cfg.totalQuestionCount = worker.totalQuestionCount;
			CommonProject.scripts.workResults.cfg.requestIndex = worker.requestIndex;
			CommonProject.scripts.workResults.cfg.resolverIndex = worker.resolverIndex;
		},
		async onElementSearched(elements) {
			if (uncheckAllChoice) {
				for (const el of elements.checkedChoice) {
					el.parentElement?.click();
					await $.sleep(200);
				}
			}
		}
	});

	worker
		.doWork()
		.then((results) => {
			if (type === 'exam') {
				$message('success', { duration: 0, content: '考试完成，为了安全考虑，请自行检查后自行点击提交！' });
			} else {
				// 处理提交
				worker.uploadHandler({
					type: upload,
					results,
					async callback(finishedRate, uploadable) {
						$message('info', {
							content: `完成率 ${finishedRate.toFixed(2)} :  ${uploadable ? '5秒后将自动提交' : '5秒后将自动保存'} `
						});

						await $.sleep(5000);
						if (uploadable) {
							//  提交
							$el('.completeBtn').click();
							await $.sleep(2000);
							// @ts-ignore 确定
							// eslint-disable-next-line no-undef
							$gm.unsafeWindow.submitWork();
						} else {
							// @ts-ignore 暂时保存
							// eslint-disable-next-line no-undef
							$gm.unsafeWindow.saveWork();
						}
					}
				});
			}
		})
		.catch((err) => {
			$message('error', { content: '答题程序发生错误 : ' + err.message });
		});

	return worker;
}

/**
 * 繁体字识别-字典匹配
 * @see 参考 https://bbs.tampermonkey.net.cn/thread-2303-1-1.html
 */
async function mappingRecognize() {
	// @ts-ignore
	$gm.unsafeWindow.typrMapping =
		// @ts-ignore
		$gm.unsafeWindow.top.typrMapping ||
		// @ts-ignore
		$gm.unsafeWindow.typrMapping ||
		(await loadTyprMapping());

	/** 判断是否有繁体字 */
	const fontFaceEl = Array.from(document.head.querySelectorAll('style')).find((style) =>
		style.textContent?.includes('font-cxsecret')
	);
	// @ts-ignore
	const fontMap = $gm.unsafeWindow.typrMapping;

	if (fontFaceEl) {
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

			const fonts = CXAnalyses.getSecretFont();
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
		}
	}

	function base64ToUint8Array(base64: string) {
		const data = window.atob(base64);
		const buffer = new Uint8Array(data.length);
		for (let i = 0; i < data.length; ++i) {
			buffer[i] = data.charCodeAt(i);
		}
		return buffer;
	}
}

async function loadTyprMapping() {
	$console.log('正在加载繁体字库。');
	return await request('https://cdn.ocsjs.com/resources/font/table.json', {
		type: 'GM_xmlhttpRequest',
		method: 'get',
		contentType: 'json'
	});
}

/**
 * cx分析工具
 */
const CXAnalyses = {
	/** 是否处于闯关模式 */
	isInBreakingMode() {
		return Array.from(top?.document.querySelectorAll('.catalog_points_sa') || []).length !== 0;
	},
	/** 是否为闯关模式，并且当前章节卡在最后一个待完成的任务点 */
	isStuckInBreakingMode() {
		if (this.isInBreakingMode()) {
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

			console.log('视频解析完成');
		}
	}
}

/**
 * cx 任务学习
 */
export async function study(opts: {
	restudy: boolean;
	playbackRate: number;
	volume: number;
	workOptions: CommonWorkOptions;
}) {
	const tasks = searchTask(opts);

	for (const task of tasks) {
		try {
			await $.sleep(3000);
			await task();
		} catch (e) {
			$console.error('未知错误', e);
		}
	}

	// 下一章按钮
	const { next } = domSearch({ next: '.next[onclick^="PCount.next"]' }, top?.document);

	// 如果按钮显示
	if (next !== null && next.style.display === 'block') {
		// 如果即将切换到下一章节
		if (CXAnalyses.isInFinalTab()) {
			if (CXAnalyses.isStuckInBreakingMode()) {
				$message('warn', {
					content: '检测到此章节重复进入, 为了避免无限重复, 请自行手动完成后手动点击下一章, 或者刷新重试。'
				});
				return;
			}
		}

		$console.log('完成, 即将跳转, 如卡死请自行点击下一章。');
		await $.sleep(3000);
		next.click();
		// 如果当前存在任务点未完成，则跳过，运行下一章
		await $.sleep(3000);
		domSearch({ confirm: '.jobFinishTip .nextChapter' }, top?.document).confirm?.click();
	} else {
		if (CXAnalyses.isInFinalChapter()) {
			if (CXAnalyses.isFinishedAllChapters()) {
				$message('success', { content: '全部任务点已完成！' });
			} else {
				$message('warn', { content: '已经抵达最后一个章节！但仍然有任务点未完成，请手动切换至未完成的章节。' });
			}
		} else {
			$message('error', { content: '下一章按钮不存在，请尝试刷新或者手动切换下一章。' });
		}
	}
}

export function searchIFrame(root: Document) {
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
			console.log({ frame });
		}
	}
	return result;
}

/**
 * 搜索任务点
 */
function searchTask(opts: {
	restudy: boolean;
	playbackRate: number;
	volume: number;
	workOptions: CommonWorkOptions;
}): (() => Promise<void> | undefined)[] {
	return searchIFrame(document)
		.map((frame) => {
			const { media, read, chapterTest } = domSearch(
				{
					media: 'video,audio',
					chapterTest: '.TiMu',
					read: '#img.imglook'
				},
				frame.contentDocument || document
			);

			function getJob() {
				if (media) {
					return mediaTask(opts, media as any, frame);
				} else if (read) {
					return readTask(frame);
				} else if (chapterTest) {
					return chapterTestTask(frame, opts.workOptions);
				}
			}
			if (media || read || chapterTest) {
				return () => {
					// @ts-ignore
					let _parent = frame.contentWindow;
					// @ts-ignore
					let jobIndex = getValidNumber(frame.contentWindow?._jobindex, _parent._jobindex);

					while (_parent) {
						// @ts-ignore
						jobIndex = getValidNumber(jobIndex, frame.contentWindow?._jobindex, _parent._jobindex);
						// @ts-ignore
						const attachments = _parent?.JC?.attachments || _parent.attachments;

						if (attachments && typeof jobIndex === 'number') {
							const { name, title, bookname, author } = attachments[jobIndex]?.property || {};
							const jobName = name || title || (bookname ? bookname + author : undefined) || '未知任务';

							// 直接重复学习，不执行任何判断, 章节测试和阅读等任务除外
							if (opts.restudy && !chapterTest && !read) {
								$console.log(jobName, '即将重新学习。');
								return getJob();
							} else if (attachments[jobIndex]?.job === true) {
								$console.log('正在学习：', jobName);
								return getJob();
							} else if (chapterTest && CommonProject.scripts.settings.cfg.forceWork) {
								$console.log(jobName, '开启强制答题。');
								return getJob();
							} else {
								$console.log(jobName, '已经完成，即将跳过。');
								break;
							}
						}
						// @ts-ignore
						if (_parent.parent === _parent) {
							break;
						}
						// @ts-ignore
						_parent = _parent.parent;
					}
				};
			} else {
				return undefined;
			}
		})
		.filter((f) => f) as any[];
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
function mediaTask(
	setting: { playbackRate: number; volume: number },
	media: HTMLMediaElement,
	frame: HTMLIFrameElement
) {
	const { playbackRate = 1, volume = 0 } = setting;

	// @ts-ignore
	const { videojs } = domSearch({ videojs: '#video,#audio' }, frame.contentDocument || document);

	if (!videojs) {
		$message('error', { content: '视频检测不到，请尝试刷新或者手动切换下一章。' });
		return;
	}

	state.study.videojs = videojs;
	state.study.currentMedia = media;

	// 固定视频进度
	fixedVideoProgress();

	/**
	 * 视频播放
	 */
	return new Promise<void>((resolve) => {
		if (media) {
			// 播放
			const play = () => {
				return new Promise((resolve, reject) => {
					const isPlaying =
						media.currentTime > 0 && !media.paused && !media.ended && media.readyState > media.HAVE_CURRENT_DATA;
					if (!isPlaying) {
						media
							.play()
							.then((result) => {
								resolve(isPlaying);
							})
							.catch((err) => {
								resolve(isPlaying);
								console.error(err);
							});
					}
				});
			};

			media.volume = volume;
			play();
			media.playbackRate = playbackRate;

			const playFunction = debounce(() => {
				if (!play()) {
					$console.log('视频播放完毕');
					media.removeEventListener('pause', playFunction);
				}
			}, 1000);

			media.addEventListener('pause', playFunction);

			media.addEventListener('ended', () => resolve());
		}
	});
}

/**
 * 阅读 ppt
 */
async function readTask(frame?: HTMLIFrameElement) {
	// @ts-ignore
	const finishJob = frame?.contentWindow?.finishJob;
	if (finishJob) finishJob();
	await $.sleep(3000);
}

/**
 * 章节测验
 */
async function chapterTestTask(
	frame: HTMLIFrameElement,

	{ answererWrappers, period, timeout, retry, upload, thread, skipAnswered }: CommonWorkOptions
) {
	if (!auto) {
		return $console.warn('自动答题未开启，请在课程学习设置中开启或者忽略此信息。');
	}

	if (answererWrappers === undefined || answererWrappers.length === 0) {
		return $console.warn('检测到题库配置为空，无法自动答题，请前往 “通用-全局设置” 页面进行配置。');
	}

	$console.info('开始章节测试');

	const frameWindow = frame.contentWindow?.window;

	const { TiMu } = domSearchAll({ TiMu: '.TiMu' }, frameWindow!.document);

	// 清空搜索结果
	$store.setTab('common.work-results.results', []);
	// 置顶搜索结果面板
	$script.pin(CommonProject.scripts.workResults);

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
			lineSelectBox: '.line_answer_ct .selectBox ',
			checkedChoice: '[class="before-after-checkbox Hover"]'
		},
		/** 其余配置 */
		requestPeriod: period ?? 3,
		resolvePeriod: 0,
		timeout: timeout ?? 30,
		retry: retry ?? 2,
		thread: thread ?? 1,
		/** 默认搜题方法构造器 */
		answerer: (elements, type, ctx) => {
			const title: string = StringUtils.of(
				elements.title
					.filter((t) => t.innerText)
					.map((t) => optimizationTextWithImage(t))
					.join(',')
			)
				.nowrap()
				.nospace()
				.toString()
				.trim()
				/** 新版题目冗余 */
				.replace(/\d+\.\s*\((.+题|名词解释|完形填空|阅读理解), .+分\)/, '')
				/** 旧版题目冗余 */
				.replace(/[[|(|【|（]..题[\]|)|】|）]/, '')
				.trim();

			if (title) {
				return defaultAnswerWrapperHandler(answererWrappers, { type, title, root: ctx.root });
			} else {
				throw new Error('题目为空，请查看题目是否为空，或者忽略此题');
			}
		},

		work: async (ctx) => {
			const { elements, searchResults } = ctx;
			const typeInput = elements.type[0] as HTMLInputElement;
			const type = typeInput ? getQuestionType(parseInt(typeInput.value)) : undefined;

			if (type && (type === 'completion' || type === 'multiple' || type === 'judgement' || type === 'single')) {
				const resolver = defaultQuestionResolve(ctx)[type];

				const handler: DefaultWork<any>['handler'] = (type, answer, option) => {
					// 如果存在已经选择的选项
					if (skipAnswered && elements.checkedChoice.length) {
						// 跳过
					} else {
						if (type === 'judgement' || type === 'single' || type === 'multiple') {
							if (elements.checkedChoice.length === 0) {
								option.click();
							}
						} else if (type === 'completion' && answer.trim()) {
							const text = option.parentElement?.querySelector('textarea');
							const textareaFrame = option.parentElement?.querySelector('iframe');
							if (text) {
								text.value = answer;
							}
							if (textareaFrame?.contentDocument) {
								textareaFrame.contentDocument.body.innerHTML = answer;
							}
							if (option.parentElement) {
								/** 如果存在保存按钮则点击 */
								$el('[onclick*=saveQuestion]', option.parentElement)?.click();
							}
						}
					}
				};

				return await resolver(searchResults, elements.options, handler);
			}
			// 连线题自定义处理
			else if (type && type === 'line') {
				for (const answers of searchResults.map((res) => res.answers.map((ans) => ans.answer))) {
					let ans = answers;
					if (ans.length === 1) {
						ans = splitAnswer(ans[0]);
					}
					if (ans.filter(Boolean).length !== 0 && elements.lineAnswerInput) {
						//  选择答案
						for (let index = 0; index < elements.lineSelectBox.length; index++) {
							const box = elements.lineSelectBox[index];
							if (ans[index]) {
								$el(`li[data=${ans[index]}] a`, box).click();
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
			await $store.setTab('common.work-results.results', $.simplifyWorkResult(res));

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
					option.parentElement?.querySelector('a,label')?.click();
				} else if (commonSetting['randomWork-complete'] && type === 'completion') {
					$console.log('正在随机作答');

					// 随机填写答案
					for (const option of options) {
						const textarea = option.parentElement?.querySelector('textarea');
						const completeTexts = commonSetting['randomWork-completeTexts-textarea'].split('\n').filter(Boolean);
						const text = completeTexts[Math.floor(Math.random() * completeTexts.length)];
						const textareaFrame = option.parentElement?.querySelector('iframe');

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
			CommonProject.scripts.workResults.cfg.totalQuestionCount = worker.totalQuestionCount;
			CommonProject.scripts.workResults.cfg.requestIndex = worker.requestIndex;
			CommonProject.scripts.workResults.cfg.resolverIndex = worker.resolverIndex;
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

	// 处理提交
	await worker.uploadHandler({
		type: upload,
		results,
		async callback(finishedRate, uploadable) {
			$message('info', {
				content: `完成率 ${finishedRate.toFixed(2)} :  ${uploadable ? '5秒后将自动提交' : '5秒后将自动保存'} `
			});

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
		: [2, 4, 5, 6, 7].some((t) => t === val)
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
async function readerAndFillHandle(searchResults: SearchResult[], list: HTMLElement[]) {
	for (const answers of searchResults.map((res) => res.answers.map((ans) => ans.answer))) {
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
