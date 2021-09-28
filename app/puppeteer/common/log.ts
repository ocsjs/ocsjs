import fs from 'fs';
import p from 'path';
import dayjs from 'dayjs';
import { app } from 'electron';


export interface LogType {
    script: string,
    time: number,
    localTime: string,
    data: any
}



export class Logger {
    path: string
    constructor(private scriptName: string) {
        this.path = app.getPath('userData')
    }

    public info(...args: any[]) {
        this.save('info', ...args)
    }
    public warn(...args: any[]) {
        this.save('warn', ...args)
    }
    public error(...args: any[]) {
        this.save('error', ...args)
    }

    private save(level: string, ...args: any[]) {
        const data = {
            script: this.scriptName,
            localTime: dayjs().format('YYYY-MM-DD HH-mm-ss'),
            data: [...args]
        }

        const folder = p.resolve(this.path, `./logs/${this.getFolderName()}/`)
        const file = p.resolve(folder, `${level}-${this.scriptName}.json`)
        if (fs.existsSync(file)) {
            const logsJSON = JSON.parse(fs.readFileSync(file).toString())
            logsJSON.push(data)
            fs.writeFileSync(file, JSON.stringify(logsJSON, null, 4))
        } else {
            this.mkdirs(folder)
            fs.writeFileSync(file, JSON.stringify([data], null, 4))
        }
    }

    getFolderName() {
        return dayjs().format("YYYY-MM-DD")
    }

    mkdirs(url: string): void {
        if (!fs.existsSync(url)) {
            this.mkdirs(p.resolve(url, "../"))
            fs.mkdirSync(url)
        }
    }


}

