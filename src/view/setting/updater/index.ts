import { AxiosGet } from "@/utils/request";
import { Version } from "app/types/version";
import { ClientRequest } from "http";
import { resolve, join } from "path";
import { zip } from "compressing";
import { createWriteStream } from "fs";
const { app } = require("electron");
import { parse } from "yaml";
export interface Tag {
    name: string;
    message: string;
}

export interface Updater {
    listTags(): Promise<Tag[]>;
    resolveResourseUrl(tag: Tag): Promise<string>;
    resolveLatestUrl(tag: Tag): Promise<string>;
    needUpdate(tag: Tag): Promise<boolean>;
}

export abstract class UpdaterImpl implements Updater {
    abstract listTags(): Promise<Tag[]>;
    abstract resolveResourseUrl(tag: Tag): Promise<string>;
    abstract resolveLatestUrl(tag: Tag): Promise<string>;
    async needUpdate(tag: Tag): Promise<boolean> {
        const { data: res } = await AxiosGet(await this.resolveLatestUrl(tag));
        const v = parse(res).version;
        return !!v && Version.from(v).greaterThan(Version.from(app.getVersion()));
    }
    resolvePath(): string {
        return resolve("./resources/resource.zip");
    }

    //更新
    public async update(tag: Tag, callback?: (chunk: any) => void): Promise<ClientRequest | undefined> {
        if (app.isPackaged) {
            // 写入数据
            const url = await this.resolveResourseUrl(tag);
            // this.APP_UPDATE.info("开始下载远程更新文件", url?.href);
            const file = this.resolvePath();
            // this.APP_UPDATE.info("创建本地更新文件", file);
            if (url) {
                try {
                    const { data } = await AxiosGet({ url, responseType: "stream" }); // request(url.href)
                    const res: any = data;
                    // 获取本地写入流
                    const output = createWriteStream(file);
                    // this.APP_UPDATE.info("创建本地写入流", file);
                    // this.APP_UPDATE.once(IPCEventTypes.CANCEL_APP_UPDATE, () => {
                    //     res.destroy();
                    // });
                    res.pipe(output);
                    res.on("data", (chunk: any) => {
                        callback?.(chunk);
                    });

                    res.on("close", () => {
                        // this.APP_UPDATE.info("正在解压更新文件");
                        zip.uncompress(file.toString(), resolve(join(file.toString(), "../app/")))
                            .then((result) => {
                                // this.APP_UPDATE.success("更新完毕,请重启软件!");
                            })
                            .catch((err) => {
                                // this.APP_UPDATE.info("更新失败", err.stack);
                            });
                    });
                    return res;
                } catch (err: any) {
                    // this.APP_UPDATE.error("更新失败", err.stack);
                }
            } else {
                // this.APP_UPDATE.error("更新路径解析失败");
            }
        } else {
            // this.APP_UPDATE.warn("当前不是生产模式，不能进行更新操作");
        }
    }
}

export class Gitee extends UpdaterImpl {
    async listTags(): Promise<Tag[]> {
        const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags");
        const tags: Tag[] = [];
        for (const { name, message } of res as Tag[]) {
            tags.push({ name, message });
        }
        return tags;
    }
    async resolveResourseUrl(tag: Tag): Promise<string> {
        return `https://gitee.com/enncy/online-course-script/raw/${tag.name}/resource/ocs-app-resource.zip`;
    }

    async resolveLatestUrl(tag: Tag): Promise<string> {
        return `https://gitee.com/enncy/online-course-script/raw/${tag.name}/resource/latest.yml`;
    }
}

export class JSDelivr extends UpdaterImpl {
    async listTags(): Promise<Tag[]> {
        const { data: res } = await AxiosGet("https://data.jsdelivr.com/v1/package/npm/online-course-script");
        const tags: Tag[] = [];
        for (const v of (res as any).version) {
            tags.push({ name: v, message: "" });
        }
        return tags;
    }
    async resolveResourseUrl(tag: Tag): Promise<string> {
        return `https://cdn.jsdelivr.net/npm/online-course-script@${tag.name}/resource/ocs-app-resource.zip`;
    }

    async resolveLatestUrl(tag: Tag): Promise<string> {
        return `https://cdn.jsdelivr.net/npm/online-course-script@${tag.name}/resource/latest.yml`;
    }
}
 