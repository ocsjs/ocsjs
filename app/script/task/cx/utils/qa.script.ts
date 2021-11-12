import { ElementHandle, Frame, JSHandle, SerializableOrJSHandle } from "puppeteer-core";
import { AxiosPost } from "../../../../electron/axios";
import { BaseTask, ScriptSetting } from "../../../../types";
import { StoreGet } from "../../../../types/setting";
import https from "https";
import similarity from "string-similarity";
import { sleep } from "../../../common/utils";
import { logger } from "../../../../types/logger";
import { Task } from "../../../../electron/task";
import { log } from "console";
const { info, error } = logger("qa");

export interface AnswerType {
    success: number;
    question: string;
    answer: string;
}

/**
 * 自动答题脚本
 * @param task 任务
 * @param frame 窗体
 * @param setting 设置
 */
export async function QAScript(task: Task, frame: Frame, setting: ScriptSetting["script"]["cx"]["study"]["qa"]) {
    if (!StoreGet("setting").script.account.queryToken) {
        task.error("未设置查题码，不能答题，即将跳转下个任务");
        await sleep(3000);
        return;
    }
    const qaHandler = new CXQAHandler({
        questionDivSelector: ".TiMu",
        titleDivSelector: ".Zy_TItle > .clearfix > p > span",
        choice: {
            divSelector: ".Zy_ulTop",
            textSelector: "li",
            clickableSelector: "li input",
        },
        judgment: {
            divSelector: ".Zy_ulBottom",
            clickableSelector: "li input",
        },
        completion: {
            divSelector: ".Zy_ulTk",
        },
        async onError() {
            task.process("搜索不到答案，即将切换下一题");
        },
        async onSave() {
            await frame.evaluate("if(window.noSubmit)window.noSubmit()");
        },
        async onSuccess() {
            await frame.evaluate(() => {
                return new Promise<void>((resolve, reject) => {
                    let w = window as any;
                    if (w.btnBlueSubmit) w.btnBlueSubmit();
                    setTimeout(() => {
                        if (w.form1submit) w.form1submit();
                        resolve();
                    }, 3000);
                });
            });
        },
    });

    await qaHandler.handle({
        task,
        frame,
        autoReport: setting.autoReport,
        passRate: setting.passRate,
    });
}

// 分割答案
function sliptAnswer(str: string) {
    let spl = str.split(/ |\s|===|---|#|&|;/).filter((s) => !!s);
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
    { optionDivSelector, optionTextSelector, optionClickableSelector, success, error }: { optionDivSelector: string; optionTextSelector: string; optionClickableSelector: string } & QACallback
) {
    const { question, answer } = answerType;

    const optionsDiv = await questionDiv.$(optionDivSelector);
    // 获取选项
    const options = await frame.evaluate(
        (div: HTMLDivElement, optionSelector: string) => {
            console.log({ div, optionSelector, li: div.querySelectorAll(optionSelector), res: Array.from(div.querySelectorAll(optionSelector)).map((li) => (li as any)?.innerText) });

            return Array.from(div.querySelectorAll(optionSelector)).map((li) => (li as any)?.innerText);
        },
        optionsDiv,
        optionTextSelector
    );
    // 分割答案
    const answers = sliptAnswer(answer);

    const bestMatchIndexes = answers.map((a) => similarity.findBestMatch(a, options).bestMatchIndex);
    console.log({ answerType, answers, options, bestMatchIndexes });
    if (bestMatchIndexes.length !== 0) {
        success?.();
        for (let i of bestMatchIndexes) {
            await frame.evaluate(
                (div, clickable, index) => {
                    div.querySelectorAll(clickable)[parseInt(index)]?.click();
                },
                optionsDiv,
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
export async function JudgmentHandler(
    { question, answer }: AnswerType,
    frame: Frame,
    questionDiv: ElementHandle<Element>,
    { success, error, judgmentDivSelector, clickableSelector }: { judgmentDivSelector: string; clickableSelector: string } & QACallback
) {
    const rightWord = "是|对|正确|√|对的|是的|正确的";
    const wrongWord = "否|错|错误|×|错的|不正确的|不正确|不是|不是的";
    const { target } = similarity.findBestMatch(answer, rightWord.split("|").concat(wrongWord.split("|"))).bestMatch;
    console.log("判断题", { question, answer }, target);

    const optionsDiv = await questionDiv.$(judgmentDivSelector);
    // 开始选择
    if (RegExp(rightWord).test(target)) {
        await frame.evaluate(
            (div, clickable) => {
                div.querySelectorAll(clickable)[0]?.click();
            },
            optionsDiv,
            clickableSelector
        );
    } else if (RegExp(wrongWord).test(target)) {
        await frame.evaluate(
            (div, clickable) => {
                div.querySelectorAll(clickable)[1]?.click();
            },
            optionsDiv,
            clickableSelector
        );
    }
    if (RegExp(rightWord).test(target) || RegExp(wrongWord).test(target)) {
        success?.();
    } else {
        error?.();
    }

    info({ type: "判断题", question, answer, ratings: target });
}

/**
 *
 * 填空处理器
 */
export async function completionHandler({ question, answer }: AnswerType, frame: Frame, questionDiv: ElementHandle<Element>, { completionDivSelector, success, error }: { completionDivSelector: string } & QACallback) {
    const ans = sliptAnswer(answer);

    console.log("填空题", { question, answer }, ans);

    const completionDiv = await questionDiv.$(completionDivSelector);

    const finish = await frame.evaluate(
        (div: HTMLDivElement, answers) => {
            let textareas = div.querySelectorAll("textarea");
            if (textareas.length === answers.length) {
                for (let i = 0; i < textareas.length; i++) {
                    textareas[i].value = answers[i] || "不知道";
                }
                return true;
            }
            return false;
        },
        completionDiv,
        ans
    );
    if (finish) {
        success?.();
    } else {
        error?.();
    }
    info({ type: "填空题", question, answer, completions: ans });
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

export interface CXQAHandlerType {
    questionDivSelector: string;
    titleDivSelector: string;

    choice: {
        divSelector: string;
        clickableSelector: string;
        textSelector: string;
    };

    judgment: {
        divSelector: string;
        clickableSelector: string;
    };
    completion: {
        divSelector: string;
    };
    // 答题错误
    onError: () => Promise<void>;
    // 答题成功
    onSuccess: () => Promise<void>;
    // 保存答案
    onSave: () => Promise<void>;
}

export interface HandlerOptions {
    task: Task;
    frame: Frame;
    autoReport: boolean;
    passRate: number;
}

export class CXQAHandler implements CXQAHandlerType {
    questionDivSelector: string;
    titleDivSelector: string;
    choice: { divSelector: string; clickableSelector: string; textSelector: string };
    judgment: { divSelector: string; clickableSelector: string };
    completion: { divSelector: string };
    // 答题错误
    onError: () => Promise<void>;
    // 答题成功
    onSuccess: () => Promise<void>;
    // 保存答案
    onSave: () => Promise<void>;

    constructor({ questionDivSelector, titleDivSelector, choice, judgment, completion, onError, onSave, onSuccess }: CXQAHandlerType) {
        this.questionDivSelector = questionDivSelector;
        this.titleDivSelector = titleDivSelector;
        this.choice = choice;
        this.judgment = judgment;
        this.completion = completion;
        this.onError = onError;
        this.onSave = onSave;
        this.onSuccess = onSuccess;
    }

    async handle({ task, frame, autoReport, passRate }: HandlerOptions) {
        const Questions = await frame.$$(this.questionDivSelector);

        if (Questions.length !== 0) {
            task.process(`正在自动答题,一共${Questions.length}个题目`);

            // 完成的题目数量
            let finishCount = 0;

            for (const question of Questions) {
                try {
                    const title = await frame.evaluate((div, selector) => (div.querySelector(selector) as any)?.innerText || undefined, question, this.titleDivSelector);
                    const choiceDiv = await frame.evaluate((div, selector) => div.querySelector(selector), question, this.choice.divSelector);
                    const judgmentDiv = await frame.evaluate((div, selector) => div.querySelector(selector), question, this.judgment.divSelector);
                    const completionDiv = await frame.evaluate((div, selector) => div.querySelector(selector), question, this.completion.divSelector);

                    if (!title) {
                        continue;
                    }
                    const answerType = await queryAnswer(title);

                    // 匹配答案
                    if (answerType.success) {
                        if (choiceDiv) {
                            const { divSelector, clickableSelector, textSelector } = this.choice;
                            await ChoiceHandler(answerType, frame, question, {
                                optionDivSelector: divSelector,
                                optionClickableSelector: clickableSelector,
                                optionTextSelector: textSelector,
                                success() {
                                    finishCount++;
                                },
                            });
                        } else if (judgmentDiv) {
                            const { divSelector, clickableSelector } = this.judgment;
                            await JudgmentHandler(answerType, frame, question, {
                                judgmentDivSelector: divSelector,
                                clickableSelector: clickableSelector,
                                success() {
                                    finishCount++;
                                },
                            });
                        } else if (completionDiv) {
                            const { divSelector } = this.completion;
                            await completionHandler(answerType, frame, question, {
                                completionDivSelector: divSelector,
                                success() {
                                    finishCount++;
                                },
                            });
                        } else {
                            info("不支持的题目类型");
                        }
                    } else {
                        error(answerType);
                        task.error(answerType.answer);
                    }
                } catch (err) {
                    console.log(err);

                    this.onError();
                    error(err);
                }

                await sleep(3000);
            }

            // 如果超过通过率，则自动提交，否则暂时保存
            if (Questions.length !== 0 && autoReport) {
                info("通过率:", passRate, "结果:", (finishCount / Questions.length) * 100);

                if ((finishCount / Questions.length) * 100 >= passRate) {
                    await this.onSuccess();
                } else {
                    await this.onSave();
                }
            }
        }
    }
}
