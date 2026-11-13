/**
 * 纯逻辑核心的可执行自测（Mock DOM，不依赖浏览器/框架）。
 *
 * 运行：
 *   pnpm test                                        # 与 tests/resolver.test.ts 一起跑
 *   npx tsx tools/verify-yuketang-courseware-core.ts  # 单独跑
 *
 * 目的：在没有登录态、没有浏览器的情况下，验证「未读目标收集」与「课件逐页分类」的正确性。
 * 这两个函数是 yuketang.ts 中真实调用的：前者用于 AI 学伴图文任务点，
 * 后者在 Vue 实例字段缺失时用于兜底判定页类型与完成状态。
 */
import {
	collectUnreadTargets,
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

function scenarioUnreadFlags() {
	console.log('\n[1] 新版页面：span.flag.noRead 收集全部未读页');
	const f1 = new MockEl({ classes: ['flag', 'noRead'] });
	const f2 = new MockEl({ classes: ['flag', 'noRead'] });
	const root = new MockRoot({
		'span.flag.noRead': [f1, f2],
		'.flag.noRead': [f1, f2],
		'.noRead': [f1, f2]
	});
	const targets = collectUnreadTargets(root);
	check('目标数量=2', targets.length === 2, targets.length);
	check('顺序与 DOM 一致', targets[0] === f1 && targets[1] === f2, targets.length);
}

function scenarioLegacyContainer() {
	console.log('\n[2] 老版本：容器内含 .noRead（点击容器）');
	const inner = new MockEl({ classes: ['noRead'] });
	const container = new MockEl({ q: { '.noRead': [inner], '.flag.noRead': [inner] } });
	const root = new MockRoot({ '.swiper-container .container': [container] });
	const targets = collectUnreadTargets(root, DEFAULT_DECK_SELECTORS);
	check('目标数量=1', targets.length === 1, targets.length);
	check('目标是容器本身', targets[0] === container, targets[0] === container);
}

function scenarioDedup() {
	console.log('\n[3] 去重：同一元素被多个选择器命中');
	const f1 = new MockEl({ classes: ['flag', 'noRead'] });
	const root = new MockRoot({ 'span.flag.noRead': [f1], '.noRead': [f1], '.flag.noRead': [f1] });
	check('目标数量=1', collectUnreadTargets(root).length === 1, collectUnreadTargets(root).length);
}

function scenarioEmpty() {
	console.log('\n[4] 空页面：没有未读标记');
	const targets = collectUnreadTargets(new MockRoot({}));
	check('目标数量=0', targets.length === 0, targets.length);
}

function scenarioStudentCardsDeck() {
	console.log('\n[5] 真实 studentCards 逐页分类（图文/视频/习题/混合）');
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
	scenarioUnreadFlags();
	scenarioLegacyContainer();
	scenarioDedup();
	scenarioEmpty();
	scenarioStudentCardsDeck();

	console.log(`\n==== ${failures === 0 ? '全部通过' : failures + ' 项失败'} ====`);
	process.exit(failures === 0 ? 0 : 1);
}

main();
