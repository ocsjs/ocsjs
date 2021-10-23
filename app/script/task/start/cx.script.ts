import { WaitForScript } from "@pioneerjs/core";
import { Task } from "../../../electron/task";
import { Course } from "../../../types/script/course";

/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function CXScript(course: Course): Task<void> {
    return Task.createBlockTask({
        name: "超星刷课任务",
        target: async function (task, script) {
            return new Promise(async (resolve, reject) => {
                if (script) {
                    if (course.url) await script.page.goto(course.url);
                    else if (course.selector) {
                        await Promise.all([new WaitForScript(script).documentReady(), script.page.click(course.selector)]);
                    } else {
                        throw new Error("脚本运行失败: 课程链接或课程元素为空，请重新获取课程!");
                    }
                }
            });
        },
    });
}
