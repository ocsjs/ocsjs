import { StartPuppeteer } from "../../script/index";
import { LoginScript } from "../../script/login/types";
import { AllScriptObjects } from "../../script/types";
import { User } from "../../types";
import { getCXCourseList } from "../../script/cx/get.course";
 
import { Task } from "../task";
 
/**
 * 脚本映射实现，使用此类当做 typeof 类型并且远程映射到渲染进程。具体看 remote.ts
 */
export const ScriptRemote = {
    /**
     * 登录脚本
     * @param name 需要执行的登录脚本类型
     * @param user 需要运行的账号
     * @returns
     */
    login(name: keyof AllScriptObjects, user: User): Promise<Task<any>[] | undefined> {
        return new Promise((resolve, reject) => {
            StartPuppeteer<LoginScript<any>>(name, async (script) => {
                if (script) {
                    // 添加任务列表
                    script.pushTask(
                        Task.createBlockTask({
                            name: "脚本登录",
                            target: async (script) => await (script as LoginScript<any>).login(user),
                            children: script.tasks,
                        }),
                        getCXCourseList(script)
                    );
                    // 返回任务列表
                    resolve(script.tasks.map((t) => t.toString()));
                    // 执行任务列表
                    script.execTask();
                }
            });
        });
    },
};
