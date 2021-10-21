import { CurrentWindow } from "..";
import { randomUUID } from "crypto";
import EventEmitter from "events";

import { EventFormat, User } from "../../types";
import { ScriptOptions } from "@pioneerjs/core";

export interface TaskType<T> {
    // 任务名称
    name: string;
    // 任务载体
    target: TaskTargetType<T>;

    // 是否需要阻塞，为 true 时，队列里的脚本需要等待当前脚本执行完成
    needBlock?: boolean;
    // 任务id
    id?: string;
    // 超时时间
    timeout?: number;
    // 任务状态
    status?: TaskStatus;
    // 任务信息
    msg?: string;
    // 子任务
    children?: Task<T>[];
}
export interface TaskTrasnform<T> {
    asTask(): Task<T>;
}

export interface TaskDispatcher<T> {
    tasks: Task<T>[];
}

export interface TaskTargetOptions {
    user?: User;
}

export type TaskTargetType<T> = (scripts: ScriptOptions, ...args: any[]) => Promise<T>;

/**
 * 任务
 */
export class Task<T> extends EventEmitter implements TaskType<T> {
    id: string;
    name: string;
    target: TaskTargetType<T>;
    status: TaskStatus;
    needBlock: boolean;
    msg: string;
    children: Task<T>[];
    timeout: number;

    constructor({ name, target, needBlock, children, id, status, msg, timeout }: TaskType<T>) {
        super({
            captureRejections: false,
        });
        this.id = id || randomUUID().replace(/-/g, "");
        this.target = target;
        this.needBlock = needBlock || false;
        this.status = status || "wait";
        this.name = name;
        this.msg = msg || "";
        this.children = children || [];
        this.timeout = timeout || 0;
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

    eventFormat(status:TaskStatus,...str:string[]){
        return  EventFormat("task", status, ...str);
    }

    finish(value: any) {
        this.status = "finish";
         
        CurrentWindow?.webContents.send(this.eventFormat("finish",this.id), value);
        this.emit(this.eventFormat("finish"));
    }

    process() {
        this.status = "process";
        CurrentWindow?.webContents.send(this.eventFormat("process",this.id), this.msg||'');
        this.emit(this.eventFormat("process"));
    }

    error() {
        this.status = "error";
        CurrentWindow?.webContents.send(this.eventFormat("error",this.id), this.msg||'');
        this.emit(this.eventFormat("error"));
    }

    message(str: string) {
        this.emit("message");
    }

    toString(): any {
        function str(children: Task<T>): any {
            if (children.children && children.children.length !== 0) {
                return (children.children = children.children.map((c) => str(c)));
            } else {
                const { id, name, needBlock, status } = children;
                return { id, name, needBlock, status };
            }
        }
        return str(this);
    }
}

export type TaskStatus = "wait" | "process" | "finish" | "error";
