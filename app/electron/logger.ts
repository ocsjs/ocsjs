import fs from "fs";
import p from "path";
import dayjs from "dayjs";
import { app } from "electron";
import { info, error } from "electron-log";

export type LoggerLevel = "info" | "error" | "warn" | "success" | "notify" | "task";

export interface LoggerType {
    info(...msg: any[]): void;
    error(...msg: any[]): void;
    warn(...msg: any[]): void;
    success(...msg: any[]): void;
    task(description: string, handler: () => Promise<any>): Promise<any>;
    log(level: LoggerLevel, ...msg: any[]): void;
}

export class Logger implements LoggerType {
    path: string;
    constructor(private eventName: string) {
        this.path = app.getPath("logs");
    }
    log(level: LoggerLevel, ...msg: any[]): void {
        log(this.path, this.eventName, level, msg);
    }

    info(...msg: any[]): void {
        log(this.path, this.eventName, "info", msg);
    }
    error(...msg: any[]): void {
        log(this.path, this.eventName, "error", msg);
    }
    warn(...msg: any[]): void {
        log(this.path, this.eventName, "warn", msg);
    }
    success(...msg: any[]): void {
        log(this.path, this.eventName, "success", msg);
    }

    task(description: string, handler: () => Promise<any>): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const t = Date.now();
                log(this.path, "system", "task", description);
                resolve(await handler());
                log(this.path, "system", "task", description + "成功,耗时:" + (Date.now() - t));
            } catch (err) {
                reject(err);
            }
        });
    }

    static of(eventName: string) {
        return new Logger(eventName);
    }
}

export function getLogsFolderName() {
    return new Date().toLocaleDateString("zh-CN").split("/").join("-");
}

// 添加文件夹
export function mkdirs(url: string): void {
    if (!fs.existsSync(url)) {
        mkdirs(p.resolve(url, "../"));
        fs.mkdirSync(url);
    }
}

/**
 * 输出信息到文件中
 * @param eventName 事件名称
 * @param args 参数                                                       
 */
export function log(path: string, eventName: string, level: LoggerLevel, ...msg: any[]) {
    let datetime = dayjs().format("YYYY-MM-DD HH:mm:ss")
    console.log(`${datetime}`,`[${eventName}-${level}]`,...msg);
    // 保存的文件夹
    const folder = p.resolve(p.join(path, `/${getLogsFolderName()}/`));

    // 文件
    const file = p.resolve(folder, `${eventName}.txt`);
    // 如果有则追加到集合中，否则创建集合
    try {
        if (fs.existsSync(file)) {
            fs.appendFileSync(file, `[${datetime}] [${level}] : ${msg.map((m) => m?.toString()).join(" ")} \n`);
        } else {
            mkdirs(folder);
            fs.writeFileSync(file, `[${datetime}] [${level}] :  ${msg.map((m) => m?.toString()).join(" ")} \n`);
        }
    } catch (e) {
        error("logger 输出错误", e);
    }
}
