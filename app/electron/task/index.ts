import { CurrentWindow } from "..";
import { randomUUID } from "crypto";
import EventEmitter from "events";
 
import { User } from "../../types";
import { ScriptOptions } from "@pioneerjs/core";

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
export class Task<T> extends EventEmitter {
    // 任务id
    id: string;
    // 任务名称
    name: string;
    // 任务载体
    target: TaskTargetType<T>;
    // 任务状态
    status: TaskStatus;
    // 是否需要阻塞，为 true 时，队列里的脚本需要等待当前脚本执行完成
    needBlock: boolean;
    // 任务信息
    msg: string;
    // 子任务
    children?: Task<T>[];

    constructor({
        name,
        target,
        needBlock,
        children,
    }: {
        name: Task<T>["name"];
        target: TaskTargetType<T>;
        children: Task<T>[];
        needBlock?: Task<T>["needBlock"];
    }) {
        super();
        this.id = randomUUID().replace(/-/g, "");
        this.target = target;
        this.needBlock = needBlock || false;
        this.status = "wait";
        this.name = name;
        this.msg = "无";
        this.children = children;
    }

    /**
     * 创建阻塞任务
     * @param name 名字
     * @param target 目标任务
     * @returns
     */
    static createBlockTask<T>({ name, target, children = [] }: { name: Task<T>["name"]; target: TaskTargetType<T>; children?: Task<T>[] }) {
        return this.createTask({ name, target, children, needBlock: true });
    }

    /**
     * 创建任务
     * @param name 名字
     * @param target 目标任务
     * @param needBlock 是否阻塞
     * @returns
     */
    static createTask<T>({
        target,
        name,
        children = [],
        needBlock,
    }: {
        name: Task<T>["name"];
        target: TaskTargetType<T>;
        children?: Task<T>[];
        needBlock?: Task<T>["needBlock"];
    }): Task<T> {
        return new Task({
            target,
            needBlock: needBlock || false,
            name: name,
            children,
        });
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

    finish(value:any) {
        CurrentWindow?.webContents.send("task-finish-" + this.id,value);
        this.emit("finish");
    }

    process() {
        CurrentWindow?.webContents.send("task-process" + this.id);
        this.emit("process");
    }

    error() {
        CurrentWindow?.webContents.send("task-error" + this.id);
        this.emit("error");
    }

    message(str:string){
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
