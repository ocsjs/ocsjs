/**
 * 纯逻辑核心的可执行自测（Mock DOM，不依赖浏览器/框架）。
 *
 * 运行（Node 22，自带类型擦除）：
 *   node --experimental-strip-types tools/verify-yuketang-courseware-core.ts
 *
 * 目的：在没有登录态、没有浏览器的情况下，验证「读状态 → 决策」的流程逻辑正确：
 * 能识别 图文页 / 视频页 / 习题页 / 混合课件，并按预期给出下一步动作。
 */
import {
	readDeckState,
	decideDeckStep,
	collectUnreadTargets,
	deckStateSignature,
	analyzeStudentCardsDeck,
	describeStudentCardsDeck,
	DEFAULT_DECK_SELECTORS
} from '../packages/scripts/src/projects/yuketang-courseware-core.ts';
import type { DeckElement } from '../packages/scripts/src/projects/yuketang-courseware-core.ts';

/** 最小 Mock 元素：按“选择器 -> 元素数组”注册表响应查询，模拟 classList.contains */
class MockEl implements DeckElement {
	textContent: string | null;
	className = '';
	clicked = 0;
	onClick?: () => void;
	private tokens: Set<string>;
	private q: Record<string, MockEl[]>;

	constructor(opts: { text?: string; classes?: string[]; q?: Record<string, MockEl[]>; onClick?: () => void } = {}) {
		this.textContent = opts.text ?? '';
		this.tokens = new Set(opts.classes ?? []);
		this.q = opts.q ?? {};
		this.className = (opts.classes ?? []).join(' ');
		this.onClick = opts.onClick;
	}

	get classList() {
		const self = this;
		return { contains: (token: string) => self.tokens.has(token) };
	}
	querySelector(selector: string): DeckElement | null {
		return (this.q[selector] ?? [])[0] ?? null;
	}
	querySelectorAll(selector: string): ArrayLike<DeckElement> {
		return this.q[selector] ?? [];
	}
	click() {
		this.clicked++;
		this.onClick?.();
	}
}

class MockRoot {
	private q: Record<string, MockEl[]>;
	constructor(q: Record<string, MockEl[]>) {
		this.q = q;
	}
	querySelector(selector: string): DeckElement | null {
		return (this.q[selector] ?? [])[0] ?? null;
	}
	querySelectorAll(selector: string): ArrayLike<DeckElement> {
		return this.q[selector] ?? [];
	}
}

let failures = 0;
function check(name: string, cond: boolean, detail?: unknown) {
	if (cond) {
		console.log(`  ✓ ${name}`);
	} else {
		failures++;
		console.log(`  ✗ ${name}`, detail ?? '');
	}
}

function scenarioGraphicUnread() {
	console.log('\n[1] 图文页：存在未读幻灯片');
	const f1 = new MockEl({ classes: ['flag', 'noRead'] });
	const f2 = new MockEl({ classes: ['flag', 'noRead'] });
	const page = new MockEl({ text: '(3页)' });
	const root = new MockRoot({
		'span.flag.noRead': [f1, f2],
		'.flag.noRead': [f1, f2],
		'.noRead': [f1, f2],
		'.ppt_page': [page]
	});
	const state = readDeckState(root);
	check('未读数量=2', state.unreadCount === 2, state.unreadCount);
	check('总页数=3', state.totalPages === 3, state.totalPages);
	check('决策=read-slides', decideDeckStep(state) === 'read-slides', decideDeckStep(state));
	check('去重后目标=2', collectUnreadTargets(root).length === 2);
}

function scenarioGraphicDone() {
	console.log('\n[2] 图文页：已读完毕');
	const root = new MockRoot({ '.ppt_page': [new MockEl({ text: '(3页)' })] });
	const state = readDeckState(root);
	check('未读数量=0', state.unreadCount === 0, state.unreadCount);
	check('决策=done', decideDeckStep(state) === 'done', decideDeckStep(state));
}

function scenarioPptClosed() {
	console.log('\n[3] 课件未打开：需要点开查看器');
	const root = new MockRoot({ '.ppt_img_box': [new MockEl()] });
	const state = readDeckState(root);
	check('存在打开按钮', state.hasPptOpenButton === true);
	check('尚无课件内容', state.hasDeckContent === false);
	check('决策=open-deck', decideDeckStep(state) === 'open-deck', decideDeckStep(state));
}

function scenarioVideo() {
	console.log('\n[4] 视频页：存在 video');
	const root = new MockRoot({ video: [new MockEl()] });
	const state = readDeckState(root);
	check('检测到视频', state.hasVideo === true);
	check('决策=watch-video', decideDeckStep(state) === 'watch-video', decideDeckStep(state));
}

function scenarioExercise() {
	console.log('\n[5] 习题页：课件内习题 iframe');
	const root = new MockRoot({
		'.exercises_total': [new MockEl({ text: '共2题' })],
		'iframe#iframeExerciseId': [new MockEl()]
	});
	const state = readDeckState(root);
	check('习题总数=2', state.exerciseTotal === 2, state.exerciseTotal);
	check('检测到习题框', state.hasExerciseFrame === true);
	check('决策=solve-exercise', decideDeckStep(state) === 'solve-exercise', decideDeckStep(state));
}

function scenarioMixedPriority() {
	console.log('\n[6] 混合课件：视频 + 未读幻灯片，视频优先');
	const root = new MockRoot({
		video: [new MockEl()],
		'span.flag.noRead': [new MockEl({ classes: ['flag', 'noRead'] })]
	});
	const state = readDeckState(root);
	check('决策=watch-video（视频优先）', decideDeckStep(state) === 'watch-video', decideDeckStep(state));
}

function scenarioLegacyContainer() {
	console.log('\n[7] 老版本：容器内含 .noRead（点击容器）');
	const inner = new MockEl({ classes: ['noRead'] });
	const container = new MockEl({ q: { '.noRead': [inner], '.flag.noRead': [inner] } });
	const root = new MockRoot({ '.swiper-container .container': [container] });
	const targets = collectUnreadTargets(root, DEFAULT_DECK_SELECTORS);
	check('目标数量=1', targets.length === 1, targets.length);
	check('目标是容器本身', targets[0] === container, targets[0] === container);
}

function scenarioDedup() {
	console.log('\n[8] 去重：同一元素被多个选择器命中');
	const f1 = new MockEl({ classes: ['flag', 'noRead'] });
	const root = new MockRoot({ 'span.flag.noRead': [f1], '.noRead': [f1], '.flag.noRead': [f1] });
	check('未读数量=1', readDeckState(root).unreadCount === 1, readDeckState(root).unreadCount);
}

function scenarioSignature() {
	console.log('\n[9] 状态签名：不同状态签名不同');
	const a = readDeckState(new MockRoot({ '.ppt_page': [new MockEl({ text: '(3页)' })] }));
	const b = readDeckState(new MockRoot({ video: [new MockEl()] }));
	check('签名不同', deckStateSignature(a) !== deckStateSignature(b));
	check('空状态签名含 u:0', deckStateSignature(a).includes('u:0'));
}

/**
 * 模拟驱动主循环（与 yuketang.ts 中 runStudentCardsCourseware 的动作语义一致），
 * 用可变 Mock 验证：混合课件（视频 + 2 张未读幻灯片 + 1 道习题）能按序推进并终止。
 */
function scenarioMixedFlow() {
	console.log('\n[10] 混合课件端到端流程模拟');
	const registry: Record<string, MockEl[]> = {};

	const removeFrom = (key: string, el: MockEl) => {
		registry[key] = (registry[key] ?? []).filter((x) => x !== el);
	};

	const video = new MockEl({ onClick: () => (registry['video'] = []) });
	const slide1 = new MockEl({ classes: ['flag', 'noRead'] });
	const slide2 = new MockEl({ classes: ['flag', 'noRead'] });
	const exercise = new MockEl({ onClick: () => (registry['iframe#iframeExerciseId'] = []) });

	slide1.onClick = () => {
		removeFrom('span.flag.noRead', slide1);
		removeFrom('.noRead', slide1);
	};
	slide2.onClick = () => {
		removeFrom('span.flag.noRead', slide2);
		removeFrom('.noRead', slide2);
		// 读完最后一页后，课件才暴露习题
		registry['iframe#iframeExerciseId'] = [exercise];
	};

	registry['video'] = [video];
	registry['span.flag.noRead'] = [slide1, slide2];
	registry['.noRead'] = [slide1, slide2];
	const root = new MockRoot(registry);

	const actions: string[] = [];
	for (let i = 0; i < 30; i++) {
		const state = readDeckState(root);
		const action = decideDeckStep(state);
		actions.push(action);
		if (action === 'done') break;
		if (action === 'watch-video') {
			(root.querySelector('video') as MockEl | null)?.click();
		} else if (action === 'read-slides') {
			for (const t of state.unreadTargets) (t as MockEl).click();
		} else if (action === 'solve-exercise') {
			(root.querySelector('iframe#iframeExerciseId') as MockEl | null)?.click();
		}
	}

	check(
		'动作序列=视频→翻页→习题→完成',
		actions.join('>') === 'watch-video>read-slides>solve-exercise>done',
		actions.join('>')
	);
	check('两个幻灯片都被点击', slide1.clicked === 1 && slide2.clicked === 1, `${slide1.clicked},${slide2.clicked}`);
	check('视频被播放', video.clicked === 1, video.clicked);
	check('习题被作答', exercise.clicked === 1, exercise.clicked);
}

function scenarioStudentCardsDeck() {
	console.log('\n[11] 真实 studentCards 逐页分类（图文/视频/习题/混合）');
	const vb = new MockEl();
	const layer = new MockEl();
	const s1 = new MockEl({ classes: ['swiper-slide', 'swiper-slide-active'] });
	const s2 = new MockEl({ classes: ['swiper-slide'], q: { '.video-box': [vb] } });
	const s3 = new MockEl({ classes: ['swiper-slide'], q: { '.slide_layer.MultipleChoice': [layer] } });
	const s4 = new MockEl({
		classes: ['swiper-slide'],
		q: { '.video-box': [vb], '.slide_layer.MultipleChoice': [layer] }
	});

	const flag = () => new MockEl({ classes: ['flag', 'noRead'] });
	const f2 = flag();
	const f3 = flag();
	const f4 = flag();
	const t1 = new MockEl({ q: {} });
	const t2 = new MockEl({ q: { '.flag.noRead': [f2] } });
	const t3 = new MockEl({ q: { '.flag.noRead': [f3] } });
	const t4 = new MockEl({ q: { '.flag.noRead': [f4] } });

	const root = new MockRoot({
		'.pptSwiper .swiper-slide': [s1, s2, s3, s4],
		'.pptThumbsSwiper .container': [t1, t2, t3, t4],
		'.flag.noRead': [f2, f3, f4]
	});

	const deck = analyzeStudentCardsDeck(root);
	check('页数=4', deck.slideCount === 4, deck.slideCount);
	check('未读=3', deck.unreadCount === 3, deck.unreadCount);
	check('当前页=1', deck.activeIndex === 0, deck.activeIndex);
	check(
		'类型=graphic,video,exercise,mixed',
		deck.pages.map((p) => p.kind).join(',') === 'graphic,video,exercise,mixed',
		deck.pages.map((p) => p.kind).join(',')
	);
	check(
		'未读映射=false,true,true,true',
		deck.pages.map((p) => p.unread).join(',') === 'false,true,true,true',
		deck.pages.map((p) => p.unread).join(',')
	);
	console.log('  摘要：' + describeStudentCardsDeck(deck));
}

function main() {
	scenarioGraphicUnread();
	scenarioGraphicDone();
	scenarioPptClosed();
	scenarioVideo();
	scenarioExercise();
	scenarioMixedPriority();
	scenarioLegacyContainer();
	scenarioDedup();
	scenarioSignature();
	scenarioMixedFlow();
	scenarioStudentCardsDeck();

	console.log(`\n==== ${failures === 0 ? '全部通过' : failures + ' 项失败'} ====`);
	process.exit(failures === 0 ? 0 : 1);
}

main();
