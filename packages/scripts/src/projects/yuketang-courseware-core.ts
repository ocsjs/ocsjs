/**
 * 雨课堂课件（studentCards）自动完成 —— 纯逻辑核心。
 *
 * 设计目标：
 * - 本文件【零依赖】：不 import 任何框架/工具库，只依赖 DOM 类型，因此既能在
 *   脚本运行时（浏览器）使用，也能用 Node 的类型擦除（--experimental-strip-types）
 *   直接跑单元验证（见 tools/verify-yuketang-courseware-core.ts）。
 * - 只做「读取 + 归类」，不产生副作用（不点击、不 sleep）。真正的点击/播放/答题
 *   由 yuketang.ts 中的驱动执行，便于把易变的 DOM 细节收敛在这里、把流程控制留在驱动里。
 * - 两个调用方：AI 学伴的图文任务点用 collectUnreadTargets；studentCards 课件驱动用
 *   analyzeStudentCardsDeck，在 Vue 实例字段缺失时兜底判定每页类型与未读状态。
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
 * 未读标记选择器集合。
 *
 * 默认值来自实测证据：
 * - studentCards 页面使用 `span.flag.noRead` 表示未读页。
 * - OCS 原有 ppt 脚本（packages/scripts/src/projects/yuketang.ts）使用
 *   `.swiper-container .container` 且内部含 `.noRead` 表示未读页。
 * 多套选择器按「从新到旧」排列，运行时全部收集，从而兼容不同版本的雨课堂前端。
 */
export interface DeckSelectors {
	/** 未读幻灯片标记（点击后变为已读） */
	slideFlags: string[];
	/** 兼容老版本：以“容器内含 .noRead”表示未读页 */
	slideContainers: string[];
}

export const DEFAULT_DECK_SELECTORS: DeckSelectors = {
	slideFlags: ['span.flag.noRead', '.flag.noRead', '.noRead'],
	slideContainers: ['.swiper-container .container']
};

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
