import { LoginScript } from "../../script/login/types";

export interface BaseTask<T> extends TaskType<T> {
    onFinish(listener: (...args: any[]) => void): void;
    onProcess(listener: (...args: any[]) => void): void;
    onError(listener: (...args: any[]) => void): void;
    eventFormat(status: TaskStatus, ...str: string[]): void;
    finish(value?: any): void;
    process(msg?:string): void;
    error(msg?:string): void;
    message(msg: string): void;
    update(): void;
    remove(): void;
 
    toRaw(withChildren?:boolean): BaseTask<T>;
}
 

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
    children?: BaseTask<T>;

    createTime?: number;
}
export interface TaskTrasnform<T> {
    asTask(): BaseTask<T>;
}

export interface TaskDispatcher<T> {
    tasks: BaseTask<T>[];
}

export type TaskTargetType<T> = (task: BaseTask<T>, scripts?: LoginScript<void>, ...args: any[]) => Promise<T>;

export type TaskStatus = "wait" | "process" | "finish" | "error";
