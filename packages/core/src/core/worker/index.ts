import { domSearchAll, sleep } from "../utils";

import { RawElements, ResolverResult, WorkContext, WorkOptions, WorkResult } from "./interface";
import { defaultQuestionResolve } from "./question.resolver";
import { defaultWorkTypeResolver } from "./utils";

export class OCSWorker<E extends RawElements = RawElements> {
    /**
     * 自动答题器， 传入一些指定的配置， 就可以进行自动答题。
     *
     * @param work      工作器, 传入一个方法可自定义工作器，或者使用默认的工作器，详情： {@link WorkOptions.work}
     * @param answerer  查题器, : 默认是 {@link defaultAnswerWrapperHandler}
     *
     */
    constructor(public opts: WorkOptions<E>) {}

    currentContext?: WorkContext<E>;

    /** 启动答题器  */
    async doWork() {
        const results: WorkResult<E>[] = [];
        let result: ResolverResult;

        let type;
        let error: Error | undefined = undefined;
        /** 寻找父节点 */
        const root: HTMLElement[] | null =
            typeof this.opts.root === "string" ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;

        /** 遍历并执行 */
        for (const el of root) {
            const time = Date.now();
            result = { finish: false };
            error = undefined;
            type = undefined;

            try {
                /**  dom 搜索 */
                const elements: WorkContext<E>["elements"] = domSearchAll<E>(this.opts.elements, el);

                this.opts.onElementSearched?.(elements);

                /** 改变上下文 */
                this.currentContext = { searchResults: [], root: el, elements };

                /** 获取题目类型 */
                if (typeof this.opts.work === "object") {
                    type =
                        this.opts.work.type === undefined
                            ? // 使用默认解析器
                              defaultWorkTypeResolver(this.currentContext)
                            : // 自定义解析器
                            typeof this.opts.work.type === "string"
                            ? this.opts.work.type
                            : this.opts.work.type(this.currentContext);
                }

                /** 查找题目 */
                let searchResults = await this.doAnswer(elements, type);

                if (!searchResults) {
                    throw new Error("答案获取失败, 请重新运行, 或者忽略此题。");
                } else {
                    /** 筛选出有效的答案 */
                    const validResults = searchResults
                        .map((res) => res.answers.map((ans) => ans.answer))
                        .flat()
                        .filter((ans) => ans);

                    // 答案为 undefined 的情况， 需要赋值给一个空字符串
                    searchResults.forEach((res) => {
                        res.answers = res.answers.map((ans) => {
                            ans.answer = ans.answer ? ans.answer : "";
                            return ans;
                        });
                    });

                    /** 改变上下文 */
                    this.currentContext = { searchResults, root: el, elements };

                    if (searchResults.length === 0 || validResults.length === 0) {
                        throw new Error("搜索不到答案, 请重新运行, 或者忽略此题。");
                    }
                }

                /** 开始处理 */
                if (typeof this.opts.work === "object") {
                    if (elements.options) {
                        /** 使用默认处理器 */

                        if (type) {
                            const resolver = defaultQuestionResolve(this.currentContext)[type];
                            result = resolver(searchResults, elements.options, this.opts.work.handler);
                        } else {
                            throw new Error("题目类型解析失败, 请自行提供解析器, 或者忽略此题。");
                        }
                    } else {
                        throw new Error("elements.options 为空 ! 使用默认处理器, 必须提供题目选项的选择器。");
                    }
                } else {
                    /** 使用自定义处理器 */
                    result = this.opts.work(this.currentContext);
                }
            } catch (e) {
                error = e as any;
                console.error(e);
                this.opts.onError?.(e as any, this.currentContext);
                if (this.opts.stopWhenError) {
                    return results;
                }
            }

            const res = {
                time,
                ctx: this.currentContext,
                result,
                consume: Date.now() - time,
                error,
                type,
            };

            /** 监听答题结果 */
            this.opts.onResult?.(res);
            // 保存结果
            results.push(res);

            /** 间隔 */
            const { period = 3 * 1000 } = this.opts;
            await sleep(period);
        }

        return results;
    }

    /** 获取答案 */
    private async doAnswer(elements: WorkContext<E>["elements"], type?: string) {
        let { timeout = 60 * 1000, retry = 2 } = this.opts;
        /** 解析选项，可以自定义查题器 */

        var answer = async () => {
            return await Promise.race([
                this.opts.answerer(elements, type),
                /** 最长请求时间 */
                sleep(timeout),
            ]);
        };

        let answers = await answer();
        if (!answers) {
            /** 重试获取答案 */
            while (retry) {
                answers = await answer();
                retry--;
            }
        }

        return answers;
    }

    /** 答题结果处理器 */
    async uploadHandler(options: {
        // doWork 的返回值结果
        results: WorkResult<E>[];
        // 上传百分比
        uploadRate: string;
        /**
         * 是否上传处理器
         *
         * @param  uploadable  是否可以上传
         * @param finishedRate 完成率
         */
        callback: (finishedRate: number, uploadable: boolean) => void | Promise<void>;
    }) {
        const { results, uploadRate, callback } = options;
        let finished = 0;
        for (const result of results) {
            if (result.result?.finish) {
                finished++;
            }
        }
        let rate = results.length === 0 ? 0 : (finished / results.length) * 100;
        if (uploadRate !== "nomove") {
            await callback(rate, uploadRate === "save" ? false : rate >= parseFloat(uploadRate));
        }
    }
}
