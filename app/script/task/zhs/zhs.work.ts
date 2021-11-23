import { WaitForScript } from "@pioneerjs/core";
import { debounce } from "lodash";
import { Page, Target } from "puppeteer-core";
import { Task } from "../../../electron/task";
import { ScriptTask } from "../../../electron/task/script.task";
import { Course } from "../../../types/script/course";
import { LoginScript } from "../../login/types";
import { QAHandler } from "../qa.handler";
import { waitForNavigation, waitForClickAndNavigation } from "../utils";

const debouncedQAScript = debounce(QAScript, 10000);

/**
 * 智慧树刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function ZHSWork(course: Course): ScriptTask<void> {
    return ScriptTask.createScript({
        name: "智慧树作业及考试任务",
        target: async function ({ task, script }) {
            return new Promise(async (resolve, reject) => {
                const waitFor = new WaitForScript(script);
                const { page } = script;

                await waitFor.nextTick("requestfinished");
                // 自动进入作业考试界面
                await script.page.click("#app > div > div.box-content > div.box-right > ul > li:nth-child(2)");

                await waitFor.nextTick("requestfinished");
                // // 进入章节列表

                script.browser.on("targetcreated", async (target: Target) => {
                    const page = await target.page();
                    if (page) {
                        if (RegExp("webExamList/dohomework").test(target.url())) {
                            task.process("做作业中");

                            await debouncedQAScript(script, task);
                        }

                        script.page = page;
                        page.on("requestfinished", async (req) => {
                            if (RegExp("webExamList/dohomework").test(req.url())) {
                                task.process("做作业中");
                                await debouncedQAScript(script, task);
                            }
                        });
                    }
                });

                task.process("请自行打开作业或者考试页面，脚本会自动运行。");
            });
        },
    });
}

export async function QAScript(script: LoginScript, task: Task) {
    const waitFor = new WaitForScript(script);
    const { page } = script;
    await waitFor.nextTick("requestfinished");
    const qaHandler = new QAHandler({
        questionDivSelector: ".examPaper_subject",
        titleDivSelector: ".subject_type_describe",
        choice: {
            textSelector: ".examquestions-answer",
            clickableSelector: ".nodeLab",
        },
        judgment: {
            clickableSelector: ".nodeLab",
        },
        completion: {},

        typeResolver: async (question) => {
            const frame = page.mainFrame();
            const choiceDiv = await frame.evaluate((div) => div.querySelectorAll(`[type="radio"],[type="checkbox"]`).length === 4, question);
            const judgmentDiv = await frame.evaluate((div) => div.querySelectorAll(`[type="radio"]`).length === 2, question);
            const completionDiv = await frame.evaluate((div) => div.querySelector(`textarea`) !== undefined, question);
            return choiceDiv ? "choice" : judgmentDiv ? "judgment" : completionDiv ? "completion" : undefined;
        },
        titleTransform(title: string) {
            return title
                .replace(/【.*?题】/, "")
                .replace(/\(\d+分\)/, "")
                .replace(/\n/g, "");
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
        frame: page.mainFrame(),
        autoReport: true,
        passRate: 100,
    });
}
