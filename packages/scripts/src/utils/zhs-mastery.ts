import type { OCSWorker, RawElements, WorkResult } from '@ocsjs/core';
import {
	collectList,
	enterPoint,
	inspectPoint,
	readExamIdentity,
	isList,
	isExam,
	isResult,
	applyLocalFallback,
	submitAndConfirm,
	returnToMasteryList,
	MasteryIdentityError,
	ExamIdentity,
	PointLocator,
	ListSnapshot
} from './zhs-mastery-dom';

type Phase =
	| 'idle'
	| 'collecting'
	| 'entering'
	| 'answering'
	| 'fallback'
	| 'submitting'
	| 'returning'
	| 'finished'
	| 'blocked'
	| 'stopped';
type Outcome = 'pending' | 'submitted' | 'failed' | 'skipped';
interface PointState {
	point: PointLocator;
	outcome: Outcome;
	reason: string;
	randomCount: number;
}
interface WorkerBinding {
	identity: ExamIdentity;
	started: boolean;
	created: boolean;
	worker?: Pick<OCSWorker, 'isClose' | 'isStop' | 'emit'>;
	results: WorkResult<RawElements>[];
	resolve: (results: WorkResult<RawElements>[]) => void;
	reject: (error: Error) => void;
	cleanup?: () => void;
}

/** One document-local run. No automatic restart, persistent state or platform API calls. */
class MasterySession {
	private phase: Phase = 'idle';
	private runId = 0;
	private course = '';
	private states: PointState[] = [];
	private snapshot?: ListSnapshot;
	private binding?: WorkerBinding;
	private locatorToId = new Map<string, string>();
	private idToLocator = new Map<string, string>();
	private starter?: () => void;
	private watch?: ReturnType<typeof setInterval>;
	private panel?: HTMLDivElement;
	private startButton?: HTMLButtonElement;
	private status?: HTMLParagraphElement;
	private details?: HTMLUListElement;
	private message = '等待开始';
	private current?: PointState;
	private paused = false;
	private resumeWaiters = new Set<() => void>();

	isPaused() {
		return this.paused;
	}

	private releaseWaiters() {
		for (const resolve of this.resumeWaiters) resolve();
		this.resumeWaiters.clear();
	}

	private togglePause() {
		this.paused = !this.paused;
		if (!this.paused) this.releaseWaiters();
		this.render();
	}

	private async checkpoint(run: number) {
		this.guard(run);
		while (this.paused) {
			await new Promise<void>((resolve) => this.resumeWaiters.add(resolve));
			this.guard(run);
		}
	}

	isTargetList() {
		return (
			location.protocol === 'https:' &&
			location.hostname === 'studywisdomh5.zhihuishu.com' &&
			location.pathname === '/study/mastery'
		);
	}

	isActive() {
		return !['idle', 'finished', 'blocked', 'stopped'].includes(this.phase);
	}

	ownsRoute() {
		return this.isActive() && location.hostname === 'studywisdomh5.zhihuishu.com';
	}

	setWorkerStarter(start: () => void) {
		this.starter = start;
	}

	mount(body: HTMLElement) {
		if (!this.panel) {
			this.panel = document.createElement('div');
			this.startButton = document.createElement('button');
			this.startButton.className = 'base-style-button';
			this.startButton.textContent = '开始补遗漏';
			this.startButton.onclick = () => {
				if (this.isActive()) this.togglePause();
				else this.start();
			};
			const explanation = document.createElement('p');
			explanation.textContent =
				'仅灰色遗漏点；复用原 OCS 作答，无可用答案时本模块随机兜底；每项一轮、自动提交、历史后退返回。不保证答对，离开模块停止。';
			this.status = document.createElement('p');
			this.status.setAttribute('role', 'status');
			this.details = document.createElement('ul');
			this.panel.append(explanation, this.startButton, this.status, this.details);
		}
		if (this.panel.parentElement !== body) body.replaceChildren(this.panel);
		this.render();
	}

	/** Claim commonWork setup as well as the actual worker: pushed events can race. */
	claimWorkerStart() {
		const binding = this.binding;
		if (!this.isActive() || this.phase !== 'answering' || !binding || binding.started || !isExam(binding.identity))
			return false;
		binding.started = true;
		return true;
	}

	/** Captured before awaits, so a delayed old start cannot configure a future point. */
	workerStartGuard() {
		const run = this.runId;
		const binding = this.binding;
		return () =>
			run === this.runId &&
			this.isActive() &&
			this.phase === 'answering' &&
			!!binding &&
			binding === this.binding &&
			binding.started &&
			!binding.created &&
			isExam(binding.identity);
	}

	/** Every old commonWork closure retains its original run and point, never a future one. */
	workerFactory() {
		const run = this.runId;
		const binding = this.binding;
		return <E extends RawElements>(factory: () => OCSWorker<E>): OCSWorker<E> | undefined => {
			if (
				run !== this.runId ||
				!this.isActive() ||
				this.phase !== 'answering' ||
				!binding ||
				binding !== this.binding ||
				binding.created ||
				!isExam(binding.identity)
			)
				return undefined;
			binding.created = true;
			const worker = factory();
			binding.worker = worker;
			const opts = worker.opts;
			const init = opts.onResultsInit;
			const update = opts.onResultsUpdate;
			opts.onResultsInit = async (current, index, results) => {
				binding.results = results;
				await init?.(current, index, results);
			};
			opts.onResultsUpdate = async (current, index, results) => {
				binding.results = results;
				await update?.(current, index, results);
			};
			let completed = false;
			const done = () => {
				if (completed || run !== this.runId || binding !== this.binding || this.phase !== 'answering') return;
				completed = true;
				if (worker.isClose || worker.isStop) {
					binding.reject(new Error('原作答器已暂停或关闭，不能提交'));
					return;
				}
				this.phase = 'fallback';
				this.render();
				binding.resolve(binding.results);
			};
			const close = () => binding.reject(new Error('原作答器在作答完成前关闭'));
			worker.once('done', done);
			worker.once('close', close);
			binding.cleanup = () => {
				worker.off('done', done);
				worker.off('close', close);
				opts.onResultsInit = init;
				opts.onResultsUpdate = update;
			};
			return worker;
		};
	}

	private guard(run: number) {
		if (run !== this.runId || !this.isActive()) throw new Error('本轮已停止');
		if (location.protocol !== 'https:' || location.hostname !== 'studywisdomh5.zhihuishu.com')
			throw new MasteryIdentityError('已离开目标模块');
		const url = new URL(location.href);
		if (url.searchParams.get('recruitAndCourseId') !== this.course) throw new MasteryIdentityError('课程身份变化');
		const path = url.pathname;
		if (this.phase === 'collecting' && isList(this.course)) return;
		if (this.phase === 'entering' && (isList(this.course) || path === '/exam')) return;
		if (this.phase === 'returning') {
			if (isList(this.course) || (this.binding && (isExam(this.binding.identity) || isResult(this.binding.identity))))
				return;
			// An entry failure can return only through an identified course's exam.
			if (!this.binding && path === '/exam') return;
		}
		if (this.binding && isExam(this.binding.identity)) return;
		if (this.phase === 'submitting' && this.binding && isResult(this.binding.identity)) return;
		throw new MasteryIdentityError('页面已离开当前知识点或预期导航链');
	}

	private assertSnapshot() {
		const latest = collectList();
		const keys = new Set(latest.points.map((point) => point.key));
		if (
			!this.snapshot ||
			latest.points.length !== this.snapshot.points.length ||
			this.snapshot.points.some((point) => !keys.has(point.key))
		) {
			throw new MasteryIdentityError('列表章节或标题集合发生变化');
		}
	}

	private closeWorker() {
		const binding = this.binding;
		if (!binding) return;
		binding.cleanup?.();
		binding.cleanup = undefined;
		if (binding.worker && !binding.worker.isClose) binding.worker.emit('close');
		// Native worker pause polling must also terminate after cancellation, without emitting resume UI events.
		if (binding.worker) binding.worker.isStop = false;
	}

	private async start() {
		if (this.isActive() || !this.isTargetList()) return;
		const course = new URL(location.href).searchParams.get('recruitAndCourseId');
		if (!course || !this.starter) {
			this.message = '课程参数或原作答入口未就绪，未开始';
			this.render();
			return;
		}
		const run = ++this.runId;
		this.paused = false;
		this.course = course;
		this.phase = 'collecting';
		this.message = '';
		this.states = [];
		this.current = undefined;
		this.binding = undefined;
		this.locatorToId.clear();
		this.idToLocator.clear();
		const guard = () => this.guard(run);
		const leave = () => this.stop('页面已销毁，本轮停止');
		window.addEventListener('pagehide', leave, { once: true });
		this.watch = setInterval(() => {
			try {
				guard();
			} catch (error) {
				this.stop(this.errorMessage(error));
			}
		}, 200);
		this.render();
		try {
			this.snapshot = collectList();
			this.states = this.snapshot.points
				.filter((point) => this.snapshot!.grayKeys.has(point.key))
				.map((point) => ({ point, outcome: 'pending', reason: '', randomCount: 0 }));
			this.render();
			for (const state of this.states) {
				this.phase = 'collecting';
				this.render();
				await this.checkpoint(run);
				this.current = state;
				this.phase = 'collecting';
				this.assertSnapshot();
				const pending = await inspectPoint(state.point, guard);
				await this.checkpoint(run);
				if (!pending) {
					state.outcome = 'skipped';
					state.reason = '已非遗漏点或为免考';
					this.render();
					continue;
				}
				this.phase = 'entering';
				this.render();
				let returnIdentity: ExamIdentity | undefined;
				try {
					await enterPoint(state.point, guard, () => this.checkpoint(run));
					guard();
					const identity = readExamIdentity(this.course, state.point);
					returnIdentity = identity;
					const id = JSON.stringify([this.course, identity.knowledgeId]);
					if (this.locatorToId.has(state.point.key) || this.idToLocator.has(id))
						throw new MasteryIdentityError('知识点真实身份重复或绑定冲突');
					this.locatorToId.set(state.point.key, id);
					this.idToLocator.set(id, state.point.key);
					const expectedCount = document.querySelectorAll('.exam-item').length;
					if (!expectedCount) throw new Error('未找到题目');
					let timer: ReturnType<typeof setTimeout> | undefined;
					// ES2020/TypeScript 4.5 workspace: Promise.withResolvers is not in the supported library.
					const completed = new Promise<WorkResult<RawElements>[]>((resolve, reject) => {
						this.binding = { identity, started: false, created: false, results: [], resolve, reject };
						timer = setTimeout(() => reject(new Error('原作答流程超时（20分钟），未提交')), 20 * 60 * 1000);
					});
					this.phase = 'answering';
					this.render();
					let results: WorkResult<RawElements>[];
					try {
						this.starter();
						results = await completed;
					} finally {
						clearTimeout(timer);
					}
					guard();
					if (results.length !== expectedCount || results.some((result) => !result.resolved))
						throw new Error('原作答器结果不完整，未提交');
					const fallbackGuard = () => {
						guard();
						if (this.binding?.worker?.isStop || this.binding?.worker?.isClose)
							throw new Error('局部兜底期间原作答器暂停或关闭');
					};
					state.randomCount = await applyLocalFallback(results, fallbackGuard);
					guard();
					this.closeWorker();
					this.phase = 'submitting';
					this.render();
					// This point never reaches this statement twice, even if confirmation times out.
					await submitAndConfirm(identity, expectedCount, guard);
					guard();
					state.outcome = 'submitted';
				} catch (error) {
					if (!this.isActive() || run !== this.runId) throw error;
					state.outcome = 'failed';
					state.reason = `${this.phase}：${this.errorMessage(error)}`;
					if (error instanceof MasteryIdentityError) throw error;
				} finally {
					this.closeWorker();
				}
				guard();
				this.phase = 'returning';
				this.render();
				await returnToMasteryList(returnIdentity ?? { course: this.course }, guard, this.snapshot.points.length);
				guard();
				this.binding = undefined;
				this.phase = 'collecting';
				this.assertSnapshot();
			}
			guard();
			this.phase = 'finished';
			this.message = this.states.length
				? '本轮结束，每项仅处理一轮；未因答错或掌握度为0重做。'
				: '当前没有遗漏点，无需处理。';
		} catch (error) {
			if (run === this.runId && this.isActive()) {
				this.phase = 'blocked';
				this.message = this.errorMessage(error);
			}
		} finally {
			if (run === this.runId) {
				this.paused = false;
				this.releaseWaiters();
				this.closeWorker();
				clearInterval(this.watch);
				this.watch = undefined;
				window.removeEventListener('pagehide', leave);
				this.render();
			}
		}
	}

	private stop(reason: string) {
		if (!this.isActive()) return;
		this.phase = 'stopped';
		this.paused = false;
		this.releaseWaiters();
		this.message = reason;
		this.binding?.reject(new Error(reason));
		this.closeWorker();
		clearInterval(this.watch);
		this.watch = undefined;
		this.render();
	}

	private errorMessage(error: unknown) {
		// Keep page/session errors useful without exposing URL parameters or credentials.
		return error instanceof Error ? error.message.replace(/https?:\/\/\S+/g, '[页面地址已隐藏]') : '页面操作失败';
	}

	private render() {
		if (!this.status || !this.details || !this.startButton) return;
		this.startButton.disabled = !this.isActive() && !this.isTargetList();
		this.startButton.textContent = this.isActive() && !this.paused ? '暂停补遗漏' : '开始补遗漏';
		const count = (outcome: Outcome) => this.states.filter((state) => state.outcome === outcome).length;
		this.status.textContent = `阶段：${this.phase}${
			this.paused
				? isList(this.course) && this.phase === 'collecting'
					? '（已暂停）'
					: '（完成当前知识点后暂停）'
				: ''
		}；总数 ${this.states.length}；已确认提交 ${count('submitted')}；失败/未确认 ${count(
			'failed'
		)}；状态变化跳过 ${count('skipped')}；未处理 ${count('pending')}。${
			this.current && this.isActive() ? `当前：${this.current.point.chapter} / ${this.current.point.title}。` : ''
		}${this.message}`;
		this.details.replaceChildren();
		for (const state of this.states) {
			if (!state.reason && !state.randomCount) continue;
			const item = document.createElement('li');
			item.textContent = `${state.point.chapter} / ${state.point.title}：${state.reason || '已确认提交'}${
				state.randomCount ? `；随机兜底 ${state.randomCount} 题（不代表正确）` : ''
			}`;
			this.details.append(item);
		}
	}
}

export const masterySession = new MasterySession();
