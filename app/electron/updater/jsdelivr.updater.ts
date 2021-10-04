import { PathLike } from "fs";
import path from "path";
import { Updater } from ".";

export class JSDelivrUpdater extends Updater {


    constructor(private path: string) {
        super()
    }

    async update() {
        this.APP_UPDATE.info('开始更新,更新源: jsdelivr')
        let chunks = ''
        super.update((chunk) => {
            chunks += chunk.toString()
            this.APP_UPDATE.info("下载中:" + JSDelivrUpdater.showFomatSize(chunks.length))
        })

    }

    resolvePath(): PathLike {
        return path.resolve(this.path)
    }
    async resolveResource(): Promise<URL | undefined> {
        return new URL('https://cdn.jsdelivr.net/gh/enncy/online-course-script@1.0.2-beta/resource/ocs-app-resource.zip')
    }

    async needUpdate(): Promise<boolean> {
        return true
    }


}