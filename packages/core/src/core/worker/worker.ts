import { CommonEventEmitter } from '../../interfaces/common';
import { $ } from '../../utils/common';
import { domSearchAll } from '../utils/dom';
import { RawElements, ResolverResult, WorkContext, WorkOptions, WorkResult, WorkUploadType } from './interface';
import { defaultQuestionResolve } from './question.resolver';
import { defaultWorkTypeResolver } from './utils';

type WorkerEvent = {
	/** 答题开始 */
	start: () => void;
	/** 答题结果 */
	done: () => void;
	/** 关闭答题 */
	close: () => void;
	/** 暂停答题 */
	stop: () => void;
	/** 继续答题 */
	continuate: () => void;
};

/**
 * 自动答题器， 传入一些指定的配置， 就可以进行自动答题。
 *
 * @param work      工作器, 传入一个方法可自定义工作器，或者使用默认的工作器，详情： {@link WorkOptions.work}
 * @param answerer  查题器, : 默认是 {@link defaultAnswerWrapperHandler}
 *
 */
export class OCSWorker<E extends RawElements = RawElements> extends CommonEventEmitter<WorkerEvent> {
	opts: WorkOptions<E>;
	isRunning = false;
	isClose = false;
	isStop = false;
	/** 当前搜题序号 */
	requestIndex = 0;
	/** 当前答题序号 */
	resolverIndex = 0;
	/** 总题目数量 */
	totalQuestionCount = 0;
	/** 线程锁 */
	locks: number[] = [];

	constructor(opts: WorkOptions<E>) {
		super();
		this.opts = opts;
	}

	/** 启动答题器  */
	async doWork() {
		// 重置
		this.requestIndex = 0;
		this.resolverIndex = 0;
		this.totalQuestionCount = 0;

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

		/** 寻找题目父节点 */
		const questionRoots: HTMLElement[] | null =
			typeof this.opts.root === 'string' ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;

		this.totalQuestionCount = questionRoots.length;
		/** 线程锁 */
		this.locks = Array(this.totalQuestionCount).fill(1);

		/** 答题结果 */
		const results: WorkResult<E>[] = [];

		if (questionRoots.length === 0) {
			throw new Error('未找到任何题目，答题结束。');
		}

		for (const questionRoot of questionRoots) {
			const ctx: WorkContext<E> = {
				searchInfos: [],
				root: questionRoot,
				elements: domSearchAll<E>(this.opts.elements, questionRoot)
			};

			/** 执行元素搜索钩子 */
			await this.opts.onElementSearched?.(ctx.elements, questionRoot);

			/** 排除掉 null 的元素 */
			ctx.elements.title = ctx.elements.title?.filter(Boolean) as HTMLElement[];
			ctx.elements.options = ctx.elements.options?.filter(Boolean) as HTMLElement[];
			results.push({
				requesting: true,
				resolving: true,
				type: undefined,
				ctx: ctx
			});
		}

		/** 答题处理器 */
		const resolvers: { func: () => Promise<ResolverResult>; index: number }[] = [];

		/** 请求答案的线程 */
		const requestThread = async () => {
			/** 如果拿锁成功 */
			while (this.locks.shift()) {
				const i = this.requestIndex++;
				const ctx = results[i].ctx || ({} as WorkContext<E>);

				/** 强行关闭 */
				if (this.isClose === true) {
					this.isRunning = false;
					return results;
				}

				let type;
				let error: string | undefined;

				try {
					/** 检查是否暂停中 */
					if (this.isStop) {
						await waitForContinuate(() => this.isStop);
					}

					/** 获取题目类型 */
					if (typeof this.opts.work === 'object') {
						type =
							this.opts.work.type === undefined
								? // 使用默认解析器
								  defaultWorkTypeResolver(ctx)
								: // 自定义解析器
								typeof this.opts.work.type === 'string'
								? this.opts.work.type
								: this.opts.work.type(ctx);
					}

					/** 查找答案 */
					const searchInfos = await this.opts.answerer(ctx.elements, type, ctx);
					let resultPromise: { (): Promise<ResolverResult> } | undefined;

					// 答案为 undefined 的情况， 需要赋值给一个空字符串，因为可能传回的题目中带有其他提示信息，或者题目里包含答案。
					searchInfos.forEach((info) => {
						info.results = info.results.map((ans) => {
							ans.answer = ans.answer ? ans.answer : '';
							return ans;
						});
					});

					ctx.searchInfos = searchInfos;

					if (searchInfos.length === 0) {
						error = '搜索不到答案, 请重新运行, 或者忽略此题。';
					}

					/** 开始处理 */
					if (typeof this.opts.work === 'object') {
						if (ctx.elements.options) {
							/** 使用默认处理器 */

							if (type) {
								const resolver = defaultQuestionResolve(ctx)[type];
								const handler = this.opts.work.handler;
								resultPromise = async () => await resolver(searchInfos, ctx.elements.options as HTMLElement[], handler);
							} else {
								error = '题目类型解析失败, 请自行提供解析器, 或者忽略此题。';
							}
						} else {
							error = 'elements.options 为空 ! 使用默认处理器, 必须提供题目选项的选择器。';
						}
					} else {
						/** 使用自定义处理器 */
						const work = this.opts.work;
						resultPromise = async () => await work(ctx);
					}

					if (resultPromise) {
						resolvers.push({
							func: resultPromise,
							index: i
						});
					} else {
						resolvers.push({
							func: async () => ({ finish: false }),
							index: i
						});
					}
				} catch (err) {
					resolvers.push({
						func: async () => ({ finish: false }),
						index: i
					});

					if (err instanceof Error) {
						error = err.message;
					} else {
						error = String(err);
					}
				}

				const currentResult = {
					requesting: false,
					resolving: true,
					ctx: ctx,
					error: error,
					type: type
				};

				results[i] = currentResult;

				await this.opts.onResultsUpdate?.(results, currentResult);

				/** 间隔 */
				await $.sleep((this.opts.requestPeriod ?? 3) * 1000);
			}
		};

		/** 答题选择器线程， */
		const resolverThread = new Promise<void>((resolve) => {
			const start = async () => {
				/** 强行关闭 */
				if (this.isClose === true) {
					this.isRunning = false;
					return;
				}
				/** 检查是否暂停中 */
				if (this.isStop) {
					await waitForContinuate(() => this.isStop);
				}

				if (this.resolverIndex < this.totalQuestionCount) {
					const resolver = resolvers.shift();

					/** 如果存在答题处理 */
					if (resolver) {
						this.resolverIndex++;
						try {
							const result = await resolver.func();
							/** 修改答题结果 */
							results[resolver.index].result = result;
							/** 设置答题完成 */
							results[resolver.index].resolving = false;
							/** 回调 */
							await this.opts.onResultsUpdate?.(results, results[resolver.index]);
							await this.opts.onResolveUpdate?.(results[resolver.index]);
						} catch (e) {
							results[resolver.index].result = { finish: false };
							results[resolver.index].resolving = false;
							results[resolver.index].error = (e as any)?.message || e;
						}
						loop();
					} else {
						/** 继续等待，直到处理数量等于题目数量 */
						loop();
					}
				} else {
					resolve();
				}
			};

			const loop = async () => {
				setTimeout(start, (this.opts.resolvePeriod ?? 0) * 1000);
			};

			start();
		});

		/**
		 * 搜题和答题分为两个线程
		 */
		await Promise.all([
			/** 多线程请求并发 */
			...Array(Math.max(this.opts.thread || 1, 1))
				.fill('')
				.map(() => requestThread()),
			/** 答题选择器线程 */
			resolverThread
		]);

		this.isRunning = false;
		return results;
	}

	/** 答题结果处理器 */
	async uploadHandler(options: {
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
		let finished = 0;
		for (const result of results) {
			if (result.result?.finish) {
				finished++;
			}
		}
		const rate = results.length === 0 ? 0 : (finished / results.length) * 100;
		if (type !== 'nomove') {
			if (type === 'force') {
				await callback(rate, true);
			} else {
				await callback(rate, type === 'save' ? false : rate >= parseFloat(type.toString()));
			}
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
