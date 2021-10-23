import { StartScript } from "../../script/index";
import { LoginScript } from "../../script/login/types";
import { AllScriptObjects } from "../../script/types";
import { User } from "../../types";
import { GetCourseList } from "../../script/task/get.course.list";

import { Task } from "../task";
import { log } from "electron-log";
import { StoreGet, StoreSet } from "../../types/setting";
import { Course } from "../../types/script/course";
import { CXScript } from "../../script/task/start/cx.script";

/**
 * 脚本映射实现，使用此类当做 typeof 类型并且远程映射到渲染进程。具体看 remote.ts
 */
export const ScriptRemote = {
    /**
     * 启动任务
     * @param name 登录脚本名字
     * @returns 指定脚本
     */
    createLaunchTask(name: keyof AllScriptObjects): Task<LoginScript<any>> {
        return Task.createTask({
            name: "脚本启动",
            target: async () => {
                const s = await StartScript<LoginScript<any>>(name);
                if (!s) {
                    throw new Error("脚本启动失败，请重试！");
                }
                return s;
            },
            timeout: 10 * 1000,
        });
    },

    /**
     * 登录脚本任务
     * @param name 登录脚本名字
     * @param user 需要运行的账号
     * @returns
     */
    login(name: keyof AllScriptObjects, user: User, ...task: Task<any>[]) {
        log("[脚本启动]:", { name, user: user.uid });
        const t = Task.linkTasks(
            this.createLaunchTask(name),
            Task.createBlockTask<any>({
                name: "脚本登录",
                target: async function (task, script) {
                    return await (script as LoginScript<any>).login(task, user);
                },
                timeout: 60 * 1000,
            }),
            ...task
        );
        log("login script",t)
        return Task.exec(t);
    },

    /**
     * 获取课程列表任务
     * @param name 登录脚本名字
     * @param user 账号
     * @returns 课程列表
     */
    getCourseList(name: keyof AllScriptObjects, user: User) {
        return this.login(name, user, GetCourseList(user));
    },

    /**
     * 刷课任务
     * @param name 登录脚本名字
     * @param user 账号
     * @param course 课程
     */
    start(name: keyof AllScriptObjects, user: User, course: Course) {
        return this.login(name, user, CXScript(course));
    },
};
