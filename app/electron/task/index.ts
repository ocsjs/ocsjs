import { CurrentWindow } from "..";
import { randomUUID } from "crypto";
import EventEmitter from "events";

import { EventFormat } from "../../types";

import { LoginScript } from "../../script/login/types";
import { StoreGet, StoreSet } from "../../types/setting";
import { BaseTask, TaskStatus, TaskTargetType, TaskType } from "./types";

/**
 * 任务
 */
export class Task<T> extends EventEmitter implements BaseTask<T> {
    id: string;
    name: string;
    target: TaskTargetType<T>;
    status: TaskStatus;
    needBlock: boolean;
    msg: string;
    children: BaseTask<T> | undefined;
    timeout: number;
    createTime: number;

    constructor({ name, target, needBlock, children, id, status, msg, timeout, createTime }: TaskType<T>) {
        super();
        this.id = id || randomUUID().replace(/-/g, "");
        this.target = target;
        this.needBlock = needBlock || false;
        this.status = status || "wait";
        this.name = name;
        this.msg = msg || "";
        this.children = children;
        this.timeout = timeout || 0;
        this.createTime = createTime || Date.now();
    }

    /**
     * 创建阻塞任务
     * @param name 名字
     * @param target 目标任务
     * @returns
     */
    static createBlockTask<T>({ needBlock = true, ...options }: TaskType<T>) {
        return this.createTask({ needBlock, ...options });
    }

    /**
     * 创建任务
     * @param name 名字
     * @param target 目标任务
     * @param needBlock 是否阻塞
     * @returns
     */
    static createTask<T>(options: TaskType<T>): Task<T> {
        return new Task(options);
    }

    onFinish(listener: (...args: any[]) => void) {
        this.on("finish", listener);
    }

    onProcess(listener: (...args: any[]) => void) {
        this.on("process", listener);
    }

    onError(listener: (...args: any[]) => void) {
        this.on("error", listener);
    }

    eventFormat(status: TaskStatus, ...str: string[]) {
        return EventFormat("task", status, ...str);
    }

    finish(value?: any) {
        this.status = "finish";
        CurrentWindow?.webContents.send(this.eventFormat("finish", this.id), value);
        this.emit(this.eventFormat("finish"));
    }

    process() {
        this.status = "process";
        CurrentWindow?.webContents.send(this.eventFormat("process", this.id), this.msg || "");
        this.emit(this.eventFormat("process"));
    }

    error() {
        this.status = "error";
        CurrentWindow?.webContents.send(this.eventFormat("error", this.id), this.msg || "");
        this.emit(this.eventFormat("error"));
    }

    message(msg: string) {
        this.msg = msg;
        CurrentWindow?.webContents.send(EventFormat("task", "message", this.id), this.msg || "");
        this.emit("message");
    }

    update() {
        let localTasks = StoreGet("tasks");
        localTasks.splice(
            localTasks.findIndex((t) => t.id === this.id),
            1,
            this.toRaw()
        );
        StoreSet("tasks", localTasks);
    }

    remove() {
        let localTasks = StoreGet("tasks");
        localTasks.splice(
            localTasks.findIndex((t) => t.id === this.id),
            1
        );
        StoreSet("tasks", localTasks);
    }

    // 格式化此对象，可序列化
    toRaw(): any {
        let task: BaseTask<any> = Object.assign({}, this);

        function str(task: BaseTask<any>): any {
            let { id, name, status, msg, needBlock, timeout, createTime, children } = task;
            if (children) {
                children = str(children);
            }
            return { id, name, status, msg, needBlock, timeout, createTime, children };
        }
        return str(task);
    }


    /**
     * 链接任务组, 成为一个任务链表 ， 返回第一个任务
     * @param tasks 任务组
     * @returns 第一个任务
     */
    static linkTasks<T>(...tasks: Task<T>[]) {
        return tasks.reduceRight((a, b) => {
            b.children = a;
            return b;
        });
    }

    // 执行任务
    static exec(launchTask: BaseTask<LoginScript<void>>): BaseTask<any> {
        (async () => {
            let pass = true;
            launchTask.process();
            const script = await launchTask.target(launchTask);

            if (script) {
                launchTask.finish();
                // 监听任务结束
                script.page.on("close", () => {
                    pass = false;
                    launchTask.remove();
                });
                if (launchTask.children) {
                    // 执行任务
                    await execTask(launchTask.children);
                }
            } else {
                launchTask.message("脚本启动失败，请重试！");
                launchTask.error();
            }

            async function execTask(task: BaseTask<any>): Promise<void> {
                if (pass) {
                    if (task.timeout) {
                        setTimeout(() => {
                            if (task.status !== "finish") {
                                task.message("任务执行超时！请重试！");
                                task.error();
                                pass = false;
                            }
                        }, task.timeout);
                    }

                    // 如果是阻塞任务
                    if (task.needBlock) {
                        try {
                            task.process();
                            const value = await task.target(task, script);
                            task.finish(value);
                            if (task.children) await execTask(task.children);
                        } catch (error) {
                            task.message(error as any);
                            task.error();
                        }
                    }
                    // 如果是非阻塞任务
                    else {
                        task.process();
                        task.target(task, script)
                            .then((result) => {
                                task.finish(result);
                                if (task.children) execTask(task.children);
                            })
                            .catch((err) => {
                                task.message(err);
                                task.error();
                            });
                    }
                }
            }
        })();

        // 保存任务
        let localTasks = StoreGet("tasks");
        localTasks.push(launchTask.toRaw());
        StoreSet("tasks", localTasks);
        return launchTask.toRaw();
    }
}
