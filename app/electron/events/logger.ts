import fs from "fs";
import p from "path";
import dayjs from "dayjs";
import { app } from "electron";
import { log } from "electron-log";

export class Logger {
    path: string;
    constructor(private eventName: string) {
        this.path = app.getPath("logs");
        log("Logger init", this.path);
    }

    /**
     * 输出信息到文件中
     * @param eventName 事件名称
     * @param args 参数
     */
    log(eventName: string, ...args: any[]) {
        const data = {
            name: this.eventName,
            localTime: dayjs().format("YYYY-MM-DD HH-mm-ss"),
            data: args,
        };
        // 保存的文件夹
        const folder = p.resolve(p.join(this.path, `/${this.getFolderName()}/${this.eventName}/`));

        // 文件
        const file = p.resolve(folder, `${eventName}.json`);
        // 如果有则追加到集合中，否则创建集合
        if (fs.existsSync(file)) {
            const logsJSON = JSON.parse(fs.readFileSync(file).toString());
            logsJSON.push(data);
            fs.writeFileSync(file, JSON.stringify(logsJSON, null, 4));
        } else {
            this.mkdirs(folder);
            fs.writeFileSync(file, JSON.stringify([data], null, 4));
        }
    }

    getFolderName() {
        return dayjs().format("YYYY-MM-DD");
    }

    // 添加文件夹
    mkdirs(url: string): void {
        if (!fs.existsSync(url)) {
            this.mkdirs(p.resolve(url, "../"));
            fs.mkdirSync(url);
        }
    }
}
