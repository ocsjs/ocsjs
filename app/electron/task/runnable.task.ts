import { shell } from 'electron';
import { Task } from ".";
import { LoginScript } from "../../script/login/types";
import { logger } from "../../types/logger";
import { StoreGet, StoreSet } from "../../types/setting";
import { OCSNotify } from "../events/ocs.event";
import { ScriptTarget, ScriptTask } from "./script.task";
import { TaskType } from "./types";

const { info, error, success, warn } = logger("task");

const notify = new OCSNotify("task", "任务系统");

export type Target<T> = (...args: any[]) => Promise<T>;
export type RunnableTaskOptions<R> = { target: ScriptTarget<R>; children?: RunnableTask<R> } & TaskType;

/**
 * 可运行任务
 */
export class RunnableTask<R> extends Task {
    // 任务载体
    target: Target<R>;
    // 子任务
    children?: RunnableTask<R>;
    constructor(options: RunnableTaskOptions<R>) {
        super(options);
        this.target = options.target;
        this.children = options.children;
    }

    /**
     * 创建阻塞任务
     * @param name 名字
     * @param target 目标任务
     * @returns
     */
    static createBlockTask<R>({ needBlock = true, ...options }: RunnableTaskOptions<RunnableTaskOptions<R>>) {
        return this.createTask({ needBlock, ...options });
    }

    /**
     * 创建任务
     * @param name 名字
     * @param target 目标任务
     * @param needBlock 是否阻塞
     * @returns
     */
    static createTask<R>(options: RunnableTaskOptions<R>): RunnableTask<R> {
        return new RunnableTask(options);
    }

    /**
     * 链接任务组, 成为一个任务链表 ， 返回第一个任务
     * @param tasks 任务组
     * @returns 第一个任务
     */
    static linkTasks<R>(...tasks: RunnableTask<R>[]) {
        return tasks.reduceRight((a, b) => {
            b.children = a;
            return b;
        });
    }

    // 执行任务
    static exec<R extends LoginScript>(launchTask: RunnableTask<R>): RunnableTask<R> {
        info("脚本任务启动:", launchTask.toString());

        process.on("uncaughtException", (err) => {
            error(launchTask.name + " 任务出错！ uncaughtException", err);
        });

        process.on("unhandledRejection", (err: any, promise) => {
            promise.catch((err) => {
                launchTask.error("任务启动失败，请重启");
                if (err.toString().indexOf("Most likely the page has been closed") !== -1) {
                    notify.error(launchTask.name + " 任务运行错误，很可能是您将浏览器关闭了，或者浏览器访问页面时出错。");
                }
                error(launchTask.name + " 任务出错！ unhandledRejection", err);
            });
        });

        (async () => {
            // 是否继续
            let pass = true;
            // 当前的任务
            let currentTask = launchTask;
            launchTask.process();
            const script = await launchTask.target({
                task: launchTask,
            });

            if (script) {
                launchTask.finish();
                // 监听任务结束
                script.page.on("close", () => {
                    pass = false;
                    if(currentTask.status!=='finish'){
                        currentTask.error('脚本已关闭')
                    }
        
                    launchTask.remove();
                });
                if (launchTask.children) {
                    // 执行任务
                    await execTask(launchTask.children);
                } else {
                    warn(launchTask.name + " 任务没有子任务！");
                }
            } else {
                launchTask.error("脚本启动失败，请重试！");
            }

            async function execTask(task: RunnableTask<R>): Promise<void> {
                currentTask = task;

                process.on("uncaughtException", (err) => {
                    pass = false;
                    launchTask.error("任务运行错误，请重启");
                    error(launchTask.name + " 任务出错！ uncaughtException", err);
                });

                process.on("unhandledRejection", (err: any, promise) => {
                    pass = false;
                    promise.catch((err) => {
                        launchTask.error("任务运行错误，请重启");
                        if (err.toString().indexOf("Most likely the page has been closed") !== -1) {
                            notify.error(launchTask.name + " 任务运行错误，很可能是您将浏览器关闭了，或者浏览器访问页面时出错。");
                        }
                        error(launchTask.name + " 任务出错！ unhandledRejection", err);
                    });
                });

                if (pass) {
                    if (task.timeout) {
                        setTimeout(() => {
                            if (task.status !== "finish") {
                                task.error("任务执行超时！请重试！");
                                pass = false;
                            }
                        }, task.timeout);
                    }

                    // 如果是阻塞任务
                    if (task.needBlock) {
                        try {
                            task.process();
                            console.log("task 运行", task.name);
                            const value = await task.target({ task, script });
                            console.log("task 运行完毕", task.name);
                            task.finish(value);
                            if (task.children) await execTask(task.children);
                        } catch (err) {
                            notify.error(launchTask.name + " 任务运行错误:" + err);
                            error(launchTask.name + " 任务出错:", err);
                            task.error(err as any);
                        }
                    }
                    // 如果是非阻塞任务
                    else {
                        task.process();
                        task.target({ task, script })
                            .then((result) => {
                                task.finish(result);
                                if (task.children) execTask(task.children);
                            })
                            .catch((err) => {
                                notify.error(launchTask.name + " 任务运行错误:" + err);
                                error(launchTask.name + " 任务出错:", err);
                                task.error(err);
                            });
                    }
                }
            }
        })();

        // 保存任务
        let localTasks = StoreGet("tasks");
        localTasks.push(launchTask.toString());
        StoreSet("tasks", localTasks);
        return launchTask.toString();
    }
}
