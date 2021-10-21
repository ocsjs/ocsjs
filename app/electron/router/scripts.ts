import { StartPuppeteer } from "../../script/index";
import { LoginScript } from "../../script/login/types";
import { AllScriptObjects } from "../../script/types";
import { User } from "../../types";
import { getCourseList } from "../../script/task/get.course.list";

import { Task } from "../task";
import { log } from "electron-log";
import { StoreGet, StoreSet } from "../../types/setting";

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
        log("[脚本启动]:", { name, user: user.uid });
        return new Promise((resolve, reject) => {
            StartPuppeteer<LoginScript<any>>(name, async (script) => {
                log("[脚本执行]:", script?.name);
                if (script) {
                    // 课程获取任务
                    const list = getCourseList(script, user);
                    log("[课程获取]:", list);
                    if (list) {
                        // 添加任务列表
                        script.pushTask(
                            Task.createBlockTask({
                                name: "脚本登录",
                                target: async (script) => await (script as LoginScript<any>).login(user),
                                children: script.tasks,
                                timeout: 60 * 1000,
                            }),
                            list
                        );
                        log(
                            "[TASK执行]:",
                            script.tasks.map((t) => t.toString())
                        );
 
                        // 返回任务列表
                        resolve(script.tasks.map((t) => t.toString()));
                        // 执行任务列表
                        script.execTask();
                    }
                } else {
                    resolve([]);
                }
            });
        });
    },
};
