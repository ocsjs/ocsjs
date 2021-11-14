import { WaitForScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { debounce } from "lodash";
import { Target } from "puppeteer-core";
import { Task } from "../../../electron/task";

import { ScriptTask } from "../../../electron/task/script.task";
import { Course } from "../../../types/script/course";
import { StoreGet } from "../../../types/setting";
import { sleep } from "../../common/utils";
import { LoginScript } from "../../login/types";
import { waitForNavigation, waitForClickAndNavigation } from "../utils";
import { CXQAHandler } from "./utils/qa.script";

const debouncedWork = debounce(CXWorkScript, 10000);
const debouncedExam = debounce(CXExamScript, 10000);

/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function CXWork(course: Course): ScriptTask<void> {
    return ScriptTask.createScript({
        name: "超星作业及考试任务",
        target: async function ({ task, script }) {
            return new Promise(async (resolve, reject) => {
                const waitFor = new WaitForScript(script);
                task.process("开始做作业");
                if (course.url) await waitForNavigation(script, course.url);
                else if (course.selector) {
                    await waitForClickAndNavigation(script, course.selector);
                } else {
                    throw new Error("脚本运行失败: 课程链接或课程元素为空，请重新获取课程!");
                }
                await waitFor.nextTick("requestfinished");
                // 自动进入作业界面
                await script.page.goto(script.page.url().replace(/pageHeader=\d+/, "pageHeader=8"));

                await waitFor.nextTick("requestfinished");
                // // 进入章节列表

                script.browser.on("targetcreated", async (target: Target) => {
                    if (RegExp("mooc2/work/dowork").test(target.url())) {
                        task.process("做作业中");
                        await debouncedWork(task, script);
                    } else if (RegExp("exam/test/reVersionTestStartNew").test(target.url())) {
                        task.process("考试中");
                        await debouncedExam(task, script);
                    }

                    const page = await target.page();

                    if (page) {
                        script.page = page;
                        page.on("requestfinished", async (req) => {
                            if (RegExp("mooc2/work/dowork").test(req.url())) {
                                task.process("做作业中");
                                await debouncedWork(task, script);
                            } else if (RegExp("exam/test/reVersionTestStartNew").test(req.url())) {
                                task.process("考试中");
                                await debouncedExam(task, script);
                            }
                        });
                    }
                });

                task.process("请自行打开作业或者考试页面，脚本会自动运行。");
            });
        },
    });
}

export async function CXWorkScript(task: Task, script: LoginScript) {
    console.log("CXWorkScript");
    const waitFor = new WaitForScript(script);

    await waitFor.nextTick("requestfinished");

    if (!StoreGet("setting").script.account.queryToken) {
        task.error("未设置查题码，不能答题，即将跳转下个任务");
        await sleep(3000);
        return;
    }
    const qaHandler = new CXQAHandler({
        questionDivSelector: ".questionLi",
        titleDivSelector: "h3 > span:not(.colorShallow)",
        choice: {
            textSelector: ".answer_p",
            clickableSelector: ".answerBg",
        },
        judgment: {
            clickableSelector: ".answerBg",
        },
        completion: {},
        typeResolver: async (question) => {
            const frame = script.page.mainFrame();
            const choiceDiv = await frame.evaluate((div) => div.querySelector(`[qtype="0"],[qtype="1"]`), question);
            const judgmentDiv = await frame.evaluate((div) => div.querySelector(`[qtype="3"]`), question);
            const completionDiv = await frame.evaluate((div) => div.querySelector(".textDIV"), question);
            return choiceDiv ? "choice" : judgmentDiv ? "judgment" : completionDiv ? "completion" : undefined;
        },
        async onError() {
            task.process("搜索不到答案，即将切换下一题");
        },
        async onSave(rate: number) {
            task.process("作业已完成,题目完成率(" + rate + "%)，请自行检查，并手动提交。请自行打开其他作业或者考试页面，脚本会自动运行。");
        },
        async onSuccess(rate: number) {
            task.process("作业已完成,题目完成率(" + rate + "%)，请自行检查，并手动提交。请自行打开其他作业或者考试页面，脚本会自动运行。");
        },
    });

    await qaHandler.handle({
        task,
        frame: script.page.mainFrame(),
        autoReport: true,
        passRate: 100,
    });
}

export async function CXExamScript(task: Task, script: LoginScript) {
    const waitFor = new WaitForScript(script);
    task.process("已经进入考试页面，即将切换到考试预览，并自动答题")
    // 进入考试预览
    await waitFor.nextTick("requestfinished");
    await script.page.evaluate("topreview();");
    await waitFor.nextTick("requestfinished");

    if (!StoreGet("setting").script.account.queryToken) {
        task.error("未设置查题码，不能答题，即将跳转下个任务");
        await sleep(3000);
        return;
    }
    const qaHandler = new CXQAHandler({
        questionDivSelector: ".questionLi",
        titleDivSelector: "h3 span:not(.colorShallow)",
        choice: {
            textSelector: ".answer_p",
            clickableSelector: ".answerBg",
        },
        judgment: {
            clickableSelector: ".answerBg",
        },
        completion: {},
        typeResolver: async (question) => {
            const frame = script.page.mainFrame();
            const choiceDiv = await frame.evaluate((div) => div.querySelector(`[value="多选题"],[value="单选题"]`), question);
            const judgmentDiv = await frame.evaluate((div) => div.querySelector(`[value="判断题"]`), question);
            const completionDiv = await frame.evaluate((div) => div.querySelector(`[value="填空题"]`), question);
            return choiceDiv ? "choice" : judgmentDiv ? "judgment" : completionDiv ? "completion" : undefined;
        },
        async onError() {
            task.process("搜索不到答案，即将切换下一题");
        },
        async onSave(rate: number) {
            task.process("考试已完成,题目完成率(" + rate + "%)，请自行检查，并手动提交。请自行打开其他作业或者考试页面，脚本会自动运行。");
        },
        async onSuccess(rate: number) {
            task.process("考试已完成,题目完成率(" + rate + "%)，请自行检查，并手动提交。请自行打开其他作业或者考试页面，脚本会自动运行。");
        },
    });

    await qaHandler.handle({
        task,
        frame: script.page.mainFrame(),
        autoReport: true,
        passRate: 100,
    });
}
