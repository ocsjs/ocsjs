import { RunnableScript } from "@pioneerjs/core";
import { Task } from "../../electron/task";
import { TaskDispatcher, TaskType } from "../../electron/task/types";
import { LoginScriptType,  User } from "../../types";

// 可运行任务
export abstract class RunnableTask<T> extends RunnableScript implements TaskDispatcher<T> {
    tasks: Task<T>[] = [];
}

/**
 * 超星登录脚本，抽象类
 */
export abstract class LoginScript<T> extends RunnableTask<T> implements LoginScriptType<T>, TaskDispatcher<T> {
    static scriptName: string;
    abstract login(task: TaskType<any>, user: User): Promise<any>;

    pushTask(...t: Task<T>[]): LoginScript<T> {
        this.tasks = this.tasks.concat(t);
        return this;
    }
}
