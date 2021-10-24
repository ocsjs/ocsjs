 
import { log } from "electron-log";
import { Task } from "../../../electron/task";
import { Course } from "../../../types/script/course";
 
/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function CXExam(course: Course): Task<void> {
    return Task.createBlockTask({
        name: "超星考试任务",
        target: async function (task, script) {
            return new Promise(async (resolve, reject) => {
                if (script) {
                    log("即将跳转:",script.page.url().replace(/pageHeader=\d+/,"pageHeader=8"))
                    await script.page.goto(script.page.url().replace(/pageHeader=\d+/,"pageHeader=8"))
                    resolve()
                }
            });
        },
    });
}
