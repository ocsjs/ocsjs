import { WaitForScript } from "@pioneerjs/core";
import { ScriptTask } from "../../../electron/task/script.task";

import { Course } from "../../../types/script/course";
 
/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function CXExam(course: Course): ScriptTask<void> {
    return ScriptTask.createScript({
        name: "超星考试任务",
        target: async function ({ task, script }) {
            return new Promise(async (resolve, reject) => {
                const waitFor = new WaitForScript(script);
                task.process("开始考试");

                await script.page.goto(script.page.url().replace(/pageHeader=\d+/, "pageHeader=9"));
                // 自动进入学习界面
                await waitFor.nextTick("requestfinished");
                // // 进入章节列表
                // await script.page.evaluate(() => (document.querySelectorAll("iframe")[1].contentWindow?.document.querySelector(".chapter_item[onclick*='toOld']") as any).click());
                // await waitFor.nextTick("requestfinished");

                resolve();
            });
        },
    });
}
