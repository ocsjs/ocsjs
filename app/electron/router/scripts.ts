import { StartScript } from "../../script/index";
import { LoginScript } from "../../script/login/types";
import { AllScriptObjects } from "../../script/types";
import { User } from "../../types";
import { GetCourseList } from "../../script/task/get.course.list";
 
import { Course } from "../../types/script/course";
import { CXCourseEntry, CXScript } from "../../script/task/cx/cx.script";
import { logger } from "../../types/logger";
import { RunnableTask } from "../task/runnable.task";
import { ScriptTask } from "../task/script.task";
import { OCSNotify } from "../events/ocs.event";
import { ZHSScript } from "../../script/task/zhs/zhs.script";
import { ExecutableScriptPool, ExecuteContext } from "../task/execute.context";
import { CXWork } from "../../script/task/cx/cx.work";
import { ZHSWork } from "../../script/task/zhs/zhs.work";

const { info } = logger("script");
const notify = new OCSNotify("script", "任务系统");
/**
 * 脚本映射实现，使用此类当做 typeof 类型并且远程映射到渲染进程。具体看 remote.ts
 */
export const ScriptRemote = {
    /**
     * 启动任务
     * @param name 登录脚本名字
     * @returns 指定脚本
     */
    createLaunchTask(name: keyof AllScriptObjects): RunnableTask<LoginScript> {
        return RunnableTask.createTask({
            name: "脚本启动",
            target: async ({ task }) => {
                const s = await StartScript<LoginScript>(name);
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
    login(name: keyof AllScriptObjects, user: User, ...task: ScriptTask<any>[]) {
        info("[脚本启动]:", { name, user: user.uid });

        const ctx = new ExecuteContext(
            RunnableTask.linkTasks(
                this.createLaunchTask(name),
                ScriptTask.createScript<void>({
                    name: "脚本登录",
                    target: async function ({ task, script }) {
                        return await (script as LoginScript).login(task, user);
                    },
                    timeout: 60 * 1000,
                }),
                ...task
            )
        );
        return ctx.exec();
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
        if (user.platform === "cx") {
            return this.login(name, user, CXCourseEntry(course), CXScript(), CXWork(course));
        } else if (user.platform === "zhs") {
            return this.login(name, user, ZHSScript(course), ZHSWork(course));
        } else {
            notify.error("暂时不支持此平台脚本！");
        }
    },

    close(id:string){
        for(let es of ExecutableScriptPool){
            if(es.task.id === id){
                es.script.browser.close()
                es.script.browser.disconnect()
            }
        }
    }
};
