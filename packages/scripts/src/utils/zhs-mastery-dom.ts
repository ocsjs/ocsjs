import type { RawElements, WorkResult } from '@ocsjs/core';

export type Guard = () => void;
export interface PointLocator {
	chapter: string;
	title: string;
	key: string;
}
export interface ListSnapshot {
	points: PointLocator[];
	grayKeys: Set<string>;
}
export interface ExamIdentity {
	course: string;
	knowledgeId: string;
	idStr: string;
}

export class MasteryIdentityError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'MasteryIdentityError';
	}
}

const origin = 'https://studywisdomh5.zhihuishu.com';
const noAnswerError = '搜索不到答案, 请重新运行, 或者忽略此题。';
const text = (element: Element | null): string => element?.textContent?.trim() || '';
const all = <T extends Element = HTMLElement>(
	selector: string,
	root: Document | Element | DocumentFragment = document
): T[] => Array.from(root.querySelectorAll<T>(selector));

function visible(element: Element): boolean {
	if (!element.isConnected || !element.getClientRects().length) return false;
	for (let node: Element | null = element; node; node = node.parentElement) {
		const style = getComputedStyle(node);
		if (
			style.display === 'none' ||
			style.visibility === 'hidden' ||
			style.visibility === 'collapse' ||
			style.opacity === '0' ||
			node.getAttribute('aria-hidden') === 'true' ||
			node.hasAttribute('hidden')
		)
			return false;
	}
	return true;
}

function enabled(element: HTMLElement): boolean {
	return (
		visible(element) &&
		!element.matches(':disabled,.disabled,.is-disabled,[aria-disabled="true"]') &&
		!element.closest('.disabled,.is-disabled,[aria-disabled="true"]')
	);
}

function unique<T>(items: T[], description: string): T {
	if (items.length !== 1) throw new MasteryIdentityError(`${description}不唯一或缺失（${items.length}）`);
	return items[0];
}

function parameter(url: URL, name: string): string {
	const values = url.searchParams.getAll(name);
	return values.length === 1 && values[0].trim() ? values[0] : '';
}

function target(url: URL, course: string): boolean {
	return !!course.trim() && url.origin === origin && parameter(url, 'recruitAndCourseId') === course;
}

export function isList(course: string): boolean {
	const url = new URL(location.href);
	return target(url, course) && url.pathname === '/study/mastery';
}

export function isExam(identity: ExamIdentity): boolean {
	const url = new URL(location.href);
	return (
		target(url, identity.course) &&
		url.pathname === '/exam' &&
		!!identity.knowledgeId.trim() &&
		!!identity.idStr.trim() &&
		parameter(url, 'knowledgeId') === identity.knowledgeId &&
		parameter(url, 'idStr') === identity.idStr
	);
}

export function isResult(identity: ExamIdentity): boolean {
	const url = new URL(location.href);
	if (!target(url, identity.course) || !identity.knowledgeId.trim() || !identity.idStr.trim()) return false;
	const parts = url.pathname.split('/');
	if (parts.length !== 7 || parts[0] !== '' || parts[1] !== 'pointOfMastery') return false;
	try {
		const segments = parts.slice(2).map(decodeURIComponent);
		return (
			segments.every((part) => !!part.trim() && !part.includes('/')) &&
			segments[2] === identity.knowledgeId &&
			segments[3] === identity.idStr
		);
	} catch {
		return false;
	}
}

export function readExamIdentity(course: string, point: PointLocator): ExamIdentity {
	const url = new URL(location.href);
	const identity = { course, knowledgeId: parameter(url, 'knowledgeId'), idStr: parameter(url, 'idStr') };
	if (
		!isExam(identity) ||
		parameter(url, 'name').trim() !== point.title ||
		point.key !== JSON.stringify([point.chapter, point.title])
	) {
		throw new MasteryIdentityError('答题页课程、知识点标识或展示名称不匹配');
	}
	return identity;
}

async function pause(milliseconds: number, guard: Guard): Promise<void> {
	guard();
	// ES2020 / TypeScript 4.5 does not expose Promise.withResolvers.
	await new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
	guard();
}

export async function waitFor<T>(read: () => T | undefined, guard: Guard, timeout = 20000): Promise<T> {
	if (!Number.isFinite(timeout) || timeout <= 0) throw new Error('等待期限必须为有限正数');
	guard();
	const deadline = Date.now() + timeout;
	while (true) {
		guard();
		const value = read();
		guard();
		if (value !== undefined) return value;
		const remaining = deadline - Date.now();
		if (remaining <= 0) throw new Error('等待页面状态超时');
		await pause(Math.min(100, remaining), guard);
		guard();
	}
}

function listEntries(): { point: PointLocator; card: HTMLElement }[] {
	const chapters = all('.right-box .mastery-content');
	if (!chapters.length) throw new MasteryIdentityError('完整章节列表尚未加载');
	const chapterNames = new Set<string>();
	const keys = new Set<string>();
	const entries: { point: PointLocator; card: HTMLElement }[] = [];
	for (const section of chapters) {
		const chapter = text(unique(all(':scope > h1.mastery-name', section), '章节标题'));
		if (!chapter || chapterNames.has(chapter)) throw new MasteryIdentityError('章节名称为空或重复');
		chapterNames.add(chapter);
		for (const card of all<HTMLElement>('.chunk-list li.item-box', section)) {
			const title = text(unique(all('.item-box-name', card), '知识点标题'));
			const key = JSON.stringify([chapter, title]);
			if (!title || keys.has(key)) throw new MasteryIdentityError('章节与知识点标题为空或重复');
			keys.add(key);
			entries.push({ point: { chapter, title, key }, card });
		}
	}
	if (!entries.length) throw new MasteryIdentityError('知识点列表为空');
	return entries;
}

export function collectList(): ListSnapshot {
	const entries = listEntries();
	// Read the smallest visible label container, not a whole page containing unrelated numbers.
	const totals = new Set<number>();
	for (const label of all('body *')) {
		if (!visible(label) || text(label) !== '知识点总数') continue;
		const value = text(label.parentElement);
		const match = value.match(/^(\d+)\s*知识点总数$/) || value.match(/^知识点总数\s*[:：]?\s*(\d+)$/);
		if (match) totals.add(Number(match[1]));
	}
	if (totals.size !== 1 || !totals.has(entries.length)) {
		throw new MasteryIdentityError('知识点总数与完整章节列表不一致，可能尚未加载完整');
	}
	return {
		points: entries.map((entry) => entry.point),
		grayKeys: new Set(entries.filter(({ card }) => card.classList.contains('gray')).map(({ point }) => point.key))
	};
}

function locate(point: PointLocator): HTMLElement {
	if (point.key !== JSON.stringify([point.chapter, point.title])) throw new MasteryIdentityError('知识点定位键不一致');
	return unique(
		listEntries().filter((entry) => entry.point.key === point.key),
		'当前知识点'
	).card;
}

let hovered: HTMLElement | undefined;
async function hover(element: HTMLElement, entering: boolean, guard: Guard, validate: () => void): Promise<void> {
	for (const type of entering
		? ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'mousemove']
		: ['pointerout', 'pointerleave', 'mouseout', 'mouseleave']) {
		guard();
		validate();
		if (!element.isConnected) return;
		// ScriptCat's sandbox Window proxy is not a valid UIEventInit.view; these hover events do not need it.
		const options = { bubbles: !type.endsWith('enter') && !type.endsWith('leave') };
		guard();
		element.dispatchEvent(type.startsWith('pointer') ? new PointerEvent(type, options) : new MouseEvent(type, options));
	}
}

function currentPopover(point: PointLocator): HTMLElement | undefined {
	const popovers = all<HTMLElement>('.mastery-box-custom-popover[aria-hidden="false"]').filter((popover) => {
		if (!visible(popover)) return false;
		const names = all('.custom-content strong.name', popover);
		return names.length === 1 && text(names[0]) === point.title;
	});
	if (popovers.length > 1) throw new MasteryIdentityError('当前知识点存在多个同名可见悬浮层');
	if (!popovers.length) return undefined;
	const popover = popovers[0];
	return popover;
}

function omission(popover: HTMLElement): boolean {
	if (text(popover).includes('免考')) return false;
	const percentage = text(unique(all('.custom-content > .text > span', popover), '掌握度百分比'));
	const match = percentage.match(/^(?:掌握度\s*[:：]?\s*)?(\d+(?:\.\d+)?)\s*%$/);
	if (!match || Number(match[1]) > 100) throw new Error('无法确认当前知识点掌握度');
	return Number(match[1]) === 0;
}

export async function inspectPoint(point: PointLocator, guard: Guard): Promise<boolean> {
	guard();
	const card = locate(point);
	if (!card.classList.contains('gray') || text(card).includes('免考')) return false;
	const name = unique(all<HTMLElement>('.item-box-name', card), '知识点悬浮目标');
	guard();
	name.scrollIntoView({ block: 'center', inline: 'nearest' });
	guard();
	const validate = (): void => {
		if (locate(point) !== card || !card.contains(name)) throw new MasteryIdentityError('悬浮期间知识点卡片已重建');
	};
	if (hovered) {
		await hover(hovered, false, guard, validate);
		guard();
	}
	await hover(name, false, guard, validate);
	guard();
	// A same-title cached tooltip from another chapter must disappear before this hover can bind it.
	await waitFor(() => (currentPopover(point) ? undefined : true), guard, 5000);
	guard();
	validate();
	if (!visible(name)) throw new Error('知识点悬浮目标不可见');
	hovered = name;
	await hover(name, true, guard, validate);
	guard();
	await pause(150, guard);
	guard();
	const popover = await waitFor(() => currentPopover(point), guard);
	guard();
	if (locate(point) !== card || currentPopover(point) !== popover) {
		throw new MasteryIdentityError('悬浮期间知识点卡片或悬浮层已重建');
	}
	return card.classList.contains('gray') && omission(popover);
}

export async function enterPoint(point: PointLocator, guard: Guard, beforeEnter?: () => Promise<void>): Promise<void> {
	if (!(await inspectPoint(point, guard))) throw new Error('当前知识点已非遗漏状态');
	await beforeEnter?.();
	guard();
	const course = parameter(new URL(location.href), 'recruitAndCourseId');
	if (!isList(course)) throw new MasteryIdentityError('进入知识点前列表课程不匹配');
	const popover = currentPopover(point);
	if (!popover || !omission(popover) || !locate(point).classList.contains('gray')) throw new Error('悬浮状态已经变化');
	const button = unique(
		all<HTMLElement>('.custom-content > .text > button.btn', popover).filter(
			(item) => text(item) === '提升掌握度' && enabled(item)
		),
		'提升掌握度按钮'
	);
	guard();
	button.click();
	await waitFor(() => {
		const url = new URL(location.href);
		if (!target(url, course)) throw new MasteryIdentityError('进入时课程或域名改变');
		if (url.pathname === '/exam') {
			readExamIdentity(course, point);
			return true;
		}
		if (url.pathname !== '/study/mastery') throw new MasteryIdentityError('进入了未知知识点路径');
		return undefined;
	}, guard);
	guard();
	let previousCount = 0;
	let stableSince = 0;
	await waitFor(() => {
		readExamIdentity(course, point);
		const roots = all<HTMLElement>('.exam-item');
		const cards = all('.answer-card .list .item');
		const ready =
			roots.length > 0 &&
			roots.every((root) => {
				const titles = all('.quest-title', root);
				return titles.length === 1 && (!!text(titles[0]) || !!titles[0].querySelector('img'));
			}) &&
			!!currentQuestion() &&
			(!cards.length || cards.length === roots.length);
		if (!ready || roots.length !== previousCount) {
			previousCount = roots.length;
			stableSince = Date.now();
			return undefined;
		}
		return Date.now() - stableSince >= 300 ? true : undefined;
	}, guard);
	guard();
}

function questionTitle(root: HTMLElement): string {
	const title = unique(all<HTMLElement>('.quest-title', root), '题目标题');
	const clone = title.cloneNode(true) as HTMLElement;
	clone.querySelector('.option-index')?.remove();
	const content = text(clone).replace(/\s+/g, ' ');
	const media = all<HTMLImageElement>('img', clone).map((image) => image.getAttribute('src') || '');
	if (!content && !media.length) throw new MasteryIdentityError('题干为空');
	return JSON.stringify([content, media]);
}

function currentQuestion(): HTMLElement | undefined {
	const roots = all<HTMLElement>('.exam-item').filter(visible);
	if (roots.length > 1) throw new MasteryIdentityError('多个题目同时可见');
	return roots[0];
}

function assertQuestion(root: HTMLElement, title: string): void {
	if (!root.isConnected || currentQuestion() !== root || questionTitle(root) !== title) {
		throw new MasteryIdentityError('当前可见题目与工作器题目身份不一致');
	}
}

async function selectQuestion(root: HTMLElement, title: string, guard: Guard): Promise<void> {
	guard();
	const roots = all<HTMLElement>('.exam-item');
	const index = roots.indexOf(root);
	if (index < 0 || questionTitle(root) !== title) throw new MasteryIdentityError('原题目已丢失或改变');
	if (currentQuestion() === root) return;
	const cards = all<HTMLElement>('.answer-card .list .item');
	if (cards.length === roots.length && cards.every((card, i) => text(card) === String(i + 1))) {
		const card = cards[index];
		if (!enabled(card)) throw new Error('答题卡目标不可用');
		guard();
		card.click();
		await waitFor(() => (currentQuestion() === root ? true : undefined), guard, 5000);
		guard();
	} else {
		// The ordinal chooses a direction only; the actual root and title are asserted after each transition.
		for (let steps = 0; steps < roots.length; steps++) {
			guard();
			const actualRoots = all<HTMLElement>('.exam-item');
			if (
				questionTitle(root) !== title ||
				actualRoots.length !== roots.length ||
				actualRoots.some((item, i) => item !== roots[i])
			) {
				throw new MasteryIdentityError('切题期间题目集合发生变化');
			}
			const current = currentQuestion();
			if (current === root) break;
			const currentIndex = current ? roots.indexOf(current) : -1;
			if (currentIndex < 0) throw new MasteryIdentityError('无法识别当前题目');
			const direction = currentIndex < index ? 1 : -1;
			const button = unique(all<HTMLElement>(direction === 1 ? '.next-btn' : '.up-btn').filter(enabled), '切题按钮');
			guard();
			button.click();
			const next = await waitFor(
				() => {
					const candidate = currentQuestion();
					return candidate && candidate !== current ? candidate : undefined;
				},
				guard,
				5000
			);
			guard();
			if (next !== roots[currentIndex + direction]) throw new MasteryIdentityError('切题顺序与实际题目不一致');
		}
	}
	guard();
	assertQuestion(root, title);
}

interface Choice {
	label: HTMLLabelElement;
	input: HTMLInputElement;
	value: string;
}

function choices(root: HTMLElement, type: string, requireVisible: boolean): Choice[] {
	const labels = all<HTMLLabelElement>('label', root);
	const expected = type === 'multiple' ? 'checkbox' : 'radio';
	const items = labels.map((label): Choice => {
		const input = unique(all<HTMLInputElement>('input', label), '选项原生输入框');
		if (
			input.type !== expected ||
			!input.value.trim() ||
			input.disabled ||
			label.matches('.is-disabled,[aria-disabled="true"]') ||
			(requireVisible && !enabled(label))
		)
			throw new Error('选项类型、值或可用状态不合法');
		return { label, input, value: input.value };
	});
	if (
		items.length < 2 ||
		new Set(items.map((item) => item.value)).size !== items.length ||
		all('input', root).length !== items.length
	)
		throw new Error('选项数量、唯一性或题型不合法');
	const typeText = text(unique(all('.quest-type', root), '题型'));
	const expectedText = type === 'single' ? '单选题' : type === 'multiple' ? '多选题' : '判断题';
	if (typeText !== expectedText || (type === 'judgement' && items.length !== 2))
		throw new Error('页面题型与工作器不一致');
	return items;
}

function countRange(root: HTMLElement, count: number): [number, number] {
	let min = 1;
	let max = count;
	const groups = all('[role="group"],.el-checkbox-group', root);
	for (const group of groups) {
		for (const [attribute, lower] of [
			['min', true],
			['data-min', true],
			['aria-valuemin', true],
			['max', false],
			['data-max', false],
			['aria-valuemax', false]
		] as const) {
			const raw = group.getAttribute(attribute);
			if (raw === null) continue;
			if (!/^\d+$/.test(raw)) throw new Error('无法识别多选数量限制');
			if (lower) min = Math.max(min, Number(raw));
			else max = Math.min(max, Number(raw));
		}
	}
	const instructions = all('.quest-type,[role="group"],.el-checkbox-group', root).filter(visible).map(text).join(' ');
	for (const match of instructions.matchAll(/(至少|最少|最多|至多|恰好|必须|请选择)\s*(\d+)\s*(?:个|项)/g)) {
		const countValue = Number(match[2]);
		if (match[1] === '至少' || match[1] === '最少') min = Math.max(min, countValue);
		else if (match[1] === '最多' || match[1] === '至多') max = Math.min(max, countValue);
		else {
			min = Math.max(min, countValue);
			max = Math.min(max, countValue);
		}
	}
	if (min > max || min > count || max < 1) throw new Error('多选数量限制没有合法非空组合');
	return [min, max];
}

async function clickChoice(
	choice: Choice,
	checked: boolean,
	root: HTMLElement,
	title: string,
	type: string,
	guard: Guard
): Promise<void> {
	guard();
	assertQuestion(root, title);
	const current = choices(root, type, true).find((item) => item.label === choice.label);
	if (!current || current.input !== choice.input || current.value !== choice.value) {
		throw new MasteryIdentityError('选项身份或可用状态改变');
	}
	if (
		!root.contains(choice.label) ||
		!choice.label.contains(choice.input) ||
		!enabled(choice.label) ||
		!choice.input.isConnected ||
		choice.input.disabled ||
		choice.input.value !== choice.value
	) {
		throw new MasteryIdentityError('选项身份或可用状态改变');
	}
	if (choice.input.checked !== checked) {
		guard();
		choice.label.click();
		await waitFor(
			() => {
				assertQuestion(root, title);
				if (choice.input.value !== choice.value) throw new MasteryIdentityError('选项值改变');
				return choice.input.checked === checked ? true : undefined;
			},
			guard,
			5000
		);
		guard();
	}
}

export async function applyLocalFallback(results: WorkResult<RawElements>[], guard: Guard): Promise<number> {
	guard();
	if (!results.length) throw new Error('原工作器没有题目结果');
	const seen = new Set<HTMLElement>();
	// Validate the entire set before changing any failed partial answer.
	const questions = results.map((result) => {
		const ctx = result.ctx;
		if (!result.requested || !result.resolved || !result.result || !ctx || !ctx.root.isConnected) {
			throw new Error('原工作器未正常完成全部题目');
		}
		if (result.error && !(result.result.finish === false && result.error === noAnswerError)) {
			throw new Error(`原工作器发生错误：${result.error}`);
		}
		if (result.result.finish !== true && result.result.finish !== false) throw new Error('未知匹配结果');
		if (ctx.type !== 'single' && ctx.type !== 'multiple' && ctx.type !== 'judgement')
			throw new Error('当前题型不支持本模块选择保存');
		if (seen.has(ctx.root)) throw new MasteryIdentityError('工作器结果题目重复');
		seen.add(ctx.root);
		choices(ctx.root, ctx.type, false);
		return { root: ctx.root, title: questionTitle(ctx.root), type: ctx.type, matched: result.result.finish };
	});
	const roots = all<HTMLElement>('.exam-item');
	if (roots.length !== seen.size || roots.some((root) => !seen.has(root)))
		throw new MasteryIdentityError('工作器与页面题目集合不一致');
	let fallbackCount = 0;
	for (const question of questions) {
		await selectQuestion(question.root, question.title, guard);
		guard();
		assertQuestion(question.root, question.title);
		const items = choices(question.root, question.type, true);
		const [min, max] = question.type === 'multiple' ? countRange(question.root, items.length) : [1, 1];
		let selected: Set<string>;
		if (question.matched) {
			selected = new Set(items.filter((item) => item.input.checked).map((item) => item.value));
		} else {
			if (question.type === 'multiple') {
				for (const item of items) {
					await clickChoice(item, false, question.root, question.title, question.type, guard);
					guard();
				}
			}
			const count = min + Math.floor(Math.random() * (max - min + 1));
			const pool = items.slice();
			for (let i = pool.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[pool[i], pool[j]] = [pool[j], pool[i]];
			}
			selected = new Set(pool.slice(0, count).map((item) => item.value));
			for (const item of items) {
				if (selected.has(item.value)) {
					await clickChoice(item, true, question.root, question.title, question.type, guard);
					guard();
				}
			}
			fallbackCount++;
		}
		if (selected.size < min || selected.size > max) throw new Error('实际选中数量不符合页面限制');
		// Native label clicks drive the page's reactive selection watcher; never assign checked or call its internals.
		await pause(100, guard);
		guard();
		assertQuestion(question.root, question.title);
		const actual = choices(question.root, question.type, true);
		if (
			actual.length !== items.length ||
			actual.some((item, index) => item.value !== items[index].value || item.input.checked !== selected.has(item.value))
		)
			throw new Error('页面未保存预期选中状态');
	}
	return fallbackCount;
}

function dialogs(): HTMLElement[] {
	return all<HTMLElement>('.custom-exam-dialog,[role="dialog"],.el-message-box')
		.filter(visible)
		.filter(
			(element, index, elements) =>
				!elements.some((other, otherIndex) => otherIndex !== index && other.contains(element))
		);
}

function platformError(): void {
	const errors = all('.el-message--error').filter(visible).map(text).filter(Boolean);
	if (errors.length) throw new Error(`平台反馈：${errors.join('；')}`);
}

function loadedResult(questionCount: number): boolean {
	const rows = all<HTMLElement>('.line1-count-total').filter(visible);
	const readNumber = (label: string): number | undefined => {
		const matches = rows.filter((row) => text(row.querySelector('.line1-count-total-title')) === label);
		if (!matches.length) return undefined;
		const row = unique(matches, `结果${label}`);
		const value = text(unique(all('.line1-count-total-num', row), `结果${label}数值`));
		if (!/^\d+$/.test(value)) return undefined;
		return Number(value);
	};
	const total = readNumber('总题数');
	const correct = readNumber('已答对');
	// Public result component initially renders both counters as zero before its data loads.
	if (total === undefined || total === 0 || correct === undefined) return false;
	if (total !== questionCount || correct < 0 || correct > total) throw new Error('结果统计与原题数不一致');
	return true;
}

export async function submitAndConfirm(identity: ExamIdentity, questionCount: number, guard: Guard): Promise<void> {
	guard();
	if (!Number.isInteger(questionCount) || questionCount <= 0) throw new Error('提交题数不合法');
	if (!isExam(identity)) throw new MasteryIdentityError('提交前知识点身份不匹配');
	platformError();
	if (dialogs().length) throw new Error('提交前存在未知对话框');
	const submit = unique(all<HTMLElement>('.submit').filter(enabled), '提交按钮');
	guard();
	submit.click();
	let confirmed = false;
	const deadline = Date.now() + 20000;
	while (true) {
		guard();
		const remaining = deadline - Date.now();
		if (remaining <= 0) throw new Error('等待页面状态超时');
		const next = await waitFor<true | HTMLElement>(
			() => {
				platformError();
				if (isResult(identity)) return loadedResult(questionCount) ? (true as const) : undefined;
				if (!isExam(identity)) throw new MasteryIdentityError('提交后路由身份不匹配');
				const open = dialogs();
				if (open.length) {
					const dialog = unique(open, '提交确认对话框');
					if (!dialog.matches('.custom-exam-dialog') || !dialog.querySelector('.nofinish-box')) {
						throw new Error(`提交受到未知提示阻断：${text(dialog)}`);
					}
					if (!confirmed) return dialog;
				}
				return undefined;
			},
			guard,
			remaining
		);
		guard();
		if (next === true) {
			if (!isResult(identity)) throw new MasteryIdentityError('提交结果路由身份不匹配');
			if (loadedResult(questionCount)) return;
			continue;
		}
		if (Date.now() >= deadline) throw new Error('等待页面状态超时');
		if (!isExam(identity)) throw new MasteryIdentityError('确认提交前知识点身份不匹配');
		platformError();
		const dialog = unique(dialogs(), '提交确认对话框');
		if (dialog !== next || !dialog.matches('.custom-exam-dialog') || !dialog.querySelector('.nofinish-box')) {
			throw new MasteryIdentityError('提交确认对话框已改变');
		}
		const button = unique(
			all<HTMLElement>('.btn', dialog).filter((item) => text(item) === '确认提交' && enabled(item)),
			'确认提交按钮'
		);
		confirmed = true;
		guard();
		button.click();
	}
}

async function waitForReturnedList(course: string, expectedCount: number | undefined, guard: Guard): Promise<void> {
	await waitFor(
		() => {
			if (!isList(course)) throw new MasteryIdentityError('等待列表时课程或路由发生变化');
			const chapters = all('.right-box .mastery-content');
			const count = all('.right-box .mastery-content .chunk-list li.item-box').length;
			if (!chapters.length || !count || (expectedCount !== undefined && count !== expectedCount)) return undefined;
			if (
				chapters.some(
					(chapter) => !chapter.querySelector(':scope > h1.mastery-name') || !chapter.querySelector('.chunk-list')
				)
			)
				return undefined;
			// Loading may temporarily remove all chapters; validate actual identities only after DOM readiness.
			collectList();
			return true;
		},
		guard,
		20000
	);
	guard();
}

export async function returnToMasteryList(
	identity: ExamIdentity | { course: string },
	guard: Guard,
	expectedCount?: number
): Promise<void> {
	const allowed = (): boolean =>
		isList(identity.course) || ('knowledgeId' in identity && (isExam(identity) || isResult(identity)));
	for (let step = 0; step < 2; step++) {
		guard();
		if (!allowed()) throw new MasteryIdentityError('不允许从未知或跨课程页面后退');
		if (dialogs().length) throw new Error('历史返回受到页面提示阻断');
		if (isList(identity.course)) {
			await waitForReturnedList(identity.course, expectedCount, guard);
			guard();
			return;
		}
		const previous = location.href;
		guard();
		history.back();
		await waitFor(
			() => {
				if (dialogs().length) throw new Error('历史返回受到页面提示阻断');
				if (!allowed()) throw new MasteryIdentityError('历史返回进入未知或跨课程页面');
				return location.href !== previous ? true : undefined;
			},
			guard,
			20000
		);
		guard();
		if (isList(identity.course)) {
			await waitForReturnedList(identity.course, expectedCount, guard);
			guard();
			return;
		}
	}
	throw new Error('最多两次历史后退后仍未返回同课程知识点列表');
}
