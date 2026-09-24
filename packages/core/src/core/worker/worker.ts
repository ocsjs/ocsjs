import { $, $message, CommonEventEmitter } from 'easy-us';
import { domSearchAll } from '../utils/dom';
import {
	CustomWorkOptions,
	RawElements,
	ResolverResult,
	SimplifyWorkResult,
	WorkContext,
	WorkerEvents,
	WorkOptions,
	WorkResult,
	WorkUploadType
} from './interface';
import { createDefaultQuestionResolver } from './question.resolver';
import { defaultWorkTypeResolver } from './utils';
import { AnswerWrapperHandlerConfig } from '../answer-wrapper';

/**
 * 自动答题器， 传入一些指定的配置， 就可以进行自动答题。
 *
 * @param work      工作器, 传入一个方法可自定义工作器，或者使用默认的工作器，详情： {@link WorkOptions.work}
 * @param answerer  查题器, : 默认是 {@link defaultAnswerWrapperHandler}
 *
 */
export class OCSWorker<E extends RawElements = RawElements> extends CommonEventEmitter<WorkerEvents> {
	opts: WorkOptions<E>;
	isRunning = false;
	isClose = false;
	isStop = false;
	totalQuestionCount = 0;

	/** 元素观察器定时器（root 消失检测） */
	private rootObserverTimer?: ReturnType<typeof setInterval>;
	/** root 开始持续消失的时间戳（未消失为 undefined） */
	private rootLostSince?: number;

	constructor(opts: WorkOptions<E>) {
		super();
		this.opts = opts;
	}

	/**
	 * 启动元素观察器（幂等）：root 元素从界面消失时自动关闭答题。
	 *
	 * 场景：location.hash 更新 / SPA 页面切换后，脚本沙盒不会被重置，
	 * 答题程序仍在运行但操作的是已脱离文档的旧元素，此时必须自动关闭。
	 *
	 * 判定方式（间隔轮询）：
	 * - root 为字符串选择器：document.querySelector(root) 是否存在
	 * - root 为元素数组：每次检测重新读取数组内容（支持消费方原地刷新数组），
	 *   任一元素 isConnected 即视为存活
	 * 持续消失超过 lostTimeoutMs 才判定丢失，防止框架重渲染/正常切题时
	 * 元素瞬时脱离文档导致的误判。
	 */
	private startRootObserver() {
		const cfg = this.opts.rootObserver;
		if (!cfg?.enabled || this.rootObserverTimer !== undefined) {
			return;
		}
		const interval = cfg.checkIntervalMs ?? 1000;
		const lostTimeout = cfg.lostTimeoutMs ?? 1000;
		this.rootObserverTimer = setInterval(() => {
			if (this.isClose) {
				this.stopRootObserver();
				return;
			}
			const alive =
				typeof this.opts.root === 'string'
					? !!document.querySelector(this.opts.root)
					: this.opts.root.some((el) => el.isConnected);
			if (alive) {
				this.rootLostSince = undefined;
				return;
			}
			this.rootLostSince ??= Date.now();
			if (Date.now() - this.rootLostSince >= lostTimeout) {
				this.stopRootObserver();
				cfg.onRootLost?.();
				if (!this.isClose) {
					$message.warn({
						content: '⚠️ 题目元素已从页面消失（页面可能已跳转或刷新），答题程序已自动关闭。',
						duration: 0
					});
				}
				this.emit('close');
			}
		}, interval);
	}

	/** 停止元素观察器 */
	private stopRootObserver() {
		if (this.rootObserverTimer !== undefined) {
			clearInterval(this.rootObserverTimer);
			this.rootObserverTimer = undefined;
		}
		this.rootLostSince = undefined;
	}

	/** 启动答题器  */
	async doWork(options?: { enable_debug?: boolean }) {
		this.emit('start');
		this.isRunning = true;

		this.once('close', () => {
			this.isClose = true;
			this.stopRootObserver();
		});

		// 启动元素观察器：root 消失时自动关闭（幂等，重复 doWork 不会重复创建）
		this.startRootObserver();

		this.on('stop', () => {
			this.isStop = true;
		});

		this.on('continuate', () => {
			this.isStop = false;
		});

		/** 寻找题目父节点 */
		const questionRoots: HTMLElement[] | null =
			typeof this.opts.root === 'string' ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;

		this.totalQuestionCount += questionRoots.length;

		if (options?.enable_debug) {
			console.debug('开始答题', this);
			console.debug('题目数量: ', questionRoots.length);
			console.debug('父节点列表: ', questionRoots);
		}

		/** 答题结果 */
		const results: WorkResult<E>[] = [];

		if (questionRoots.length === 0) {
			throw new Error('未找到任何题目，答题结束。');
		}

		/** 搜索元素 */
		for (const questionRoot of questionRoots) {
			// 初始化上下文
			const ctx: WorkContext<E> = {
				searchInfos: [],
				root: questionRoot,
				elements: domSearchAll<E>(this.opts.elements, questionRoot),
				type: undefined,
				answerSeparators: this.opts.answerSeparators
			};

			/** 执行元素搜索钩子 */
			await this.opts.onElementSearched?.(ctx.elements, questionRoot);
			/** 排除掉 null 的元素 */
			ctx.elements.title = ctx.elements.title?.filter(Boolean) as HTMLElement[];
			ctx.elements.options = ctx.elements.options?.filter(Boolean) as HTMLElement[];

			/** 获取题目类型 */
			if (typeof this.opts.work === 'object') {
				ctx.type =
					this.opts.work.type === undefined
						? // 使用默认解析器
						  defaultWorkTypeResolver(ctx)
						: // 自定义解析器
						typeof this.opts.work.type === 'string'
						? this.opts.work.type
						: this.opts.work.type(ctx);
			}

			results.push({
				requested: false,
				resolved: false,
				ctx: ctx
			});
		}

		if (options?.enable_debug) {
			console.debug('上下文已初始化: ', results);
		}

		/** 请求答案的线程 */
		const requestThread = async (index: number) => {
			let error: string | undefined;
			const result = results[index];
			const ctx = result.ctx || ({} as WorkContext<E>);

			/** 强行关闭 */
			if (this.isClose === true) {
				this.isRunning = false;
				return;
			}

			/** 检查是否暂停中 */
			if (this.isStop) {
				await waitForContinuate(() => this.isStop);
			}

			/** 查找答案 */
			ctx.searchInfos = [];

			if (options?.enable_debug) {
				console.groupEnd();
				console.group(
					'开始搜题: ',
					ctx.elements.title
						?.map((t) => t?.innerText)
						.filter(Boolean)
						.join(', ')
						.slice(0, 20)
				);
				console.log('ctx', result.ctx);
			}

			try {
				ctx.searchInfos = (await this.opts.answerer(ctx.elements, ctx)) || [];

				// 答案为 undefined 的情况， 需要赋值给一个空字符串，因为可能传回的题目中带有其他提示信息，或者题目里包含答案。
				ctx.searchInfos.forEach((info) => {
					info.results = info.results.map((ans) => {
						ans.answer = ans.answer ? ans.answer.trim() : '';
						return ans;
					});
				});
			} catch (err) {
				error = String(err);
			}

			result.ctx = ctx;
			result.requested = true;
			result.error = error;

			if (options?.enable_debug) {
				console.log('搜题结果: ', ctx.searchInfos);
			}
			/** 回调 */
			await this.opts.onResultsUpdate?.(results[index], index, results);
		};

		const waitForRequested = async (result: WorkResult<E>) => {
			return new Promise<void>((resolve, reject) => {
				const interval = setInterval(() => {
					if (result?.requested === true) {
						clearInterval(interval);
						clearTimeout(timeout);
						resolve();
					}
				}, 200);

				const timeout = setTimeout(() => {
					clearInterval(interval);
					reject(new Error('答题超时！'));
				}, (AnswerWrapperHandlerConfig.timeout_seconds + 10) * 1000);
			});
		};

		/** 答题线程， */
		const resolverThread = async () => {
			for (let index = 0; index < results.length; index++) {
				const result = results[index];

				let error: string | undefined;
				let res: ResolverResult | undefined;
				/** 强行关闭 */
				if (this.isClose === true) {
					this.isRunning = false;
					return;
				}

				try {
					/** 检查是否暂停中 */
					if (this.isStop) {
						await waitForContinuate(() => this.isStop);
					}
					/** 等待搜题完毕 */
					await waitForRequested(result);
				} catch (err) {
					// 超时错误
				}

				try {
					if (result.ctx && result.ctx.searchInfos.length !== 0) {
						/** 开始处理 */
						if (typeof this.opts.work === 'object') {
							if (result.ctx.elements.options) {
								/** 使用默认处理器 */

								if (result.ctx.type) {
									const resolver = createDefaultQuestionResolver(
										result.ctx,
										// @ts-ignore work.optionText 跨 E 类型透传
										this.opts.work.optionText
									)[result.ctx.type];
									const handler = this.opts.work.handler;
									res = await resolver(result.ctx.searchInfos, result.ctx.elements.options as HTMLElement[], handler);
								} else {
									error = '题目类型解析失败, 请自行提供解析器, 或者忽略此题。';
								}
							} else {
								error = 'elements.options 为空 ! 使用默认处理器, 必须提供题目选项的选择器。';
							}
						} else {
							/** 使用自定义处理器 */
							const work = this.opts.work;
							res = await work(result.ctx);
						}
					} else {
						error = '搜索不到答案, 请重新运行, 或者忽略此题。';
					}
				} catch (err) {
					error = (err as any)?.message || err;
				}

				result.error = error;

				/** 修改答题结果 */
				result.result = res || { finish: false };
				/** 设置答题完成 */
				result.resolved = true;

				if (options?.enable_debug) {
					console.log(
						'答题完成: ',
						result.ctx?.elements.title
							?.map((t) => t?.innerText)
							.join(', ')
							.slice(0, 20),
						result
					);
				}

				/** 回调 */
				await this.opts.onResultsUpdate?.(result, index, results);
			}
		};

		/**
		 * 搜题和答题分为两个线程
		 */
		/** 多线程搜题 */
		const requestThreadHandler = async () => {
			/** 线程锁 */
			const locks: number[] = [];

			const waitForLock = () => {
				return new Promise<number>((resolve, reject) => {
					const interval = setInterval(() => {
						if (locks.length > 0) {
							const lock = locks.shift();
							if (lock) {
								resolve(lock);
								clearInterval(interval);
								clearTimeout(timeout);
							}
						}
					}, 100);

					const timeout = setTimeout(() => {
						clearInterval(interval);
						reject(new Error('获取线程锁超时！'));
					}, 3 * 60 * 1000);
				});
			};

			const requestThreads: Function[] = [];
			for (let index = 0; index < results.length; index++) {
				requestThreads.push(() => requestThread(index));
			}

			for (let index = 0; index < (this.opts.thread || 1); index++) {
				locks.push(index + 1);
			}
			let requestFinished = 0;

			const promises: Function[] = [];
			for (let index = 0; index < (this.opts.thread || 1); index++) {
				promises.push(async () => {
					try {
						while (requestFinished < results.length && requestThreads.length > 0 && this.isClose === false) {
							const thread = requestThreads.shift();
							if (thread) {
								const lock = await waitForLock();
								await thread();
								requestFinished++;
								locks.push(lock);
							}
						}
					} catch (err) {
						console.error(err);
					}
				});
			}

			await Promise.all(promises.map((f) => f()));
		};

		/** 答题线程 */
		await Promise.all([resolverThread(), requestThreadHandler()]);

		this.isRunning = false;
		return results;
	}

	/** 答题结果处理器 */
	uploadHandler(options: {
		// doWork 的返回值结果
		results: WorkResult<E>[];
		// 提交类型
		type: WorkUploadType;
		/**
		 * 是否上传处理器
		 *
		 * @param  uploadable  是否可以上传
		 * @param finishedRate 完成率
		 */
		callback: (finishedRate: number, uploadable: boolean) => void | Promise<void>;
	}) {
		const { results, type, callback } = options;
		if (type !== 'nomove') {
			let finished = 0;
			for (const result of results) {
				if (result.result?.finish) {
					finished++;
				}
			}
			const rate = results.length === 0 ? 0 : (finished / results.length) * 100;
			if (type === 'force') {
				return callback(rate, true);
			} else {
				return callback(rate, type === 'save' ? false : rate >= parseFloat(type.toString()));
			}
		}
	}
}

export class CustomOCSWorker extends CommonEventEmitter<WorkerEvents> {
	opts: CustomWorkOptions;
	isRunning = false;
	isClose = false;
	isStop = false;

	constructor(opts: CustomWorkOptions) {
		super();
		this.opts = opts;
	}

	/** 启动答题器  */
	async doWork(options?: { enable_debug?: boolean }) {
		this.emit('start');
		this.isRunning = true;

		this.once('close', () => {
			this.isClose = true;
		});

		this.on('stop', () => {
			this.isStop = true;
		});

		this.on('continuate', () => {
			this.isStop = false;
		});

		const questions = await this.opts.questions?.();

		if (options?.enable_debug) {
			console.debug('开始答题', this);
			console.debug('题目数量: ', this.opts.questions.length);
		}
		const results: SimplifyWorkResult[] = [];

		for (let index = 0; index < questions.length; index++) {
			/** 强行关闭 */
			if (this.isClose === true) {
				this.isRunning = false;
				return;
			}
			/** 检查是否暂停中 */
			if (this.isStop) {
				await waitForContinuate(() => this.isStop);
			}

			const question = questions[index];
			results[index] = {
				question: question.text,
				requested: false,
				resolved: false,
				searchInfos: [],
				type: question.type,
				finish: false,
				error: ''
			};

			try {
				const infos = await this.opts.answerer(question.text);
				results[index].searchInfos = infos.map((i) => ({
					name: i.name,
					homepage: i.homepage,
					results: i.results.map((r) => [r.question, r.answer, r.extra_data || {}]),
					error: i.error
				}));
				results[index].requested = true;
				this.opts.onResultsUpdate?.(results[index], index, results);

				try {
					const resolved = await this.opts.resolver(infos);
					results[index].finish = resolved.finish;
					results[index].error = resolved.error;
					results[index].resolved = true;
				} catch (err) {
					results[index].finish = false;
					results[index].error = err instanceof Error ? err.message : String(err);
					results[index].resolved = true;
				}
				this.opts.onResultsUpdate?.(results[index], index, results);
			} catch (err) {
				results[index].requested = true;
				results[index].resolved = false;
				results[index].finish = true;
				results[index].error = err instanceof Error ? err.message : String(err);
				this.opts.onResultsUpdate?.(results[index], index, results);
			}

			await $.sleep(this.opts.period);
		}
	}
}

async function waitForContinuate(isStopping: () => boolean) {
	if (isStopping()) {
		await new Promise<void>((resolve, reject) => {
			const interval = setInterval(() => {
				if (isStopping() === false) {
					clearInterval(interval);
					resolve();
				}
			}, 200);
		});
	}
}
