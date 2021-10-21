import { RunnableScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { Task, TaskDispatcher } from "../../electron/task";
import { LoginScriptType, User } from "../../types";

// 可运行任务
export abstract class RunnableTask<T> extends RunnableScript implements TaskDispatcher<T> {
    tasks: Task<T>[] = [];
}

/**
 * 超星登录脚本，抽象类
 */
export abstract class LoginScript<T> extends RunnableTask<T> implements LoginScriptType, TaskDispatcher<T> {
    static scriptName: string;
    abstract login(user: User): Promise<any>;

    pushTask(...t: Task<T>[]): LoginScript<T> {
        this.tasks = this.tasks.concat(t);
        return this;
    }

    // 执行任务列表
    async execTask(...t: Task<T>[]): Promise<void> {
        let pass = true;
        for (const task of this.tasks.concat(t)) {
            if (pass) {
                if (task.timeout) {
                    setTimeout(() => {
                        if (task.status !== "finish") {
                            task.msg = "任务执行超时！请重试！";
                            task.error();
                            pass = false
                        }
                    }, task.timeout);
                }

                // 如果是阻塞任务
                if (task.needBlock) {
                    try {
                        task.process();
                        const value = await task.target(this);
                        task.finish(value);
                    } catch (error) {
                        task.msg = (error as any) 
                        task.error();
                    }
                }
                // 如果是非阻塞任务
                else {
                    task.process();
                    task.target(this)
                        .then((result) => {
                            task.finish(result);
                        })
                        .catch((err) => {
                            task.msg = err
                            task.error();
                            log(err);
                        });
                }
            }else{
                break
            }
        }
    }
}
