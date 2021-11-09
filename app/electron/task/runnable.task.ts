import { shell } from "electron";
import { errors, TimeoutError } from "puppeteer-core";
import { Task } from ".";
import { LoginScript } from "../../script/login/types";
import { logger } from "../../types/logger";
import { StoreGet, StoreSet } from "../../types/setting";
import { OCSNotify } from "../events/ocs.event";
import { ScriptTarget, ScriptTask } from "./script.task";
import { BaseTask, TaskType } from "./types";

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
}
