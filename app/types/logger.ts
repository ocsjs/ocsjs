const fs = require("fs");
const p = require("path");
const dayjs = require("dayjs");
const { app } = require("electron");

const { log: electronLog } = require("electron-log");

export type LoggerLevel = "info" | "error" | "warn" | "success" | "notify";
export interface Logger {
    info(...msg: any[]): void;
    error(...msg: any[]): void;
    warn(...msg: any[]): void;
    success(...msg: any[]): void;
    log(level: LoggerLevel, ...msg: any[]): void;
}

export function logger(eventName: string): Logger {
    electronLog("logger init", eventName, "path:" + app.getPath("logs"));
    return {
        info(...msg: any[]): void {
            return log(eventName, "info", msg);
        },
        error(...msg: any[]): void {
            return log(eventName, "error", msg);
        },
        warn(...msg: any[]): void {
            return log(eventName, "warn", msg);
        },
        success(...msg: any[]): void {
            return log(eventName, "success", msg);
        },
        log(level: LoggerLevel, ...msg: any[]): void {
            return log(eventName, level, msg);
        },
    };
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
export function log(eventName: string, level: LoggerLevel, ...msg: any[]) {
    const path = app.getPath("logs");
    const data = {
        name: eventName,
        localTime: dayjs().format("YYYY-MM-DD HH-mm-ss"),
        data: msg,
    };
    // 保存的文件夹
    const folder = p.resolve(p.join(path, `/${getLogsFolderName()}/${eventName}/`));

    // 文件
    const file = p.resolve(folder, `${level}.json`);
    // 如果有则追加到集合中，否则创建集合
    if (fs.existsSync(file)) {
        const logsJSON = JSON.parse(fs.readFileSync(file).toString());
        logsJSON.push(data);
        fs.writeFileSync(file, JSON.stringify(logsJSON, null, 4));
    } else {
        mkdirs(folder);
        fs.writeFileSync(file, JSON.stringify([data], null, 4));
    }
}
