import { CurrentWindow } from "..";
import { randomUUID } from "crypto";
import EventEmitter from "events";

import { EventFormat } from "../../types";

import { LoginScript } from "../../script/login/types";
import { StoreGet, StoreSet } from "../../types/setting";
import { BaseTask, TaskStatus, TaskTargetType, TaskType } from "./types";
import { logger } from "../../types/logger";
import { OCSNotify } from "../events/ocs.event";
const { info, error, success, warn } = logger("task");

const notify = new OCSNotify("task", "任务系统");
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
        success(this.name, value);
        this.status = "finish";
        CurrentWindow?.webContents.send(this.eventFormat("finish", this.id), value);
        this.emit(this.eventFormat("finish"));
        success("finish", this.toRaw(false));
    }

    process(msg: string) {
        info(this.name, msg);
        this.change("process", msg);
    }

    error(msg: string) {
        error(this.name, msg);
        this.change("error", msg);
    }

    warn(msg: string) {
        warn(this.name, msg);
        this.change("warn", msg);
    }

    change(status: TaskStatus, msg: string) {
        console.log(status, msg);

        this.status = status;
        this.msg = msg;
        CurrentWindow?.webContents.send(this.eventFormat(status, this.id), msg || "");
        this.emit(this.eventFormat(status));
        error(status, this.toRaw(false));
    }

    update() {
        let localTasks = StoreGet("tasks");
        localTasks.splice(
            localTasks.findIndex((t) => t.id === this.id),
            1,
            this.toRaw()
        );
        StoreSet("tasks", localTasks);
        info("task更新", this.toRaw());
    }

    remove() {
        let localTasks = StoreGet("tasks");
        localTasks.splice(
            localTasks.findIndex((t) => t.id === this.id),
            1
        );
        StoreSet("tasks", localTasks);
        info("task移除", this.toRaw());
    }

    // 格式化此对象，可序列化
    toRaw(withChildren: boolean = true): any {
        let task: BaseTask<any> = Object.assign({}, this);

        function str(task: BaseTask<any>): any {
            let { id, name, status, msg, needBlock, timeout, createTime, children } = task;
            if (children) {
                children = str(children);
            }
            if (withChildren) {
                return { id, name, status, msg, needBlock, timeout, createTime, children };
            } else {
                return { id, name, status, msg, needBlock, timeout, createTime };
            }
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
        info("脚本任务启动:", launchTask.toRaw());

        process.on("uncaughtException", (err) => {
            error(launchTask.name + " 任务出错！ uncaughtException", err);
        });

        process.on("unhandledRejection", (err: any) => {
            if (err.toString().indexOf("Most likely the page has been closed") !== -1) {
                notify.error(launchTask.name + " 任务运行错误，很可能是您将浏览器关闭了，或者浏览器访问页面时出错。");
            }
            error(launchTask.name + " 任务出错！ unhandledRejection", err);
        });

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
                launchTask.error("脚本启动失败，请重试！");
            }

            async function execTask(task: BaseTask<any>): Promise<void> {
                info("脚本任务执行:", task.toRaw(false));
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
                            const value = await task.target(task, script);
                            task.finish(value);
                            if (task.children) await execTask(task.children);
                        } catch (error) {
                            task.error(error as any);
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
                                task.error(err);
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
