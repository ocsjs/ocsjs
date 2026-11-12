/**
 * 雨课堂课件（studentCards）自动完成 —— 纯逻辑核心。
 *
 * 设计目标：
 * - 本文件【零依赖】：不 import 任何框架/工具库，只依赖 DOM 类型，因此既能在
 *   脚本运行时（浏览器）使用，也能用 Node 的类型擦除（--experimental-strip-types）
 *   直接跑单元验证（见 tools/verify-yuketang-courseware-core.ts）。
 * - 只做「读状态 + 决策」，不产生副作用（不点击、不 sleep）。真正的点击/播放/答题
 *   由 yuketang.ts 中的驱动执行，便于把易变的 DOM 细节收敛在这里、把流程控制留在驱动里。
 *
 * 覆盖三种页面 + 混合课件：
 * - 图文页（graphic）：课件为 PPT/幻灯片，存在未读标记（noRead），逐页点开即完成。
 * - 视频页（video）：页面内出现 <video>，播放至结束。
 * - 习题页（exercise）：页面内出现习题，交由答题器作答（本核心只负责探测）。
 * - 混合课件（mixed）：同一个课件里既有幻灯片/视频又有习题，驱动按状态循环推进。
 */

/** 课件中一个可操作元素的最小结构（真实 DOM 元素与测试 Mock 都满足） */
export interface DeckElement {
	textContent: string | null;
	className?: string;
	classList?: { contains(token: string): boolean } | null;
	querySelector?(selector: string): DeckElement | null;
	querySelectorAll?(selector: string): ArrayLike<DeckElement>;
	contains?(node: DeckElement | null): boolean;
	click?(): void;
	getAttribute?(name: string): string | null;
}

/** 一个可查询的根（真实由 document 充当，测试由 Mock 充当） */
export interface DeckRoot {
	querySelector(selector: string): DeckElement | null;
	querySelectorAll(selector: string): ArrayLike<DeckElement>;
}

/**
 * 选择器集合。
 *
 * 默认值来自实测证据：
 * - 「雨课堂-自动看PPT-Pro」用户脚本（studentCards 页面）使用 `.ppt_img_box` 打开课件、
 *   `span.flag.noRead` 表示未读页、`.ppt_page` 形如 “(N页)”、`.exercises_total` 形如 “共N题”。
 * - OCS 现有 ppt 脚本（packages/scripts/src/projects/yuketang.ts）使用
 *   `.swiper-container .container` 且内部含 `.noRead` 表示未读页。
 * 多套选择器按「从新到旧」排列，运行时取第一个命中的，从而兼容不同版本的雨课堂前端。
 */
export interface DeckSelectors {
	/** 打开课件查看器的按钮（老版本需要先点一下缩略图） */
	pptOpen: string[];
	/** 未读幻灯片标记（点击后变为已读） */
	slideFlags: string[];
	/** 兼容老版本：以“容器内含 .noRead”表示未读页 */
	slideContainers: string[];
	/** 页码信息文本，如 “(12页)” */
	pageInfo: string[];
	/** 习题总数信息文本，如 “共5题” */
	exerciseTotal: string[];
	/** 课件内的视频元素 */
	video: string[];
	/** 课件内的习题 iframe */
	exerciseFrame: string[];
	/** 课件查看器的关闭按钮 */
	closeButtons: string[];
}

export const DEFAULT_DECK_SELECTORS: DeckSelectors = {
	pptOpen: ['.ppt_img_box'],
	slideFlags: ['span.flag.noRead', '.flag.noRead', '.noRead'],
	slideContainers: ['.swiper-container .container'],
	pageInfo: ['.ppt_page'],
	exerciseTotal: ['.exercises_total'],
	video: ['video'],
	exerciseFrame: [
		'iframe#iframeExerciseId',
		'.lms-graph-exercise iframe',
		'iframe.exercise-iframe',
		'iframe[src*="exercise"]'
	],
	closeButtons: ['.el-button.el-button--default', '.close']
};

/** 课件当前状态快照（只读） */
export interface DeckState {
	/** 是否需要先点击打开课件查看器 */
	hasPptOpenButton: boolean;
	/** 是否已经检测到课件内容（查看器已打开 / 有幻灯片 / 有页码） */
	hasDeckContent: boolean;
	/** 未读幻灯片可点击目标（按点击优先级排序，已去重） */
	unreadTargets: DeckElement[];
	/** 未读数量 */
	unreadCount: number;
	/** 总页数（解析自页码文本，解析失败为 null） */
	totalPages: number | null;
	/** 习题总数（解析自习题文本，解析失败为 null） */
	exerciseTotal: number | null;
	/** 是否存在视频 */
	hasVideo: boolean;
	/** 是否存在习题 iframe */
	hasExerciseFrame: boolean;
}

/** 单步决策结果 */
export type DeckAction = 'open-deck' | 'watch-video' | 'read-slides' | 'solve-exercise' | 'done';

function safeQuery(root: DeckElement | DeckRoot, selector: string): DeckElement | null {
	try {
		return root.querySelector ? root.querySelector(selector) : null;
	} catch {
		return null;
	}
}

function safeQueryAll(root: DeckElement | DeckRoot, selector: string): DeckElement[] {
	try {
		const list = root.querySelectorAll ? root.querySelectorAll(selector) : null;
		if (!list) return [];
		const out: DeckElement[] = [];
		for (let i = 0; i < list.length; i++) {
			const el = list[i];
			if (el) out.push(el);
		}
		return out;
	} catch {
		return [];
	}
}

/** 取多套选择器中第一个命中的元素 */
function firstOf(root: DeckElement | DeckRoot, selectors: string[]): DeckElement | null {
	for (const selector of selectors) {
		const el = safeQuery(root, selector);
		if (el) return el;
	}
	return null;
}

/** 取多套选择器命中的全部元素并去重（保持顺序） */
function allOf(root: DeckRoot, selectors: string[]): DeckElement[] {
	const out: DeckElement[] = [];
	const seen = new Set<DeckElement>();
	for (const selector of selectors) {
		for (const el of safeQueryAll(root, selector)) {
			if (!seen.has(el)) {
				seen.add(el);
				out.push(el);
			}
		}
	}
	return out;
}

/** 从某元素的文本里按正则解析一个整数，解析失败返回 null */
function parseCount(root: DeckElement | DeckRoot, selectors: string[], pattern: RegExp): number | null {
	const el = firstOf(root, selectors);
	const text = el?.textContent ?? '';
	const match = text.match(pattern);
	if (!match) return null;
	const value = parseInt(match[1], 10);
	return Number.isFinite(value) ? value : null;
}

/**
 * 收集“未读幻灯片”的点击目标。
 *
 * 优先返回最内层的标记元素（如 `span.flag.noRead`，点击它最精确）；
 * 对于老版本容器（`.container` 内含 `.noRead`），若其内部标记未被单独收集，则返回容器本身。
 * 返回结果按 DOM 顺序（不同选择器分组拼接，组内保持原顺序）。
 */
export function collectUnreadTargets(root: DeckRoot, selectors: DeckSelectors = DEFAULT_DECK_SELECTORS): DeckElement[] {
	const targets: DeckElement[] = [];
	const seen = new Set<DeckElement>();

	// 1) 最内层未读标记
	for (const el of allOf(root, selectors.slideFlags)) {
		seen.add(el);
		targets.push(el);
	}

	// 2) 老版本：容器内含未读标记，且内部标记没有被单独收集到时，点击容器
	for (const container of allOf(root, selectors.slideContainers)) {
		if (seen.has(container)) continue;
		let innerUnread: DeckElement | null = null;
		for (const flagSelector of selectors.slideFlags) {
			const inner = safeQuery(container, flagSelector);
			if (inner) {
				innerUnread = inner;
				break;
			}
		}
		if (!innerUnread) continue;
		if (seen.has(innerUnread)) continue;
		seen.add(container);
		targets.push(container);
	}

	return targets;
}

/** 读取课件当前状态 */
export function readDeckState(root: DeckRoot, selectors: DeckSelectors = DEFAULT_DECK_SELECTORS): DeckState {
	const unreadTargets = collectUnreadTargets(root, selectors);
	const totalPages = parseCount(root, selectors.pageInfo, /(\d+)\s*页/);
	const exerciseTotal = parseCount(root, selectors.exerciseTotal, /共\s*(\d+)\s*题/);
	const hasVideo = !!firstOf(root, selectors.video);
	const hasExerciseFrame = !!firstOf(root, selectors.exerciseFrame);
	const hasPptOpenButton = !!firstOf(root, selectors.pptOpen);

	// 已打开查看器 / 已出现幻灯片 / 有页码 —— 任一成立即认为课件内容已呈现
	const swiperPresent = !!firstOf(root, ['.swiper-container', '.swiper-container .container']);
	const hasDeckContent =
		swiperPresent || totalPages !== null || unreadTargets.length > 0 || (exerciseTotal !== null && exerciseTotal > 0);

	return {
		hasPptOpenButton,
		hasDeckContent,
		unreadTargets,
		unreadCount: unreadTargets.length,
		totalPages,
		exerciseTotal,
		hasVideo,
		hasExerciseFrame
	};
}

/**
 * 根据状态决定下一步动作。
 *
 * 优先级说明：
 * - 视频优先：若当前是视频页/课件中出现视频，先把视频看完（视频通常不依赖幻灯片翻页）。
 * - 未读幻灯片：逐页阅读。
 * - 习题：幻灯片读完后若出现习题 iframe，交给答题器。
 * - 打开查看器：仅在“存在打开按钮但还没有任何课件内容”时触发。
 * - 其余视为完成。
 *
 * 注意：习题若不满足作答条件（无题库/非习题结构），驱动应把 `solve-exercise` 当作“跳过”，
 * 否则 `done` 永远不会到达。该“是否已处理过习题”的状态由驱动维护，不属于纯核心。
 */
export function decideDeckStep(state: DeckState): DeckAction {
	if (state.hasVideo) return 'watch-video';
	if (state.unreadCount > 0) return 'read-slides';
	if (state.hasExerciseFrame) return 'solve-exercise';
	if (state.hasPptOpenButton && !state.hasDeckContent) return 'open-deck';
	return 'done';
}

/** 生成可用于“是否推进”比较的状态签名（忽略元素引用，只比对数量与类型） */
export function deckStateSignature(state: DeckState): string {
	return [
		state.hasVideo ? 'v' : '-',
		state.hasExerciseFrame ? 'e' : '-',
		state.hasPptOpenButton ? 'b' : '-',
		state.hasDeckContent ? 'c' : '-',
		`u:${state.unreadCount}`,
		`p:${state.totalPages ?? '?'}`,
		`x:${state.exerciseTotal ?? '?'}`
	].join('|');
}

/** 生成便于日志/调试的可读状态描述 */
export function describeDeckState(state: DeckState): string {
	return [
		`未读=${state.unreadCount}`,
		`总页数=${state.totalPages ?? '未知'}`,
		`习题=${state.exerciseTotal ?? '未知'}`,
		`视频=${state.hasVideo ? '有' : '无'}`,
		`习题框=${state.hasExerciseFrame ? '有' : '无'}`,
		`课件内容=${state.hasDeckContent ? '已呈现' : '未呈现'}`
	].join('，');
}

/* ============================================================================
 * 真实 studentCards 课件（长江雨课堂 /v2/web/studentCards/**\/ppt）的逐页模型
 *
 * 说明（2026-11 实测该页面）：
 * - 左侧缩略图：`.pptThumbsSwiper .container`，每页含 `.page` 页码与 `.flag.noRead`（未读）。
 * - 主播放区：`.pptSwiper .swiper-slide`，每个 slide 即一“课件页”；DOM 中同时渲染全部页，
 *   因此判断“某页是视频/习题”必须【只看该 slide 自身】，不能看全文档。
 * - 视频页：slide 内含 `.video-box`（默认显示“未观看”，点击后加载播放器）。
 * - 习题页：slide 内含 `.slide_layer.MultipleChoice`，选项为 `div.problembullet[data-label=A/B/C/D]`
 *   （图片型选项），提交按钮为 `div.quizImg.submitButton`。
 * - 平台规则：图文页停留 ≥1s；视频页需观看 ≥90%；习题页需完成作答；混合页以习题为准。
 * ========================================================================== */

export interface StudentCardsSelectors {
	/** 左侧缩略图项 */
	thumbnails: string;
	/** 未读标记 */
	unreadFlag: string;
	/** 主播放区每一页 */
	slides: string;
	/** 当前激活页 */
	activeSlideClass: string;
	/** 视频框 */
	videoBox: string;
	/** 习题层 */
	exerciseLayer: string;
	/** 提交按钮 */
	submitButton: string;
	/** 选项（图片选项） */
	optionItem: string;
}

export const DEFAULT_STUDENTCARDS_SELECTORS: StudentCardsSelectors = {
	thumbnails: '.pptThumbsSwiper .container',
	unreadFlag: '.flag.noRead',
	slides: '.pptSwiper .swiper-slide',
	activeSlideClass: 'swiper-slide-active',
	videoBox: '.video-box',
	exerciseLayer: '.slide_layer.MultipleChoice',
	submitButton: '.quizImg.submitButton',
	optionItem: '.problembullet[data-label]'
};

/** 单页类型：图文 / 视频 / 习题 / 混合 */
export type StudentCardsPageKind = 'graphic' | 'video' | 'exercise' | 'mixed';

export interface StudentCardsPage {
	/** 页码（1 起） */
	index: number;
	kind: StudentCardsPageKind;
	hasVideo: boolean;
	hasExercise: boolean;
	/** 该页左侧缩略图是否标记未读 */
	unread: boolean;
}

export interface StudentCardsDeck {
	slideCount: number;
	unreadCount: number;
	/** 当前激活页索引（0 起；未知 -1） */
	activeIndex: number;
	pages: StudentCardsPage[];
}

/** 分析真实 studentCards 课件的逐页类型与未读状态（纯读取，无副作用） */
export function analyzeStudentCardsDeck(
	root: DeckRoot,
	selectors: StudentCardsSelectors = DEFAULT_STUDENTCARDS_SELECTORS
): StudentCardsDeck {
	const slides = allOf(root, [selectors.slides]);
	const thumbnails = allOf(root, [selectors.thumbnails]);
	const unreadCount = allOf(root, [selectors.unreadFlag]).length;

	let activeIndex = -1;
	for (let i = 0; i < slides.length; i++) {
		const cls = slides[i].className ?? '';
		const hasActive = slides[i].classList
			? slides[i].classList!.contains(selectors.activeSlideClass)
			: cls.split(/\s+/).includes(selectors.activeSlideClass);
		if (hasActive) {
			activeIndex = i;
			break;
		}
	}

	const pages: StudentCardsPage[] = slides.map((slide, i) => {
		const hasVideo = !!safeQuery(slide, selectors.videoBox);
		const hasExercise = !!safeQuery(slide, selectors.exerciseLayer);
		const kind: StudentCardsPageKind =
			hasVideo && hasExercise ? 'mixed' : hasVideo ? 'video' : hasExercise ? 'exercise' : 'graphic';
		const thumb = thumbnails[i];
		const unread = thumb ? !!safeQuery(thumb, selectors.unreadFlag) : false;
		return { index: i + 1, kind, hasVideo, hasExercise, unread };
	});

	return { slideCount: slides.length, unreadCount, activeIndex, pages };
}

/** 把逐页模型汇总成一行可读描述（便于日志） */
export function describeStudentCardsDeck(deck: StudentCardsDeck): string {
	const count = { graphic: 0, video: 0, exercise: 0, mixed: 0 };
	for (const p of deck.pages) count[p.kind]++;
	return [
		`共${deck.slideCount}页`,
		`未读${deck.unreadCount}`,
		`图文${count.graphic}`,
		`视频${count.video}`,
		`习题${count.exercise}`,
		`混合${count.mixed}`,
		`当前第${deck.activeIndex >= 0 ? deck.activeIndex + 1 : '?'}页`
	].join('，');
}
