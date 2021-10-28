import { AxiosGet } from "@/utils/request";
import { Version } from "app/types/version";
import { ClientRequest } from "http";
import { parse } from "yaml";
import notification, { IconType, NotificationArgsProps } from "ant-design-vue/lib/notification";
import { Remote } from "@/utils/remote";

const { resolve, join } = require("path");
const { zip } = require("compressing");
const { createWriteStream } = require("fs");
 
export interface Tag {
    name: string;
    message: string;
    size: number;
    latest: string;
    resourse: string;
    raw: string;
}

export interface TagInfo {
    date: string;
    size: string;
    url: string;
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
        return !!v && Version.from(v).greaterThan(Version.from(Remote.app.call('getVersion')));
    }
    resolvePath(): string {
        return resolve("./resources/resource.zip");
    }

    //更新
    public async update(tag: Tag, callback?: (chunk: any) => void): Promise<ClientRequest | undefined> {
        if (Remote.app.get('isPackaged')) {
            // 写入数据
            const url = await this.resolveResourseUrl(tag);
            UpdateNotify("info", "开始下载远程更新文件:" + url);
            // this.APP_UPDATE.info("开始下载远程更新文件", url?.href);
            const file = this.resolvePath();
            UpdateNotify("info", "创建本地更新文件:" + file);
            // this.APP_UPDATE.info("创建本地更新文件", file);
            if (url) {
                try {
                    const { data } = await AxiosGet({ url, responseType: "stream" }); // request(url.href)
                    const res: any = data;
                    // 获取本地写入流
                    const output = createWriteStream(file);
                    UpdateNotify("info", "创建本地写入流:" + file);
                    // this.APP_UPDATE.info("创建本地写入流", file);
                    // this.APP_UPDATE.once(IPCEventTypes.CANCEL_APP_UPDATE, () => {
                    //     res.destroy();
                    // });
                    res.pipe(output);
                    res.on("data", (chunk: any) => {
                        console.log(chunk.toString());
                        
                        callback?.(chunk);
                    });

                    // res.on("close", () => {
                    //     UpdateNotify("info", "正在解压更新文件");
                    //     // this.APP_UPDATE.info("正在解压更新文件");
                    //     zip.uncompress(file.toString(), resolve(join(file.toString(), "../app/")))
                    //         .then((result: any) => {
                    //             UpdateNotify("success", "更新完毕,请重启软件!");
                    //             // this.APP_UPDATE.success("更新完毕,请重启软件!");
                    //         })
                    //         .catch((err: { stack: string }) => {
                    //             UpdateNotify("error", "更新失败:" + err.stack);
                    //             // this.APP_UPDATE.info("更新失败", err.stack);
                    //         });
                    // });
                    return res;
                } catch (err: any) {
                    UpdateNotify("error", "更新失败:" + err.stack);
                    // this.APP_UPDATE.error("更新失败", err.stack);
                }
            } else {
                UpdateNotify("error", "更新路径解析失败");
                // this.APP_UPDATE.error("更新路径解析失败");
            }
        } else {
            UpdateNotify("error", "当前不是生产模式，不能进行更新操作");
            // this.APP_UPDATE.warn("当前不是生产模式，不能进行更新操作");
        }
    }
}

export class Gitee extends UpdaterImpl {
    async listTags(): Promise<Tag[]> {
        const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags?access_token=3876586ac17e21919e1bfcaff85a2fd8");
        const tags: Tag[] = [];
        for (const { name, message, commit } of res as any[]) {
            const { data: trees } = await AxiosGet(`https://gitee.com/api/v5/repos/enncy/online-course-script/git/trees/${commit.sha}?recursive=1&access_token=3876586ac17e21919e1bfcaff85a2fd8`);
            let resourse = "",
                raw = "",
                yml = "",
                _size = 0;

            // 在资源树中寻找文件
            for (const { path, size } of (trees as any).tree) {
                if (/ocs-app-resource\.zip/.test(path)) {
                    resourse = `https://gitee.com/enncy/online-course-script/blob/${name}/${path}`;
                    raw = `https://gitee.com/enncy/online-course-script/raw/${name}/${path}`;
                    _size = size;
                }
                if (/latest\.(yml|yaml)/.test(path)) {
                    yml = path;
                }
                if (resourse && yml) {
                    break;
                }
            }
            if (resourse && raw && yml) {
                tags.push({ name, message, latest: yml, resourse, size: _size, raw });
                break;
            }
        }
        return tags;
    }
    async resolveResourseUrl(tag: Tag): Promise<string> {
        return tag.raw;
    }

    async resolveLatestUrl(tag: Tag): Promise<string> {
        return tag.latest;
    }
}

// export class JSDelivr extends UpdaterImpl {
//     async listTags(): Promise<Tag[]> {
//         const { data: res } = await AxiosGet("https://data.jsdelivr.com/v1/package/npm/online-course-script");
//         const tags: Tag[] = [];
//         for (const v of (res as any).version) {
//             tags.push({ name: v, message: "", commit });
//         }
//         return tags;
//     }
//     async resolveResourseUrl(tag: Tag): Promise<string> {
//         return `https://cdn.jsdelivr.net/npm/online-course-script@${tag.name}/resource/ocs-app-resource.zip`;
//     }

//     async resolveLatestUrl(tag: Tag): Promise<string> {
//         return `https://cdn.jsdelivr.net/npm/online-course-script@${tag.name}/resource/latest.yml`;
//     }
// }

export function UpdateNotify(type: IconType, msg: string) {
    const key = "update-notify";
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        duration: 5,
        placement: "bottomRight",
        key,
        message: msg,
        description: "更新程序",
        style: {
            padding: "12px",
        },
        class: "notification-message",
        onClose: () => {
            notification.close(key);
        },
    };
    // 调用通知
    notification[type](commonConfig);
}
export function showFomatSize(size: number) {
    return size > 1024 ? (size > 1024 * 1024 ? (size / (1024 * 1024)).toFixed(2) + "MB" : (size / 1024).toFixed(2) + "KB") : size + "Byte";
}