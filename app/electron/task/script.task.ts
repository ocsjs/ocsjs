import { LoginScript } from "../../script/login/types";
import { RunnableTask, RunnableTaskOptions, Target } from "./runnable.task";

import { TaskType } from "./types";
export type ScriptTarget<T> = (options: { task: ScriptTask<T>; script: LoginScript }) => Promise<T>;

/**
 * 脚本任务
 */
export class ScriptTask<R> extends RunnableTask<R> {
    // 任务载体
    target: ScriptTarget<R>;
    // 子任务
    children?: ScriptTask<R>;

    constructor(options: { target: ScriptTarget<R>; children?: ScriptTask<R> } & TaskType) {
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
    static createScript<R>({ needBlock = true, ...options }: RunnableTaskOptions<R>) {
        return new ScriptTask({ needBlock, ...options });
    }
}
