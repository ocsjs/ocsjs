import { $, $elements, Project, Script, $message, $modal, $el, $$el, h, cors, $ui } from 'easy-us';
import {
	OCSWorker,
	StringUtils,
	createDefaultQuestionResolver,
	defaultWorkTypeResolver,
	WorkResult
} from '@ocsjs/core';
import { $msg, playMedia, CommonWorkOptions } from '../utils';
import { createSteps } from '../utils/ui';
import { restudy, volume } from '../utils/configs';
import { waitForElement } from '../utils/study';
import { CommonProject } from './common';
import { $console, BackgroundProject } from './background';
import { FontDecryptor, findFontUrls, listFontFaces, watchElements } from '../utils/font-decrypt';
import type { WatchController } from '../utils/font-decrypt';
import { createCommonAnswerer, extractTextWithImages, removeRedundantWords, simplifyWorkResult } from '../utils/work';

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
				['学习内容界面', '/v2/web/studentLog'],
				['长江雨课堂手机版主页', '/m/v2/course/normalcourse/logs']
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
					$message.info('请点击任意视频，进入自动学习。');
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
				['视频讨论界面', /v2\/web\/lms\/.*\/forum/],
				['PPT界面', /v2\/web\/studentCards\/.*\/ppt/]
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
				// 监听音量
				this.onConfigChange(
					'volume',
					debounce(() => $message.info('音量设置已修改，刷新页面后生效'), 200)
				);

				// 监听速度
				this.onConfigChange(
					'playbackRate',
					debounce(() => $message.info('倍速设置已修改，刷新页面后生效'), 200)
				);

				// 获取当前章节名称
				const getJobName = (leaf: HTMLElement) => leaf.querySelector('.leaf-title')?.textContent || '未知章节';
				// 跳转到学习界面
				const gotoStudyUrl = () => {
					location.href = this.cfg.currentStudyUrl;
				};

				// ===================================== 首页脚本 ==================================
				if (
					document.location.pathname.includes('/v2/web/studentLog') ||
					document.location.pathname.includes('/studycontent')
				) {
					// 自动点击学习内容
					const tab = await waitForElement(() =>
						Array.from<HTMLElement>(document.querySelectorAll('.ykt-main-tab [class*=nav-item]')).find((el) =>
							(el.textContent || '').includes('学习内容')
						)
					);
					console.log(tab);
					tab?.click();
					return;
				}

				// ===================================== PPT ==================================
				if (document.location.pathname.match(/v2\/web\/studentCards\/.*\/ppt/)) {
					$message.info('正在学习PPT中，请耐心等待...');
					for (let item of Array.from<HTMLElement>(document.querySelectorAll('.swiper-container .container')).filter(
						(el) => !!el.querySelector('.noRead')
					)) {
						await $.sleep(1000);
						item.click();
					}
					const title = document.querySelector('.layout-header .progress .title')?.textContent || '';
					$msg.info(`PPT ${title} 学习完成，即将自动进入下一节`);
					setTimeout(gotoStudyUrl, 3000);
					return;
				}

				// ===================================== 视频脚本 ==================================

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
						setTimeout(gotoStudyUrl, 3000);
					} catch (e) {
						$msg.error({ content: String(e), duration: 0 });
					}
					return;
				}

				if (/v2\/web\/lms\/.*\/forum/.test(document.location.pathname)) {
					$message.info('正在学习视频讨论区，请耐心等待...');
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
					setTimeout(gotoStudyUrl, 3000);
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

				const leafs = Array.from(document.querySelectorAll<HTMLElement>('.leaf-detail'));
				for (let index = 0; index < leafs.length; index++) {
					const leaf = leafs[index];
					leaf.addEventListener('click', () => {
						// 点击小节时，记录当前小节的索引和学习页面的URL，防止刷新后无法继续学习
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
			matches: [
				['AI学伴课程界面', '/ai-workspace/lms-graph'],
				['AI学伴课程界面手机版', '/ai-workspace/lms-graph-mobile']
			],
			namespace: 'yuketang.study.ai',
			configs: {
				notes: {
					defaultValue: $ui.notes([
						'请点击任意小节，脚本会自动运行，并自动下一节。',
						'修改音量、倍速后请刷新页面使设置生效。',
						'遇到作业任务点时可自动搜题作答（需在 通用-全局设置 中配置题库）。'
					]).outerHTML
				},
				restudy: restudy,
				problemWork: {
					label: '作业自动答题',
					attrs: { type: 'checkbox', title: '遇到作业任务点时自动搜题作答并按设置提交（需配置题库）' },
					defaultValue: true
				},
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
				if (location.href.includes('ai-workspace/lms-graph-mobile')) {
					await $message.warn('即将切换到电脑版AI课程...');
					await $.sleep(3000);
					location.href = location.href.replace('lms-graph-mobile', 'lms-graph');
					return;
				}

				await $.sleep(3000);

				// 监听音量
				this.onConfigChange(
					'volume',
					debounce(() => $message.info('音量设置已修改，刷新页面后生效'), 200)
				);

				// 监听速度
				this.onConfigChange(
					'playbackRate',
					debounce(() => $message.info('倍速设置已修改，刷新页面后生效'), 200)
				);

				// // 展开5次章节，确保所有章节都被展开
				// const max_level = 5;
				// for (let i = 0; i < max_level; i++) {
				// 	document.querySelectorAll<HTMLElement>('.expand-icon:not(.is-expanded )').forEach((el) => el.click());
				// 	await $.sleep(100);
				// }

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
					$message.info('等待任务加载中...');
					await waitForElement('.detail-container', {
						timeout_seconds: 10 * 1000
					});
					$message.info('即将开始自动学习');
				} catch (e) {
					$message.error('元素加载失败，请刷新界面重试。');
				}

				const study = async () => {
					try {
						if ($el('.detail-container video')) {
							$msg.info('即将开始视频学习：' + getJobName());
							await v2_watch({
								volume: this.cfg.volume,
								playbackRate: this.cfg.playbackRate
							});
							$msg.success('视频学习完成');
							await $.sleep(3000);
						}

						if ($el('.detail-container .lms-graph-exercise')) {
							// 作业任务点：题目在 iframe（#iframeExerciseId -> /v2/web/iframe-exercise）内，
							// 与主页面同源，可通过 contentDocument 访问
							if (this.cfg.problemWork) {
								const workOpts = CommonProject.scripts.settings.methods.getWorkOptions();
								const exerciseIframe = $el('.detail-container .lms-graph-exercise iframe#iframeExerciseId') as
									| HTMLIFrameElement
									| undefined;
								if (workOpts.answererWrappers.length === 0) {
									$message.warn('检测到作业任务点，但未配置题库，跳过自动答题。');
								} else if (!exerciseIframe) {
									$console.warn('作业任务点结构未识别（缺少 iframe#iframeExerciseId），跳过自动答题。');
								} else if (!exerciseIframe.contentDocument) {
									$console.warn('作业 iframe 无法访问（可能跨域），跳过自动答题。');
								} else {
									$message.info('检测到作业任务点，等待作业页面加载...');
									// 等 iframe 内题目区域渲染（waitForElement 超时单位：秒，超时时 resolve undefined）
									const questionRoot = await waitForElement(
										() =>
											exerciseIframe.contentDocument?.querySelector<HTMLElement>('.container-problem .subject-item'),
										{ timeout_seconds: 20, check_period_ms: 200 }
									);
									if (!questionRoot) {
										$console.warn('作业页面加载超时，跳过自动答题。');
									} else {
										$message.info('开始自动答题...');
										await answerYktEmbeddedProblem(workOpts, exerciseIframe.contentDocument);
										$message.success('作业任务点答题完成。');
									}
								}
							}
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
		})
	}
});

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

	// 尝试等待加密文字元素渲染（SPA 异步加载）；超时也不返回——
	// 监听器会在加密文字后续出现时自动解密（如从其他页面 SPA 跳转进来）
	// 注意：不能用 waitForElement——它写死全局 document，而加密文字可能在
	// iframe 的 document 里（会白等整个超时）。这里按 doc 短轮询，即时命中。
	const waitStart = Date.now();
	while (!doc.querySelector(YKT_ENCRYPTED_SELECTOR) && Date.now() - waitStart < 3000) {
		await $.sleep(200);
	}
	if (!doc.querySelector(YKT_ENCRYPTED_SELECTOR)) {
		$console.log('暂未检测到加密文字，将持续监听页面变化。');
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
		$console.log(`[font-decrypt] 考试字体: ${examFontUrl}`);

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
					$message.info('字体解密完成，切换题目时将自动解密新内容。');
				}
				$console.log(`[font-decrypt] 字体 ${family} 解密完成（映射表累计 ${decryptor.size} 字）。`);
			} catch (err) {
				$console.error(`[font-decrypt] 字体 ${family} 解密失败：`, String(err));
				markFailed(groupEls);
			}
		}
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
		() => void 0,
		() => void 0
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
	if (typeText.includes('填空') || typeText.includes('简答') || typeText.includes('问答')) {
		return 'completion';
	}
	return undefined;
}

/** 当前激活题目的标识（题号+题型，如 "4.单选题(1分)"），用于检测切题与防死循环 */
function currentYktQuestionMarker(doc: Document): string {
	return doc.querySelector('.container-problem .subject-item .item-type')?.textContent?.replace(/\s+/g, '') ?? '';
}

/** 按按钮文本查找可用按钮（上一题/下一题/提交） */
function findYktTextButton(text: string, doc: Document): HTMLButtonElement | undefined {
	return Array.from(doc.querySelectorAll<HTMLButtonElement>('button')).find(
		(b) => b.textContent?.trim() === text && !b.disabled && !b.classList.contains('is-disabled')
	);
}

/**
 * 处理"批量提交提示"弹窗：
 * 存在已作答但未提交的题目时，点击"提交"或"下一题"会弹出
 * "N 道已作答习题未提交，需要一起提交吗？"（.homework-problem-batch-submit-dialog），
 * 统一选择"仅提交本题"（不触发批量提交，保持逐题提交策略）。
 * 返回是否处理了这个弹窗。
 */
async function handleYktBatchSubmitDialog(doc: Document): Promise<boolean> {
	const dialog = doc.querySelector('.homework-problem-batch-submit-dialog');
	// 注意：雨课堂的弹窗（batch-submit/change-guard/blank-submit）常驻 DOM，
	// 通过 display:none 隐藏，必须检查可见性，否则会误判为弹窗一直存在而误点
	const wrapper = dialog?.closest('.el-dialog__wrapper');
	if (!dialog || !wrapper || (wrapper as HTMLElement).offsetParent === null) {
		return false;
	}
	const btn = Array.from(dialog.querySelectorAll<HTMLElement>('.rain-btn')).find((b) =>
		b.textContent?.trim().includes('仅提交本题')
	);
	if (btn) {
		btn.click();
		$console.log('[answer] 检测到批量提交提示弹窗，已选择"仅提交本题"。');
		// 等弹窗关闭
		await $.sleep(500);
	}
	return true;
}

/**
 * 提交当前题目的答案。
 * 雨课堂平台切换题目不会自动保存答案，必须每题作答后立即点击"提交"。
 * 返回是否成功发起提交（按钮不可用说明本题无可提交内容）。
 */
async function submitYktCurrentQuestion(doc: Document, order: string): Promise<boolean> {
	/** 本题在导航中是否已出现完成标记（提交成功的可靠信号）。
	 *  注意必须用题号定位：提交成功后平台会自动切到下一题，active 已变化 */
	const hasStatusMark = () =>
		!!doc.querySelector(`.problems-aside .subject-item.J_order[data-order="${order}"] .icon-status`);
	// 实测发现偶发"点击提交但未生效"（按钮恢复可用但无完成标记），需要重试
	for (let attempt = 0; attempt < 2; attempt++) {
		const submitBtn = findYktTextButton('提交', doc);
		if (!submitBtn) {
			// 按钮不可用：已提交成功（按钮变为"已提交"/禁用）或无答案可提交
			return attempt > 0 ? hasStatusMark() : false;
		}
		submitBtn.click();
		// 处理可能出现的弹窗（批量提交提示 / element-ui 确认框）；
		// 提交按钮变不可用说明无弹窗直接提交成功，可提前结束等待
		const confirmStart = Date.now();
		while (Date.now() - confirmStart < 5000) {
			if (await handleYktBatchSubmitDialog(doc)) {
				break;
			}
			const confirmBtn = doc.querySelector<HTMLElement>('.el-message-box__btns button.el-button--primary');
			if (confirmBtn) {
				confirmBtn.click();
				break;
			}
			if (!findYktTextButton('提交', doc)) {
				break;
			}
			await $.sleep(300);
		}
		// 等待提交完成（以导航状态标记为准），超时进入重试判定
		const waitStart = Date.now();
		while (Date.now() - waitStart < 10_000) {
			if (hasStatusMark()) {
				return true;
			}
			await $.sleep(300);
		}
		if (attempt === 0) {
			$console.warn('[answer] 提交后未检测到完成状态，重试一次。');
		}
	}
	$console.error('[answer] 提交重试后仍未检测到完成状态。');
	return false;
}

/**
 * 等待当前题目"可用"。就绪条件（需连续两次满足，防 Vue 分批渲染与解密竞态）：
 *   1. 题目标识已渲染（切题后 marker 变化）
 *   2. 正文 .problem-body 有非空文本（防止"题号先渲染、正文经 XHR 后到"时读到空/密文）
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
		const hasContent = !!doc.querySelector('.container-problem .problem-body')?.textContent?.trim();
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
			.filter((t) => t?.innerText)
			.map((t) =>
				t
					? removeRedundantWords(
							StringUtils.of(extractTextWithImages(t).text).nowrap(' ').nospace().toString().trim(),
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
		return extractTextWithImages((textEl as HTMLElement) ?? option).text;
	};

	let totalQuestionCount = 0;
	let requestedCount = 0;
	let resolvedCount = 0;

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
				// 关闭答题的同时清空搜索结果面板与计数，避免残留过期结果
				CommonProject.scripts.workResults.methods.clearResults();
				CommonProject.scripts.workResults.methods.refreshState();
			}
		},
		elements: {
			title: '.problem-body',
			type: '.item-type',
			options: (root) => {
				// 选择题为选项 label（element-ui radio/checkbox）；填空/简答无选项，返回输入框
				const labels = $$el('ul[class*="list-unstyled"] li label', root);
				return labels.length ? labels : $$el('textarea', root);
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
				$console.warn(`[answer] 不支持的题型: ${type}，跳过作答。`);
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
						const textarea =
							option?.tagName === 'TEXTAREA'
								? (option as unknown as HTMLTextAreaElement)
								: (option?.querySelector('textarea') as HTMLTextAreaElement | null);
						if (textarea) {
							textarea.value = answer;
							// Vue 受控组件必须派发 input 事件才能同步数据
							textarea.dispatchEvent(new Event('input', { bubbles: true }));
							await $.sleep(200);
						}
					}
				}
			);
		},
		onResultsUpdate(current, _, res) {
			// 参考 cx.ts L961：逐题追加到搜索结果面板。
			// 无论是否搜到答案都追加（current.result 在搜题失败时同样存在，
			// 失败题目会以红色序号显示，便于用户定位补答）
			if (current.result) {
				CommonProject.scripts.workResults.methods.appendResults(simplifyWorkResult([current], titleTransform));
				totalQuestionCount++;
				requestedCount++;
				resolvedCount++;
			}
			if (current.result?.finish) {
				BackgroundProject.scripts.data.methods.addQuestionCacheFromWorkResult(
					simplifyWorkResult([current], titleTransform)
				);
			}
			CommonProject.scripts.workResults.methods.updateWorkState({
				totalQuestionCount,
				requestedCount,
				resolvedCount
			});
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

	// 左侧导航中的"未完成"题号：无 .icon-status 标记
	//（success=已提交且正确，danger=已提交但错误——均已提交，不应重复作答，
	//  否则可能把已提交的正确答案改错）
	const getUnfinishedNavItems = () =>
		Array.from(doc.querySelectorAll<HTMLElement>('.problems-aside .subject-item.J_order')).filter(
			(el) => !el.querySelector('.icon-status')
		);

	// 左侧题号总数（导航收起时元素仍在 DOM 中）
	const total = doc.querySelectorAll('.problems-aside .subject-item.J_order').length || 1;
	// 已处理的题号（按 data-order 记录，不依赖平台状态刷新，防重复作答）
	const processedOrders = new Set<string>();
	const processedMarkers = new Set<string>();
	let prevMarker: string | null = null;
	let completedAll = false;
	while (worker.isClose === false) {
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
			// 切题时若存在未提交的已作答题目，平台会弹批量提交提示，统一选"仅提交本题"
			const dialogWaitStart = Date.now();
			while (Date.now() - dialogWaitStart < 2000) {
				if (await handleYktBatchSubmitDialog(doc)) {
					break;
				}
				await $.sleep(200);
			}
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
		$console.log(`[answer] 开始作答 第${order}题（${processedOrders.size}/${total}）: ${marker || '未知题目'}`);
		// 刷新题目容器引用（doWork 每次调用都重新读取 root 数组）
		questionRootRef.splice(
			0,
			questionRootRef.length,
			...Array.from(doc.querySelectorAll<HTMLElement>('.container-problem .subject-item'))
		);
		if (questionRootRef.length === 0) {
			$console.warn('[answer] 未找到题目容器，答题结束。');
			break;
		}
		try {
			const results = await worker.doWork();
			allResults.push(...results);
			const finished = !!results[0]?.result?.finish;
			if (!finished) {
				$console.warn(`[answer] 本题未作答成功（可能搜不到答案）: ${marker}`);
			}
			// 平台切换题目不会保存答案，必须每题作答后立即提交
			if (finished) {
				const submitted = await submitYktCurrentQuestion(doc, order);
				if (!submitted) {
					$console.warn(`[answer] 本题提交失败: ${marker}`);
				}
			}
		} catch (err) {
			$console.error('[answer] 答题异常，终止作答：', String(err));
			break;
		}
	}
	$console.log(
		`[answer] 作答循环结束，共处理 ${processedOrders.size}/${total} 题${
			completedAll ? '，未完成题目已全部处理' : '，存在未处理题目'
		}。`
	);
	return { results: allResults, completedAll };
}

/**
 * AI学伴课程中的作业任务点自动答题（学习流程内嵌调用）。
 * 逐题"作答 -> 提交 -> 下一题"（平台切题不保存答案，必须逐题提交），
 * 全部完成后任务点自动标记完成，学习流程继续下一节。
 *
 * @param doc 作业页面所在的 document（AI学伴课程页的作业在 iframe 内，
 *            传 iframe.contentDocument；独立作业页传 document）
 */
async function answerYktEmbeddedProblem(opts: CommonWorkOptions, doc: Document) {
	// 一题一题动态作答，结果逐题累积，标记为动态答题器以显示手动清空按钮
	CommonProject.scripts.workResults.methods.init({ dynamic: true });

	const { worker, questionRootRef } = createYktAnswerWorker(opts);
	const { results, completedAll } = await runYktAnswerLoop(worker, questionRootRef, doc);
	worker.emit('done');

	// 平台切换题目不会保存答案，作答循环中已逐题提交。
	// 未全部完成时给出醒目提示，由用户手动处理剩余题目
	const finishCount = results.filter((r) => r.result?.finish).length;
	if (!completedAll) {
		$message.warn({
			content: `题目未全部完成（已作答提交 ${finishCount}/${results.length} 题），请手动检查剩余题目。`,
			duration: 0
		});
		return;
	}
	$message.success({ content: `作业完成，全部 ${finishCount} 题已作答并逐题提交。`, duration: 0 });
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
			const video_vue_data = document.querySelector<any>('.xtplayer')?.__vue__;
			if (video_vue_data) {
				video_vue_data.player.options.speed.value = parseFloat(options.playbackRate.toString());
				video_vue_data.player.options.volume.value = options.volume;
				// 应用更改的音量和倍速设置
				video_vue_data.player.init();
			}
		}

		const media = (await waitForElement('video', {
			timeout_seconds: 10 * 1000
		})) as HTMLMediaElement | undefined;
		console.log('media', media);
		await $.sleep(1000);
		if (media) {
			state.study.currentMedia = media;
			// 重置视频进度
			media.currentTime = 1;
		}
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
						$message.info({ content: '检测到视频切换中，重新观看...' });
						watch();
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
