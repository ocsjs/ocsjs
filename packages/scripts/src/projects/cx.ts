import {
	ConfigElement,
	Config,
	OCSWorker,
	defaultAnswerWrapperHandler,
	$creator,
	Project,
	Script,
	$script,
	$el,
	$gm,
	el,
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
	MessageElement
} from '@ocsjs/core';

import { CommonProject } from './common';
import { auto, workConfigs } from '../utils/configs';
import { createWorkerControl, optimizationTextWithImage } from '../utils/work';
import md5 from 'md5';
// @ts-ignore
import Typr from 'typr.js';

/**
 *
 *  将繁体字映射载入内存。
 *  为什么不存 localStorage 和 GM_setValue
 *  localStorage: 存在被检测风险，谁都能访问
 *  GM_setValue: 文件太大影响I/O速度
 */
// @ts-ignore
$gm.unsafeWindow.typrMapping = Object.create({});

export const CXProject = Project.create({
	name: '学习通',
	level: 99,
	domains: ['chaoxing.com', 'edu.cn', 'org.cn'],
	scripts: {
		study: new Script({
			name: '课程学习',
			namespace: 'cx.new.study',
			url: []
		}),
		'chapter-guide': new Script({
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
		login: new Script({
			name: '登录脚本',
			url: [['新版登录页面', 'passport2.chaoxing.com/login']],
			level: 9,
			namespace: 'cx.new.login',
			configs: {
				notes: {
					defaultValue: el('ul', [
						el('li', '脚本会自动输入账号密码，但是需要手动填写验证码。'),
						el('li', '脚本用于辅助软件登录，如不想使用可直接关闭。')
					]).outerHTML
				},
				disable: {
					label: '关闭此脚本',
					defaultValue: false,
					attrs: { type: 'checkbox' }
				},
				type: {
					label: '登录类型',
					tag: 'select',
					defaultValue: 'phone' as 'phone' | 'id',
					onload() {
						this.append(
							...$creator.selectOptions(this.getAttribute('value') || '', [
								['phone', '手机号登录'],
								['id', '学号登录']
							])
						);
					}
				}
			},
			onrender({ panel }) {
				let els: Record<string, ConfigElement<any>>;
				/** 监听更改 */
				this.onConfigChange('type', () => {
					for (const key in els) {
						if (Object.prototype.hasOwnProperty.call(els, key)) {
							els[key].remove();
						}
					}
					// 删除后重新渲染
					render();
				});

				const render = () => {
					/** 动态创建设置 */
					const passwordConfig: Config = { label: '密码', defaultValue: '', attrs: { type: 'password' } };
					if (this.cfg.type === 'phone') {
						els = $creator.configs('cx.login', {
							phone: { label: '手机', defaultValue: '' },
							password: passwordConfig
						});
					} else {
						els = $creator.configs('cx.login', {
							school: { label: '学校', defaultValue: '' },
							id: { label: '学号', defaultValue: '' },
							password: passwordConfig
						});
					}

					for (const key in els) {
						if (Object.prototype.hasOwnProperty.call(els, key)) {
							panel.configsBody.append(els[key]);
						}
					}
				};

				render();
			},
			oncomplete() {
				if (!this.cfg.disable) {
					const id = setTimeout(async () => {
						const phoneLogin = $el('#back');
						const idLogin = $el('#otherlogin');

						const phone = $gm.getValue('cx.login.phone');
						const password = $gm.getValue('cx.login.password');
						const school = $gm.getValue('cx.login.school');
						const id = $gm.getValue('cx.login.id');

						if (this.cfg.type === 'phone') {
							if (phone && password) {
								phoneLogin?.click();
								await $.sleep(1000);
								// 动态生成的 config 并不会记录在 this.cfg 中,但是仍然会按照 {namespace + key} 的形式保存在本地存储中，所以这里用 getValue 进行获取
								$el('#phone').value = $gm.getValue('cx.login.phone');
								$el('#pwd').value = $gm.getValue('cx.login.password');

								// 点击登录
								await $.sleep(1000);
								$el('#loginBtn').click();
							} else {
								$message('warn', { content: '信息未填写完整，登录停止。' });
							}
						} else {
							if (school && id && password) {
								idLogin?.click();
								await $.sleep(1000);
								const search = $el('#inputunitname');
								search.focus();
								search.value = $gm.getValue('cx.login.school');
								// @ts-ignore
								$.unsafeWindow.search(search);

								// 等待搜索
								await $.sleep(2000);

								$el('#r1b > li').click();
								$el('#uname').value = $gm.getValue('cx.login.id');
								$el('#password').value = $gm.getValue('cx.login.password');

								$message('info', { content: '请输入验证码后点击登录。' });
							} else {
								$message('warn', { content: '信息未填写完整，登录停止。' });
							}
						}
					}, 3000);
					const close = el('a', '取消');
					const msg = $message('info', { content: el('span', ['3秒后自动登录。', close]) });
					close.href = '#';
					close.onclick = () => {
						clearTimeout(id);
						msg.remove();
					};
				}
			}
		}),
		guide: new Script({
			name: '使用提示',
			url: [
				['首页', 'https://chaoxing.com'],
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
			oncomplete() {
				$script.pin(this);
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
					worker = workOrExam('work', { upload: this.cfg.upload, ...CommonProject.scripts.settings.cfg });
				};

				if (this.cfg.auto) {
					// 自动开始
					$creator.workPreCheckMessage({
						onrun: start,
						ondone: () => {
							this.event.emit('done');
						},
						upload: this.cfg.upload,
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
		'exam-redirect': new Script({
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
					worker = workOrExam('exam', { upload: 'nomove', ...CommonProject.scripts.settings.cfg });
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
						upload: 'nomove',
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
		'version-redirect': new Script({
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
		})
	}
});

export function workOrExam(
	type: 'work' | 'exam' = 'work',
	{ answererWrappers, period, timeout, retry, upload, thread, skipAnswered, uncheckAllChoice }: CommonWorkOptions
) {
	$message('info', { content: `开始${type === 'work' ? '作业' : '考试'}` });

	// 清空搜索结果
	CommonProject.scripts.workResults.cfg.results = [];
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
			checkedChoice: '[class*="check_answer"]'
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
			const val = parseInt(typeInput.value);
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
			 */
			const type: 'single' | 'multiple' | 'judgement' | 'completion' | 'line' | undefined =
				val === 0
					? 'single'
					: val === 1
					? 'multiple'
					: val === 3
					? 'judgement'
					: [2, 4, 5, 6, 7].some((t) => t === val)
					? 'completion'
					: val === 11
					? 'line'
					: undefined;

			if (type && type !== 'line') {
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
					if (ans.length !== 0 && elements.lineAnswerInput) {
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
		onResultsUpdate(res) {
			CommonProject.scripts.workResults.cfg.results = $.simplifyWorkResult(res);
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
		(await request('https://cdn.ocsjs.com/resources/font/table.json', {
			type: 'GM_xmlhttpRequest',
			method: 'get',
			contentType: 'json'
		}));

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
