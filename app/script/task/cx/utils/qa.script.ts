import { Frame } from "puppeteer-core";
import { ScriptSetting } from "../../../../types";
import { StoreGet } from "../../../../types/setting";

import { sleep } from "../../../common/utils";
import { Task } from "../../../../electron/task";
import { QAHandler } from "../../qa.handler";

/**
 * 自动答题脚本
 * @param task 任务
 * @param frame 窗体
 * @param setting 设置
 */
export async function QAScript(task: Task, frame: Frame, setting: ScriptSetting["script"]["cx"]["study"]["qa"]) {

    const qaHandler = new QAHandler({
        questionDivSelector: ".TiMu",
        titleDivSelector: ".Zy_TItle > .clearfix",
        choice: {
            textSelector: "li",
            clickableSelector: "li input",
        },
        judgment: {
            clickableSelector: "li input",
        },
        completion: {},
        typeResolver: async (question) => {
            const choiceDiv = await frame.evaluate((div) => div.querySelector(".Zy_ulTop"), question);
            const judgmentDiv = await frame.evaluate((div) => div.querySelector(".Zy_ulBottom"), question);
            const completionDiv = await frame.evaluate((div) => div.querySelector(".Zy_ulTk"), question);
            return choiceDiv ? "choice" : judgmentDiv ? "judgment" : completionDiv ? "completion" : undefined;
        },
        titleTransform(title: string) {
            return title.replace(/【.*?题】/, "");
        },
        async onError() {
            task.process("搜索不到答案，即将切换下一题");
        },
        async onSave(rate: number) {
            task.process("章节测验已完成,题目完成率(" + rate + "%)。暂时保存");
            await sleep(3000);
            await frame.evaluate("if(window.noSubmit)window.noSubmit()");
            await sleep(1000);
        },
        async onSuccess(rate: number) {
            task.process("章节测验已完成,题目完成率(" + rate + "%)。即将自动提交");
            await sleep(3000);
            try {
                await frame.evaluate(() => {
                    return new Promise<void>((resolve, reject) => {
                        let w = window as any;
                        if (w.btnBlueSubmit) w.btnBlueSubmit();
                        setTimeout(() => {
                            setTimeout(resolve, 3000);
                            if (w.form1submit) w.form1submit();
                        }, 3000);
                    });
                });
            } catch {}
            await sleep(3000);
        },
    });

    await qaHandler.handle({
        task,
        frame,
        autoReport: setting.autoReport,
        passRate: setting.passRate,
    });
}
