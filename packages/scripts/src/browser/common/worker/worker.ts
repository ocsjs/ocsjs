import { getItem } from "../store";
import { domSearch, sleep } from "../utils";
import { AnswererType, AnswererWrapper, Elements, WorkContext, WorkOptions, WorkResult } from "./interface";
import { defaultAnswerWrapperHandler, defaultQuestionResolve } from "./question.resolver";
import { defaultWorkTypeResolver } from "./utils";

/**
 * 自动答题器
 *
 * @param work      工作器, 传入一个方法可自定义工作器，或者使用默认的工作器，详情： {@link WorkOptions.work}
 * @param answerer  查题器, : 默认是 {@link defaultAnswerWrapperHandler}
 *
 */
export class Worker {
    currentContext?: WorkContext;

    constructor(public opts: WorkOptions) {}

    /** 启动答题器  */
    async doWork() {
        const results: WorkResult[] = [];
        let result;
        let error: Error | undefined = undefined;
        /** 寻找父节点 */
        const root: HTMLElement[] | null =
            typeof this.opts.root === "string" ? Array.from(document.querySelectorAll(this.opts.root)) : this.opts.root;

        /** 遍历并执行 */
        for (const el of root) {
            const time = Date.now();
            result = undefined;
            error = undefined;
            try {
                /**  dom 搜索 */
                const elements: WorkContext["elements"] = domSearch(el, this.opts.elements);

                /** 查找题目 */
                const answers = await this.doAnswer(elements);
                if (!answers || answers.length === 0) {
                    throw new Error(
                        answers?.length === 0
                            ? "答案获取为空, 请重试获取忽略此题"
                            : "答案获取失败, 请重新运行, 或者忽略此题。"
                    );
                }

                /** 改变上下文 */
                this.currentContext = { answers, root: el, elements };

                /** 开始处理 */
                if (typeof this.opts.work === "object") {
                    if (elements.options) {
                        /** 使用默认处理器 */
                        const type = this.opts.work.type
                            ? typeof this.opts.work.type === "string"
                                ? this.opts.work.type
                                : this.opts.work.type(this.currentContext)
                            : defaultWorkTypeResolver(this.currentContext);
                        if (type) {
                            console.log("type", type);

                            const resolver = defaultQuestionResolve[type];
                            result = resolver(answers, elements.options, this.opts.work.handler);
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
                this.opts.onError?.(e as any, this.currentContext);
                throw new Error(e as any);
                // if (this.opts.stopWhenError) {
                //     return results;
                // }
            }

            const res = {
                time,
                ctx: this.currentContext,
                result,
                consume: Date.now() - time,
                error: error,
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
    private async doAnswer(elements: WorkContext["elements"]) {
        let { timeout = 60 * 1000, retry = 2 } = this.opts;
        /** 解析选项，可以自定义查题器 */
        const answerer: AnswererType =
            typeof this.opts.answerer === "string" && this.opts.answerer === "default"
                ? (elements: Elements<HTMLElement[]>) =>
                      defaultAnswerWrapperHandler(
                          elements,
                          JSON.parse(getItem("setting.answererWrappers")) as AnswererWrapper[]
                      )
                : this.opts.answerer;

        var answer = async () => {
            return await Promise.race([
                answerer(elements),
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
}
