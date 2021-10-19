import { InjectableScript, RunnableScript, ScriptConstructor } from "@pioneerjs/core";
import { log } from "electron-log";
import { Task, TaskDispatcher, TaskTrasnform } from "../../electron/task";
import { LoginScriptType, User } from "../../types";
 
// 可运行任务
export abstract class RunnableTask<T> extends RunnableScript implements TaskDispatcher<T> {
    tasks: Task<T>[] = [];
}
 

/**
 * 超星登录脚本，抽象类
 */
export abstract class LoginScript<T> extends RunnableTask<T> implements LoginScriptType, TaskDispatcher<T> {
    abstract login(user: User): Promise<any>;

    pushTask(...t: Task<T>[]): LoginScript<T> {
        this.tasks = this.tasks.concat(t);
        return this;
    }

    // 执行任务列表
    async execTask(...t: Task<T>[]): Promise<void> {
        
        for (const task of this.tasks.concat(t)) {
            // 如果是阻塞任务
            if (task.needBlock) {
                try {
                    task.status = "process";
                    task.process();
                    const value = await task.target(this);
                    task.status = "finish";
                    task.finish(value);
                } catch (error) {
                    task.status = "error";
                    task.error();
                }
            } 
            // 如果是非阻塞任务
            else {
                task.status = "process";
                task.process();
                task.target(this)
                    .then((result) => {
                        task.status = "finish";
                        task.finish(result);
                    })
                    .catch((err) => {
                        task.status = "error";
                        task.error();
                        log(err);
                    });
            }
        }
    }
}
