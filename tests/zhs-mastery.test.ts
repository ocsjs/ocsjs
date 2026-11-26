import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
	collectList,
	readExamIdentity,
	isResult,
	isExam,
	inspectPoint,
	applyLocalFallback,
	submitAndConfirm,
	returnToMasteryList,
	MasteryIdentityError,
	waitFor
} from '../packages/scripts/src/utils/zhs-mastery-dom';
import { masterySession } from '../packages/scripts/src/utils/zhs-mastery';
import type { RawElements, WorkOptions, WorkResult } from '../packages/core/src/core/worker/interface';
import type { OCSWorker } from '../packages/core/src/core/worker/worker';

const base = 'https://studywisdomh5.zhihuishu.com';
const identity = { course: 'course-test', knowledgeId: 'point-test', idStr: 'str-test' };
const examUrl = `${base}/exam?recruitAndCourseId=course-test&knowledgeId=point-test&idStr=str-test&name=目标知识点`;
const resultUrl = `${base}/pointOfMastery/101/202/point-test/str-test/exam-test?recruitAndCourseId=course-test`;
const listUrl = `${base}/study/mastery?recruitAndCourseId=course-test`;
const noAnswer = '搜索不到答案, 请重新运行, 或者忽略此题。';
const guard = () => undefined;
let passed = 0;

// Production polling uses a virtual clock here, never wall-clock sleeps.
const nativeTimeout = globalThis.setTimeout;
const nativeClearTimeout = globalThis.clearTimeout;
const nativeNow = Date.now;
const nativePerformanceNow = performance.now;
let clock = 0;
let nextTimer = 0;
const cancelledTimers = new Set<number>();
Date.now = () => clock;
Object.defineProperty(performance, 'now', { configurable: true, value: () => clock });
globalThis.setTimeout = ((callback: () => void, milliseconds = 0) => {
	const id = ++nextTimer;
	// The long worker watchdog remains pending until cancellation; these tests drive worker events directly.
	if (milliseconds >= 20 * 60 * 1000) return id;
	queueMicrotask(() => {
		if (cancelledTimers.delete(id)) return;
		clock += milliseconds;
		callback();
	});
	return id;
}) as unknown as typeof globalThis.setTimeout;
globalThis.clearTimeout = ((id: number) => {
	cancelledTimers.add(id);
}) as unknown as typeof globalThis.clearTimeout;

// browser-env ships an older DOM; supply the standard operation in this fixture process only.
if (!Element.prototype.replaceChildren) {
	Element.prototype.replaceChildren = function (...nodes: (Node | string)[]) {
		while (this.firstChild) this.removeChild(this.firstChild);
		this.append(...nodes);
	};
}

function navigate(url: string) {
	Object.defineProperty(globalThis, 'location', { configurable: true, value: new URL(url) });
}

// Local DOM fixtures have no layout engine. Visibility reflects fixture display/hidden state.
Object.defineProperty(HTMLElement.prototype, 'getClientRects', {
	configurable: true,
	value: function () {
		return this.isConnected && !this.closest('[hidden],[style*="display: none"]') ? [{ width: 100, height: 20 }] : [];
	}
});
HTMLElement.prototype.scrollIntoView = function () {};
// Model a userscript event boundary that cannot accept the sandbox's Window as UIEventInit.view.
const nativeMouseEvent = MouseEvent;
class SandboxMouseEvent extends nativeMouseEvent {
	constructor(type: string, options: MouseEventInit = {}) {
		if (options.view != null) throw new TypeError('Failed to convert value to Window');
		super(type, options);
	}
}
Object.defineProperty(globalThis, 'MouseEvent', { configurable: true, value: SandboxMouseEvent });
Object.defineProperty(globalThis, 'PointerEvent', { configurable: true, value: SandboxMouseEvent });

function listFixture() {
	navigate(listUrl);
	document.body.innerHTML =
		'<aside><div><b>3</b><span>知识点总数</span></div></aside><div class="right-box">' +
		'<div class="mastery-content"><h1 class="mastery-name">第一章</h1><ul class="chunk-list">' +
		'<li class="item-box gray"><div class="item-box-name">目标知识点</div></li>' +
		'<li class="item-box blue"><div class="item-box-name">免考项目</div></li></ul></div>' +
		'<div class="mastery-content"><h1 class="mastery-name">第二章</h1><ul class="chunk-list">' +
		'<li class="item-box green"><div class="item-box-name">已掌握项目</div></li></ul></div></div>';
}

function examFixture(types: string[], matched: boolean[] = types.map(() => false)) {
	navigate(examUrl);
	document.body.replaceChildren();
	const roots = types.map((type, index) => {
		const root = document.createElement('div');
		root.className = 'exam-item';
		root.style.display = index ? 'none' : '';
		root.innerHTML =
			`<div class="quest-type">${type === 'multiple' ? '多选题' : '单选题'}</div>` +
			`<div class="quest-title"><span class="option-index">${index + 1}、</span>题目${index + 1}</div>` +
			`<div class="el-checkbox-group" role="group">${['a', 'b', 'c', 'd']
				.map(
					(value) =>
						`<label><input type="${
							type === 'multiple' ? 'checkbox' : 'radio'
						}" name="q${index}" value="${value}">${value}</label>`
				)
				.join('')}</div>`;
		document.body.append(root);
		return root;
	});
	const card = document.createElement('div');
	card.className = 'answer-card';
	const items = document.createElement('div');
	items.className = 'list';
	roots.forEach((root, index) => {
		const item = document.createElement('button');
		item.className = `item${index ? '' : ' active'}`;
		item.textContent = String(index + 1);
		item.onclick = () => {
			roots.forEach((other) => {
				other.style.display = other === root ? '' : 'none';
			});
			Array.from(items.children).forEach((other) => other.classList.toggle('active', other === item));
		};
		items.append(item);
	});
	card.append(items);
	document.body.append(card);
	const results = roots.map((root, index) => ({
		requested: true,
		resolved: true,
		result: { finish: matched[index] },
		error: matched[index] ? undefined : noAnswer,
		ctx: { root, type: types[index], elements: { title: [root.querySelector('.quest-title')] }, searchInfos: [] }
	})) as unknown as WorkResult<RawElements>[];
	return { roots, results };
}

async function scenario(name: string, run: () => void | Promise<void>) {
	await run();
	passed++;
	console.log(`PASS ${name}`);
}

async function main() {
	await scenario('完整章节集合包含非首屏、非灰和免考，队列仅灰候选', () => {
		listFixture();
		const snapshot = collectList();
		assert.deepEqual(
			snapshot.points.map((point) => [point.chapter, point.title]),
			[
				['第一章', '目标知识点'],
				['第一章', '免考项目'],
				['第二章', '已掌握项目']
			]
		);
		assert.deepEqual([...snapshot.grayKeys], [JSON.stringify(['第一章', '目标知识点'])]);
		document.querySelector('.item-box.green')!.remove();
		assert.throws(collectList, MasteryIdentityError);
	});
	await scenario('同章节重名阻断，不按下标合并', () => {
		listFixture();
		document.querySelectorAll('.item-box-name')[1].textContent = '目标知识点';
		assert.throws(collectList, MasteryIdentityError);
	});
	await scenario('真实身份校验拒绝错课程、缺ID、参数重复和错误结果路由', () => {
		navigate(examUrl);
		const point = { chapter: '第一章', title: '目标知识点', key: JSON.stringify(['第一章', '目标知识点']) };
		assert.deepEqual(readExamIdentity(identity.course, point), identity);
		navigate(examUrl + '&knowledgeId=other');
		assert.equal(isExam(identity), false);
		navigate(examUrl.replace('point-test', ''));
		assert.throws(() => readExamIdentity(identity.course, point), MasteryIdentityError);
		navigate(resultUrl);
		assert.equal(isResult(identity), true);
		navigate(resultUrl.replace('point-test', 'wrong-point'));
		assert.equal(isResult(identity), false);
		navigate(resultUrl.replace('course-test', 'other-course'));
		assert.equal(isResult(identity), false);
	});
	await scenario('灰候选须同名可见悬浮层精确0%，非零/免考不处理', async () => {
		listFixture();
		const point = collectList().points[0];
		const popover = document.createElement('div');
		popover.className = 'mastery-box-custom-popover';
		popover.setAttribute('aria-hidden', 'true');
		popover.innerHTML =
			'<div class="custom-content"><strong class="name">目标知识点</strong><div class="text">掌握度：<span>0%</span><button class="btn">提升掌握度</button></div></div>';
		document.body.append(popover);
		const name = document.querySelector<HTMLElement>('.item-box-name')!;
		name.addEventListener('mouseenter', () => popover.setAttribute('aria-hidden', 'false'));
		name.addEventListener('mouseleave', () => popover.setAttribute('aria-hidden', 'true'));
		assert.equal(await inspectPoint(point, guard), true);
		popover.querySelector('.text > span')!.textContent = '80%';
		assert.equal(await inspectPoint(point, guard), false);
		popover.querySelector('.text > span')!.textContent = '0%';
		popover.append('免考');
		assert.equal(await inspectPoint(point, guard), false);
	});
	await scenario('其他标题悬浮层同时可见时仍定位当前项，同名歧义必须阻断', async () => {
		listFixture();
		const point = collectList().points[0];
		const popup = document.createElement('div');
		popup.className = 'mastery-box-custom-popover';
		popup.setAttribute('aria-hidden', 'true');
		popup.innerHTML =
			'<div class="custom-content"><strong class="name">目标知识点</strong><div class="text"><span>0%</span><button class="btn">提升掌握度</button></div></div>';
		const other = popup.cloneNode(true) as HTMLElement;
		other.querySelector('.name')!.textContent = '其他知识点';
		other.setAttribute('aria-hidden', 'false');
		let clicks = 0;
		other.querySelector('button')!.onclick = () => {
			clicks++;
		};
		document.body.append(popup, other);
		const name = document.querySelector<HTMLElement>('.item-box-name')!;
		name.addEventListener('mouseleave', () => popup.setAttribute('aria-hidden', 'true'));
		name.addEventListener('mouseenter', () => popup.setAttribute('aria-hidden', 'false'));
		assert.equal(await inspectPoint(point, guard), true);
		assert.equal(clicks, 0, '不得操作其他知识点的入口');
		assert.equal(other.getAttribute('aria-hidden'), 'false', '不得通过隐藏其他层制造成功');
		const duplicate = popup.cloneNode(true) as HTMLElement;
		duplicate.setAttribute('aria-hidden', 'true');
		document.body.append(duplicate);
		name.addEventListener('mouseenter', () => duplicate.setAttribute('aria-hidden', 'false'));
		await assert.rejects(() => inspectPoint(point, guard), /多个同名可见悬浮层/);
		assert.equal(clicks, 0);
	});
	await scenario('单选随机兜底恰选一个，多选部分匹配重建合法组合，原成功选择不覆盖', async () => {
		const { roots, results } = examFixture(['single', 'multiple', 'single'], [false, false, true]);
		roots[1].querySelectorAll<HTMLInputElement>('input')[0].checked = true;
		roots[1].querySelector('[role="group"]')!.setAttribute('min', '2');
		roots[1].querySelector('[role="group"]')!.setAttribute('max', '2');
		roots[2].querySelectorAll<HTMLInputElement>('input')[3].checked = true;
		const random = Math.random;
		Math.random = () => 0;
		try {
			assert.equal(await applyLocalFallback(results, guard), 2);
		} finally {
			Math.random = random;
		}
		assert.equal(roots[0].querySelectorAll('input:checked').length, 1);
		assert.equal(roots[1].querySelectorAll('input:checked').length, 2);
		assert.equal(roots[1].querySelectorAll<HTMLInputElement>('input')[0].checked, false);
		assert.equal(roots[2].querySelectorAll<HTMLInputElement>('input')[3].checked, true);
		assert.equal(roots[2].querySelectorAll('input:checked').length, 1);
	});
	await scenario('运行错误不伪装成随机答案，重复选项值阻断', async () => {
		let fixture = examFixture(['multiple']);
		fixture.results[0].error = 'network timeout';
		await assert.rejects(() => applyLocalFallback(fixture.results, guard), /原工作器发生错误/);
		assert.equal(fixture.roots[0].querySelectorAll('input:checked').length, 0);
		fixture = examFixture(['multiple']);
		fixture.roots[0].querySelectorAll<HTMLInputElement>('input')[1].value = 'a';
		await assert.rejects(() => applyLocalFallback(fixture.results, guard), /唯一性/);
	});
	await scenario('仅点一次提交；成功toast不冒充错误；等待真实题数而非初始0', async () => {
		examFixture(['single']);
		let submissions = 0;
		const submit = document.createElement('button');
		submit.className = 'submit';
		submit.onclick = () => {
			submissions++;
			navigate(resultUrl);
			document.body.innerHTML =
				'<div role="alert" class="el-message--success">提交成功</div>' +
				'<div class="line1-count-total"><div class="line1-count-total-title">总题数</div><div class="line1-count-total-num">0</div></div>' +
				'<div class="line1-count-total"><div class="line1-count-total-title">已答对</div><div class="line1-count-total-num">0</div></div>';
			setTimeout(() => {
				document.querySelector('.line1-count-total-num')!.textContent = '1';
			}, 20);
		};
		document.body.append(submit);
		await submitAndConfirm(identity, 1, guard);
		assert.equal(submissions, 1);
		assert.equal(document.querySelector('.line1-count-total-num')!.textContent, '1');
	});
	await scenario('错误结果ID阻断且不重交', async () => {
		examFixture(['single']);
		let clicks = 0;
		const button = document.createElement('button');
		button.className = 'submit';
		button.onclick = () => {
			clicks++;
			navigate(resultUrl.replace('point-test', 'other'));
		};
		document.body.append(button);
		await assert.rejects(() => submitAndConfirm(identity, 1, guard), MasteryIdentityError);
		assert.equal(clicks, 1);
	});
	await scenario('逐次后退两步、提前到列表停止、跨课程停止', async () => {
		document.body.replaceChildren();
		navigate(resultUrl);
		let backs = 0;
		Object.defineProperty(globalThis, 'history', {
			configurable: true,
			value: {
				back() {
					if (++backs === 1) navigate(examUrl);
					else listFixture();
				}
			}
		});
		await returnToMasteryList(identity, guard);
		assert.equal(backs, 2);
		backs = 0;
		navigate(resultUrl);
		Object.defineProperty(globalThis, 'history', {
			configurable: true,
			value: {
				back() {
					backs++;
					listFixture();
				}
			}
		});
		await returnToMasteryList(identity, guard);
		assert.equal(backs, 1);
		backs = 0;
		navigate(resultUrl);
		Object.defineProperty(globalThis, 'history', {
			configurable: true,
			value: {
				back() {
					backs++;
					navigate(listUrl.replace('course-test', 'other'));
				}
			}
		});
		await assert.rejects(() => returnToMasteryList(identity, guard), MasteryIdentityError);
		assert.equal(backs, 1);
	});
	await scenario('等待保留false结果且取消后无后续操作', async () => {
		assert.equal(await waitFor(() => false, guard, 5), false);
		let reads = 0;
		await assert.rejects(
			() =>
				waitFor(
					() => {
						reads++;
						return true;
					},
					() => {
						throw new Error('cancelled');
					},
					5
				),
			/cancelled/
		);
		assert.equal(reads, 0);
	});
	await scenario('无遗漏点击开始直接结束，不进入答题或提交', async () => {
		listFixture();
		document.querySelector('.item-box.gray')!.className = 'item-box green';
		let starts = 0;
		masterySession.setWorkerStarter(() => {
			starts++;
		});
		const mount = document.createElement('div');
		document.body.append(mount);
		masterySession.mount(mount);
		mount.querySelector<HTMLButtonElement>('button')!.click();
		for (let turn = 0; turn < 20 && masterySession.isActive(); turn++) await Promise.resolve();
		assert.equal(starts, 0);
		assert.match(mount.textContent || '', /当前没有遗漏点/);
		assert.equal(masterySession.isActive(), false);
	});
	await scenario('面板一次启动处理两项，重复done和旧provider不得重交或重建worker', async () => {
		let starts = 0;
		let submissions = 0;
		let backSteps = 0;
		let workerFailure: 'pause' | 'close' | undefined;
		let userPause = false;
		let pauseChecks = 0;
		const staleFactories: Array<(factory: () => OCSWorker) => unknown> = [];
		const mount = document.createElement('div');
		const renderList = () => {
			listFixture();
			document.querySelector('.item-box.green')!.className = 'item-box gray';
			document.body.append(mount);
			masterySession.mount(mount);
			for (const card of Array.from(document.querySelectorAll<HTMLElement>('.item-box.gray'))) {
				const name = card.querySelector<HTMLElement>('.item-box-name')!;
				const title = name.textContent!;
				const popup = document.createElement('div');
				popup.className = 'mastery-box-custom-popover';
				popup.setAttribute('aria-hidden', 'true');
				popup.innerHTML = `<div class="custom-content"><strong class="name">${title}</strong><div class="text"><span>0%</span><button class="btn">提升掌握度</button></div></div>`;
				document.body.append(popup);
				name.addEventListener('mouseenter', () => popup.setAttribute('aria-hidden', 'false'));
				name.addEventListener('mouseleave', () => popup.setAttribute('aria-hidden', 'true'));
				popup.querySelector('button')!.onclick = () => {
					examFixture(['single'], [true]);
					navigate(
						examUrl.replace('point-test', encodeURIComponent(title)).replace('目标知识点', encodeURIComponent(title))
					);
					const submit = document.createElement('button');
					submit.className = 'submit';
					submit.onclick = () => {
						submissions++;
						navigate(resultUrl.replace('point-test', encodeURIComponent(title)));
						document.body.innerHTML =
							'<div class="line1-count-total"><div class="line1-count-total-title">总题数</div><div class="line1-count-total-num">1</div></div><div class="line1-count-total"><div class="line1-count-total-title">已答对</div><div class="line1-count-total-num">0</div></div>';
					};
					document.body.append(submit);
				};
			}
		};
		masterySession.setWorkerStarter(() => {
			assert.equal(masterySession.claimWorkerStart(), true);
			assert.equal(masterySession.claimWorkerStart(), false);
			const create = masterySession.workerFactory();
			staleFactories.push(create);
			let queries = 0;
			let selections = 0;
			const worker = new EventEmitter() as EventEmitter & {
				opts: Pick<WorkOptions<RawElements>, 'answerer' | 'work' | 'onResultsInit' | 'onResultsUpdate'>;
				isClose: boolean;
				isStop: boolean;
			};
			worker.opts = {
				answerer: async () => {
					queries++;
					return [];
				},
				work: {
					handler: () => {
						selections++;
					}
				}
			};
			worker.isClose = false;
			worker.isStop = false;
			worker.on('close', () => {
				worker.isClose = true;
			});
			worker.on('stop', () => {
				worker.isStop = true;
			});
			worker.on('continuate', () => {
				worker.isStop = false;
			});
			// Event-driven fixture implements the controller's consumed surface, not a platform engine.
			const fixtureWorker = worker as unknown as OCSWorker;
			create(() => {
				starts++;
				return fixtureWorker;
			});
			const root = document.querySelector<HTMLElement>('.exam-item')!;
			root.querySelector('label')!.click();
			const result = { requested: true, resolved: true, result: { finish: true }, ctx: { root, type: 'single' } };
			const resultFixture = result as unknown as WorkResult<RawElements>;
			void (async () => {
				if (userPause && starts === 1) {
					const button = mount.querySelector<HTMLButtonElement>('button')!;
					assert.equal(button.textContent, '暂停补遗漏');
					assert.equal(button.disabled, false);
					button.click();
					assert.equal(button.textContent, '开始补遗漏');
					assert.equal(masterySession.isPaused(), true);
					const query = worker.opts.answerer(resultFixture.ctx!.elements, resultFixture.ctx!);
					const work = worker.opts.work;
					assert.equal(typeof work, 'object');
					if (typeof work !== 'object') throw new Error('fixture work shape');
					const select = work.handler('single', 'a', root.querySelector<HTMLElement>('label')!, resultFixture.ctx!);
					await Promise.all([query, select]);
					assert.equal(queries, 1, '暂停遍历不暂停本知识点查询');
					assert.equal(selections, 1, '暂停遍历不暂停本知识点选项');
					assert.equal(worker.isStop, false, '不向原worker发送stop');
					pauseChecks++;
				}
				await worker.opts.onResultsUpdate!(resultFixture, 0, [resultFixture]);
			})().then(() => {
				if (workerFailure === 'close') worker.emit('close');
				else {
					worker.isStop = workerFailure === 'pause';
					worker.emit('done');
					worker.emit('done');
				}
			});
		});
		Object.defineProperty(globalThis, 'history', {
			configurable: true,
			value: {
				back() {
					backSteps++;
					if (location.pathname.startsWith('/pointOfMastery/')) {
						const id = decodeURIComponent(location.pathname.split('/')[4]);
						navigate(
							examUrl.replace('point-test', encodeURIComponent(id)).replace('目标知识点', encodeURIComponent(id))
						);
					} else {
						// Real SPA history updates the URL before asynchronously rebuilding chapter DOM.
						navigate(listUrl);
						document.body.replaceChildren();
						setTimeout(renderList, 300);
					}
				}
			}
		});
		renderList();
		mount.querySelector<HTMLButtonElement>('button')!.click();
		for (let turns = 0; turns < 2000 && masterySession.isActive(); turns++) await Promise.resolve();
		assert.equal(masterySession.isActive(), false, mount.textContent || '会话未结束');
		assert.match(mount.textContent || '', /已确认提交 2/);
		assert.match(mount.textContent || '', /未处理 0/);
		assert.equal(starts, 2);
		assert.equal(submissions, 2);
		assert.equal(backSteps, 4);
		for (const create of staleFactories)
			assert.equal(
				create(() => {
					throw new Error('旧provider被重启');
				}),
				undefined
			);
		for (const failure of ['pause', 'close'] as const) {
			workerFailure = failure;
			starts = submissions = backSteps = 0;
			renderList();
			mount.querySelector<HTMLButtonElement>('button')!.click();
			for (let turns = 0; turns < 2000 && masterySession.isActive(); turns++) await Promise.resolve();
			assert.equal(masterySession.isActive(), false, mount.textContent || '会话未结束');
			assert.match(mount.textContent || '', /失败\/未确认 2/);
			assert.match(mount.textContent || '', /已确认提交 0/);
			assert.equal(submissions, 0, `${failure} 不得提交`);
			assert.equal(starts, 2, `${failure} 只处理每项一轮`);
			assert.equal(backSteps, 2, `${failure} 从答题页一次后退回列表`);
		}
		userPause = true;
		workerFailure = undefined;
		starts = submissions = backSteps = 0;
		renderList();
		mount.querySelector<HTMLButtonElement>('button')!.click();
		for (
			let turns = 0;
			turns < 4000 &&
			!(masterySession.isPaused() && location.pathname === '/study/mastery' && /已暂停/.test(mount.textContent || ''));
			turns++
		)
			await Promise.resolve();
		assert.equal(masterySession.isActive(), true);
		assert.equal(location.pathname, '/study/mastery', '暂停后仍返回列表');
		assert.equal(starts, 1, '暂停时不进入第二项');
		assert.equal(submissions, 1, '当前项仍完成一次提交');
		assert.equal(backSteps, 2, '当前项完成两次后退');
		assert.match(mount.textContent || '', /已确认提交 1/);
		assert.match(mount.textContent || '', /未处理 1/);
		for (let turns = 0; turns < 50; turns++) await Promise.resolve();
		assert.equal(starts, 1);
		assert.equal(mount.querySelector('button')!.textContent, '开始补遗漏');
		mount.querySelector<HTMLButtonElement>('button')!.click();
		for (let turns = 0; turns < 4000 && masterySession.isActive(); turns++) await Promise.resolve();
		assert.equal(masterySession.isActive(), false, mount.textContent || '会话未结束');
		assert.equal(pauseChecks, 1);
		assert.equal(starts, 2, '恢复只为下一项创建一个worker');
		assert.equal(submissions, 2, '每项只提交一次');
		assert.match(mount.textContent || '', /已确认提交 2/);
		assert.equal(mount.querySelector('button')!.textContent, '开始补遗漏');
		starts = submissions = backSteps = 0;
		renderList();
		mount.querySelector<HTMLButtonElement>('button')!.click();
		for (
			let turns = 0;
			turns < 4000 &&
			!(masterySession.isPaused() && location.pathname === '/study/mastery' && /已暂停/.test(mount.textContent || ''));
			turns++
		)
			await Promise.resolve();
		// Node's global Event is not necessarily the event constructor of browser-env's DOM realm.
		const pagehide = document.createEvent('Event');
		pagehide.initEvent('pagehide', false, false);
		window.dispatchEvent(pagehide);
		for (let turns = 0; turns < 30; turns++) await Promise.resolve();
		assert.equal(masterySession.isActive(), false);
		assert.equal(starts, 1, '离开页面释放等待但不启动下一项');
		assert.equal(submissions, 1);
	});
	console.log(`${passed} isolated mastery scenarios passed. No platform browser or submission used.`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => {
		globalThis.setTimeout = nativeTimeout;
		globalThis.clearTimeout = nativeClearTimeout;
		Date.now = nativeNow;
		Object.defineProperty(performance, 'now', { configurable: true, value: nativePerformanceNow });
	});
