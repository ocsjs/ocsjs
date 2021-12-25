import { ElementHandle, Frame } from "puppeteer-core";
import { AxiosPost } from "../../electron/axios";
import { StoreGet } from "../../types/setting";
import { sleep } from "../common/utils";
import similarity from "string-similarity";
import https from "https";
import { Task } from "../../electron/task";
import { Logger } from "../../electron/logger";
const logger = Logger.of("qa");

export interface AnswerType {
    success: number;
    question: string;
    answer: string;
}

// 分割答案
function sliptAnswer(str: string) {
    let spl = str.split(/\n|\s|===|---|#|&|;/).filter((s) => !!s);
    if (spl.length > 4) {
        return [];
    } else {
        return spl;
    }
}

export interface QACallback {
    success?: () => any;
    error?: () => any;
}

/**
 * 查题
 * @param question 题目
 * @returns
 */
export async function queryAnswer(question: string): Promise<AnswerType> {
    // 查题
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const { data: res } = await AxiosPost({
        url: "https://wk.enncy.cn/chati",
        httpsAgent: agent,
        data: {
            chatiId: StoreGet("setting").script.account.queryToken,
            question,
        },
    });
    console.log("queryAnswer", {
        chatiId: StoreGet("setting").script.account.queryToken,
        question,
        res,
    });

    const { success, question: q, answer } = res;
    return { success, question: q, answer };
}

export interface QAHandlerType {
    questionDivSelector: string;
    titleDivSelector: string;
    typeResolver: (questionDiv: ElementHandle<HTMLDivElement>) => Promise<"choice" | "judgment" | "completion" | undefined>;
    titleTransform: (title: string) => string;
    choice: {
        clickableSelector: string;
        textSelector: string;
    };

    judgment: {
        clickableSelector: string;
    };
    completion: {};
    // 答题错误
    onError: () => Promise<void>;
    // 答题成功
    onSuccess: (rate: number) => Promise<void>;
    // 保存答案
    onSave: (rate: number) => Promise<void>;
}

export interface HandlerOptions {
    task: Task;
    frame: Frame;
    autoReport: boolean;
    passRate: number;
}

export class QAHandler implements QAHandlerType {
    questionDivSelector: string;
    titleDivSelector: string;
    // 题目类型处理器
    typeResolver: (questionDiv: ElementHandle<HTMLDivElement>) => Promise<"choice" | "judgment" | "completion" | undefined>;
    // 标题处理器
    titleTransform: (title: string) => string;
    choice: { clickableSelector: string; textSelector: string };
    judgment: { clickableSelector: string };
    completion: {};
    // 答题错误
    onError: () => Promise<void>;
    // 答题成功
    onSuccess: (rate: number) => Promise<void>;
    // 保存答案
    onSave: (rate: number) => Promise<void>;

    constructor({ questionDivSelector, titleDivSelector, choice, judgment, completion, onError, onSave, onSuccess, typeResolver, titleTransform }: QAHandlerType) {
        this.questionDivSelector = questionDivSelector;
        this.titleDivSelector = titleDivSelector;
        this.choice = choice;
        this.judgment = judgment;
        this.completion = completion;
        this.onError = onError;
        this.onSave = onSave;
        this.onSuccess = onSuccess;
        this.typeResolver = typeResolver;
        this.titleTransform = titleTransform;
    }

    async handle({ task, frame, autoReport, passRate }: HandlerOptions) {
        const Questions = await frame.$$(this.questionDivSelector);

        if (Questions.length !== 0) {

            if (!StoreGet("setting").script.account.queryToken) {
                task.error("未设置查题码，不能答题，即将跳转下个任务");
                await sleep(3000);
                return;
            }

            task.process(`正在自动答题,一共${Questions.length}个题目`);

            // 完成的题目数量
            let finishCount = 0;

            for (const question of Questions) {
                try {
                    let title: string = await frame.evaluate((div, selector) => (div.querySelector(selector) as any)?.innerText || undefined, question, this.titleDivSelector);
                    const type = await this.typeResolver(question);
                    if (!title) {
                        continue;
                    }
                    // 去掉冗余字段

                    title = this.titleTransform(title);
                    task.process(`【${type === "choice" ? "选择题" : type === "judgment" ? "判断题" : type === "completion" ? "填空题" : "未知题型"}】:` + title);

                    const answerType = await queryAnswer(title);

                    // 页面上的输出样式
                    let success = "background-color: #f6ffed; border: 1px solid #b7eb8f;";
                    let err = "background-color: #fff1f0;border: 1px solid #ffa39e;";
                    // 页面输出
                    const PageAlert = async (style: string) => {
                        await frame.evaluate(
                            (div, selector, question, answer, style) => {
                                let qaDiv = document.createElement("div");
                                qaDiv.setAttribute("style", style + ";padding:2px;font-size:12px;line-height: 16px;");
                                let q = document.createElement("div");
                                q.innerHTML = "<span style='font-weight:bold'>题目</span> ：" + question;
                                let a = document.createElement("div");
                                a.innerHTML = "<span style='font-weight:bold'>回答</span> ：" + answer;
                                let node = div.querySelector(selector);

                                if (node) {
                                    qaDiv.appendChild(q);
                                    qaDiv.appendChild(a);
                                    node.appendChild(qaDiv);
                                }
                            },
                            question,
                            this.titleDivSelector,
                            answerType.question,
                            answerType.answer,
                            style
                        );
                    };

                    // 匹配答案
                    if (answerType.success) {
                        await PageAlert(success);
                        // 选择题
                        if (type === "choice") {
                            const { clickableSelector, textSelector } = this.choice;
                            await ChoiceHandler(answerType, frame, question, {
                                optionClickableSelector: clickableSelector,
                                optionTextSelector: textSelector,
                                success() {
                                    finishCount++;
                                },
                            });
                        } else if (type === "judgment") {
                            // 判断题
                            const { clickableSelector } = this.judgment;
                            await JudgmentHandler(answerType, frame, question, {
                                clickableSelector: clickableSelector,
                                success() {
                                    finishCount++;
                                },
                            });
                        } else if (type === "completion") {
                            // 填空题
                            await completionHandler(answerType, frame, question, {
                                success() {
                                    task.process("选择题完成");
                                    finishCount++;
                                },
                                error() {
                                    task.error("选择题未能完成");
                                },
                            });
                        } else {
                            logger.info("不支持的题目类型");
                        }
                    } else {
                        await PageAlert(err);
                        console.log(answerType);
                        logger.error(answerType);
                        task.error(answerType.answer);
                    }
                } catch (err) {
                    console.log(err);
                    this.onError();
                    logger.error(err);
                }

                await sleep(3000);
            }

            // 如果超过通过率，则自动提交，否则暂时保存
            if (Questions.length !== 0 && autoReport) {
                let rate = (finishCount / Questions.length) * 100;
                logger.info("通过率:", passRate, "结果:", rate);

                if (rate >= passRate) {
                    await this.onSuccess(parseInt(rate.toFixed(2)));
                } else {
                    await this.onSave(parseInt(rate.toFixed(2)));
                }
            }
        }
    }
}

/**
 * 选择题处理器
 * @param answerType 答案选项
 * @param frame 执行上下文
 * @param params
 *
 * optionDivSelector 选项div元素
 * optionTextSelector 每个选项的选择器
 * optionClickableSelector 可点击选项的选择器
 *
 */
export async function ChoiceHandler(
    answerType: AnswerType,
    frame: Frame,
    questionDiv: ElementHandle<Element>,
    { optionTextSelector, optionClickableSelector, success, error }: { optionTextSelector: string; optionClickableSelector: string } & QACallback
) {
    const { question, answer } = answerType;

    // 获取选项
    const options = await frame.evaluate(
        (div: HTMLDivElement, optionSelector: string) => {
            console.log({ div, optionSelector, li: div.querySelectorAll(optionSelector), res: Array.from(div.querySelectorAll(optionSelector)).map((li) => (li as any)?.innerText) });

            return Array.from(div.querySelectorAll(optionSelector)).map((li) => (li as any)?.innerText);
        },
        questionDiv,
        optionTextSelector
    );

    let answers;
    if (/^[A-F]+$/.test(answer)) {
        // 如果直接给出答案,例如 ADC，则答案为对应选择: A:xxx , D:xxx , C:xxx，再传入进行判断
        answers = answer.split("").map((char) => options[char.charCodeAt(0) - "A".charCodeAt(0)]);
    } else {
        // 分割答案
        answers = sliptAnswer(answer);
    }

    const bestMatchIndexes = answers.map((a) => similarity.findBestMatch(a, options).bestMatchIndex);
    console.log({ answerType, answers, options, bestMatchIndexes });
    if (bestMatchIndexes.length !== 0) {
        success?.();
        for (let i of Array.from(new Set(bestMatchIndexes))) {
            await sleep(1000);
            await frame.evaluate(
                (div, clickable, index) => {
                    div.querySelectorAll(clickable)[parseInt(index)]?.click();
                },
                questionDiv,
                optionClickableSelector,
                i
            );
        }
    } else {
        error?.();
    }
}

/**
 *
 * 判断题的处理器
 */
export async function JudgmentHandler({ question, answer }: AnswerType, frame: Frame, questionDiv: ElementHandle<Element>, { success, error, clickableSelector }: { clickableSelector: string } & QACallback) {
    const rightWord = "是|对|正确|√|对的|是的|正确的|true|yes|YES|Yes";
    const wrongWord = "否|错|错误|×|错的|不正确的|不正确|不是|不是的|false|no|NO|No";
    const { target } = similarity.findBestMatch(answer, rightWord.split("|").concat(wrongWord.split("|"))).bestMatch;
    console.log("判断题", { question, answer }, target);

    // 开始选择
    if (RegExp(rightWord).test(target)) {
        await frame.evaluate(
            (div, clickable) => {
                div.querySelectorAll(clickable)[0]?.click();
            },
            questionDiv,
            clickableSelector
        );
    } else if (RegExp(wrongWord).test(target)) {
        await frame.evaluate(
            (div, clickable) => {
                div.querySelectorAll(clickable)[1]?.click();
            },
            questionDiv,
            clickableSelector
        );
    }
    if (RegExp(rightWord).test(target) || RegExp(wrongWord).test(target)) {
        success?.();
    } else {
        error?.();
    }

    logger.info(JSON.stringify({ type: "判断题", question, answer, ratings: target }));
}

/**
 *
 * 填空处理器
 */
export async function completionHandler({ question, answer }: AnswerType, frame: Frame, questionDiv: ElementHandle<Element>, { success, error }: QACallback) {
    const ans = sliptAnswer(answer);

    console.log("填空题", { question, answer }, ans);

    const finish = await frame.evaluate(
        (div: HTMLDivElement, answers) => {
            let iframes = Array.from(div.querySelectorAll("iframe"));
            let textareas = Array.from(div.querySelectorAll("textarea"));
            if (textareas.length === answers.length) {
                for (let i = 0; i < textareas.length; i++) {
                    textareas[i].value = answers[i] || "不知道";
                    let frame = iframes[i];
                    if (frame && frame.contentWindow) {
                        frame.contentWindow.document.body.innerHTML = "<p>" + (answers[i] || "不知道") + "</p>";
                    }
                }
                return true;
            }
            return false;
        },
        questionDiv,
        ans
    );
    if (finish) {
        success?.();
    } else {
        error?.();
    }
    logger.info(JSON.stringify({ type: "填空题", question, answer, completions: ans }));
}
