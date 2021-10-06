import { AxiosGet } from './axios';
import { PathLike } from "fs";
import path from "path";
import { Updater, Version } from ".";
import yaml from 'yaml';
import { app } from 'electron';
import { log } from 'electron-log';

export class JSDelivrUpdater extends Updater {


    constructor(private path: string) {
        super()
    }

    async update() {
        this.APP_UPDATE.info('开始更新,更新源: jsdelivr')
        let chunks = ''
        const data = await super.update()
        if (data) {
            data.on('data', (chunk: any) => {
                chunks += chunk.toString()
                this.APP_UPDATE.info("下载中:" + JSDelivrUpdater.showFomatSize(chunks.length))
            })

            data.on('end', () => {
                this.APP_UPDATE.success('更新完毕！')
            })
        }

    }

    resolvePath(): PathLike {
        return path.resolve(this.path)
    }
    async resolveResource(): Promise<URL | undefined> {
        return new URL('https://cdn.jsdelivr.net/npm/online-course-script/resource/ocs-app-resource.zip')
    }

    async needUpdate(): Promise<boolean> {
        const { data } = await AxiosGet({
            url: "https://cdn.jsdelivr.net/npm/online-course-script/resource/latest.yml"
        })
        log("data",data)
        const v = yaml.parse(data).version
        return !!v && new Version(v).greaterThan(new Version(this.tag || app.getVersion()))
    }


}