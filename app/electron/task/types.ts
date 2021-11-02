 
export interface BaseTask extends TaskType {
    onFinish(listener: (...args: any[]) => void): void;
    onProcess(listener: (...args: any[]) => void): void;
    onError(listener: (...args: any[]) => void): void;
    eventFormat(status: TaskStatus, ...str: string[]): void;
    finish(value?: any): void;
    process(msg?: string): void;
    error(msg?: string): void;
    warn(msg?: string): void;
    update(): void;
    remove(): void;
    toString(withChild?:boolean):any
}

export interface TaskType {
    // 任务名称
    name: string;
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
    createTime?: number;
}
 
export type TaskStatus = "wait" | "process" | "finish" | "error" | "warn";
