import { AxiosGet, AxiosPost } from "@/utils/request";
import { Version } from "app/types/version";
import { ClientRequest } from "http";
const { parse } = require("yaml");
import { notification } from "ant-design-vue";
import { Remote } from "@/utils/remote";

import { IconType, NotificationArgsProps } from "ant-design-vue/lib/notification";

const compressing = require("compressing");
const { resolve, join } = require("path");
const { writeFileSync } = require("fs");

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
        const url = await this.resolveLatestUrl(tag);

        const { data } = await AxiosGet(url);

        const v = parse(data).version;
        return !!v && Version.from(v).greaterThan(Version.from(Remote.app.call("getVersion")));
    }
    resolvePath(): string {
        return resolve("./resources/resource.zip");
    }

    //更新
    public async update(tag: Tag, callback?: (chunk: any) => void): Promise<ClientRequest | undefined> {
        console.log("update", tag);
        const ispack = Remote.app.get("isPackaged");
        console.log("ispack", ispack);

        if (ispack) {
            // 写入数据
            const url = await this.resolveResourseUrl(tag);
            UpdateNotify("info", "开始下载远程更新文件:" + url);

            const file = this.resolvePath();
            UpdateNotify("info", "创建本地更新文件:" + file);

            if (url) {
                try {
                    const { data } = await AxiosGet({ url }); // request(url.href)

                    var buffer = Buffer.from(data.content, "base64");

                    const res: any = data;
                    // 获取本地写入流

                    UpdateNotify("info", "创建本地写入流:" + file);

                    writeFileSync(file, buffer);

                    UpdateNotify("info", "正在解压更新文件");
                    console.log("compressing.zip.uncompress", compressing?.zip?.uncompress);

                    compressing.zip
                        .uncompress(file.toString(), resolve(join(file.toString(), "../app/")))
                        .then((result: any) => {
                            UpdateNotify("success", "更新完毕,请重启软件!");
                        })
                        .catch((err: { stack: string }) => {
                            UpdateNotify("error", "更新失败:" + err.stack);
                        });

                    return res;
                } catch (err: any) {
                    UpdateNotify("error", "更新失败:" + err.stack);
                }
            } else {
                UpdateNotify("error", "更新路径解析失败");
            }
        } else {
            UpdateNotify("error", "当前不是生产模式，不能进行更新操作");
        }
    }
}

export class Gitee extends UpdaterImpl {
    async listTags(): Promise<Tag[]> {
        const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags");
        const tags: Tag[] = [];
        for (const { name, message, commit } of res as any[]) {
            const { data: trees } = await AxiosGet(`https://gitee.com/api/v5/repos/enncy/online-course-script/git/trees/${commit.sha}?recursive=1`);
            let resourse = "",
                raw = "",
                yml = "",
                _size = 0;

            // 在资源树中寻找文件
            for (const { path, size, sha } of (trees as any).tree) {
                if (/ocs-app-resource\.zip/.test(path)) {
                    resourse = `https://gitee.com/enncy/online-course-script/blob/${name}/${path}`;
                    raw = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}`;
                    _size = size;
                }
                if (/latest\.(yml|yaml)/.test(path)) {
                    yml = `https://gitee.com/enncy/online-course-script/raw/${name}/${path}`;
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
export function UpdateNotify(type: IconType, msg: string) {
    console.log(msg);

    const key = "update-notify";
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        duration: 5,
        placement: "bottomRight",
        key,
        message: "更新程序",
        description: msg,
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
