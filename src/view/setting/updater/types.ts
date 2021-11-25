import { AxiosGet, AxiosPost } from "@/utils/request";
import { Version } from "app/types/version";
const yaml = require("yaml");
import { Button, notification, Progress } from "ant-design-vue";
import { ElectronVersion, Remote } from "@/utils/remote";

import { IconType, NotificationArgsProps } from "ant-design-vue/lib/notification";
import { unzip } from "@/utils/zip";
import { h, VNodeTypes } from "vue";

const { resolve, join } = require("path");
const { writeFileSync } = require("fs");

export interface Tag {
    name: string;
    message: string;
    size: number;
    latest: string;
    resource: string;
    raw: string;
}

// 更新信息文件 latest.yml 的参数类型
export interface LatestType {
    // 版本
    version: string;
    // 文件信息
    size: number;
    // 更新信息
    message: string[];
    // 发布日期
    date: number;
}

export interface TagInfo {
    date: string;
    size: string;
    url: string;
}

export interface Updater {
    listTags(): Promise<Tag[]>;
    resolveResourceUrl(tag: Tag): Promise<string>;
    resolveLatestUrl(tag: Tag): Promise<string>;
    getLatestInfo(tag: Tag): Promise<LatestType>;
}

export abstract class UpdaterImpl implements Updater {
    abstract listTags(): Promise<Tag[]>;

    // 获取资源项目路径
    abstract resolveResourceUrl(tag: Tag): Promise<string>;
    // 获取资源压缩包下载路径
    abstract resolveLatestUrl(tag: Tag): Promise<string>;

    // 获取 latest.json 信息
    async getLatestInfo(tag: Tag): Promise<LatestType> {
        const url = await this.resolveLatestUrl(tag);
        const { data } = await AxiosGet(url);
        let latest: LatestType = JSON.parse(Buffer.from(data.content, "base64").toString());
        if (typeof latest.message === "string") {
            latest.message = [latest.message];
        } else if (typeof latest.message === "object") {
            latest.message = latest.message.length === 0 ? ["暂无"] : [...latest.message];
        } else {
            latest.message = ["暂无"];
        }
        return latest;
    }

    // 是否需要更新
    async isNeedUpdate(latest: LatestType): Promise<boolean> {
        return Version.from(latest.version).greaterThan(Version.from(ElectronVersion));
    }

    // 设置亚索路径
    resolvePath(tag: Tag): string {
        return resolve(`./resources/app-${tag.name}.zip`);
    }

    //更新
    public async update(tag: Tag): Promise<void> {
        const isPack = Remote.app.get("isPackaged");

        if (isPack) {
            UpdateNotify("info", "开始更新:" + tag.name);
            // 写入数据
            const url = await this.resolveResourceUrl(tag);

            const file = this.resolvePath(tag);
            if (url) {
                try {
                    AxiosGet({
                        url,
                        // 对原生进度事件的处理
                        onDownloadProgress: function (evt: ProgressEvent) {
                            UpdateNotify(
                                "info",
                                h("span", [
                                    h("span", "下载更新包中 "),
                                    h(Progress, {
                                        percent: parseInt(Math.round((evt.loaded / tag.size) * 100).toFixed(0)),
                                    }),
                                ])
                            );
                        },
                    })
                        .then((res: any) => {
                            var buffer = Buffer.from(res.data.content, "base64");
                            UpdateNotify("info", "保存压缩包中");
                            writeFileSync(file, buffer);
                            UpdateNotify("info", "正在解压更新文件");
                            unzipResource(file, resolve(join(file, "../app/")));
                        })
                        .catch((err: any) => {
                            UpdateNotify("error", "更新失败,压缩包下载失败！ " + err.message);
                        });
                } catch (err: any) {
                    UpdateNotify("error", "更新失败 " + err.message);
                }
            } else {
                UpdateNotify("error", "更新路径解析失败");
            }
        } else {
            UpdateNotify("error", "当前不是生产模式，不能进行更新操作");
        }
    }
}

// gitee 码云 更新服务器
export class Gitee extends UpdaterImpl {
    async listTags(): Promise<Tag[]> {
        try{
            // 获取所有 tag 标签
            const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags");
            const tags: Tag[] = [];
            for (const { name, message, commit } of res as any[]) {
                // 递归获取文件树
                const { data: trees } = await AxiosGet(`https://gitee.com/api/v5/repos/enncy/online-course-script/git/trees/${commit.sha}?recursive=1`);
                let resource = "",
                    raw = "",
                    latest = "",
                    _size = 0;

                // 在资源树中寻找文件
                for (const { path, size, sha } of (trees as any).tree) {
                    if (/ocs-app-resource\.zip/.test(path)) {
                        resource = `https://gitee.com/enncy/online-course-script/blob/${name}/${path}`;
                        raw = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}`;
                        _size = size;
                    }
                    if (/latest\.json/.test(path)) {
                        latest = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}`;
                    }

                    if (resource && latest) {
                        break;
                    }
                }
                if (resource && raw && latest) {
                    tags.push({ name, message, latest, resource, size: _size, raw });
                }
            }
            return tags;
        }catch(err:any){
            UpdateNotify("error", "更新失败,可能是网络出错,或者更新太频繁，请稍后手动检测更新 : " + err.message);
            return [];
        }
    }
    async resolveResourceUrl(tag: Tag): Promise<string> {
        return tag.raw;
    }

    async resolveLatestUrl(tag: Tag): Promise<string> {
        return tag.latest;
    }
}

export function UpdateNotify(type: IconType, msg: VNodeTypes, options?: Omit<NotificationArgsProps, "type" | "message">) {
     
    const key = "update-notify";
    const commonConfig: Omit<NotificationArgsProps, "type"> = Object.assign(
        {
            duration: 0,
            placement: "bottomRight",
            key,
            message: "更新程序",
            description: msg,
            style: {
                padding: "12px",
            },
            class: "notification-message",
        },
        options
    );

    // 调用通知
    notification[type](commonConfig);
}
export function showFormatSize(size: number) {
    return size > 1024 ? (size > 1024 * 1024 ? (size / (1024 * 1024)).toFixed(2) + "MB" : (size / 1024).toFixed(2) + "KB") : size + "Byte";
}

export function unzipResource(filePath: string, dist: string) {
    unzip(filePath, dist, (rate) => {
        UpdateNotify(
            "info",
            h("span", [
                h("span", "解压中 "),
                h(Progress, {
                    percent: parseInt(Math.round(rate * 100).toFixed(0)),
                }),
            ])
        );
    })
        .then((result) => {
            UpdateNotify("success", "更新完毕,请重启软件!", {
                btn: h(
                    Button,
                    {
                        type: "primary",
                        size: "small",
                        onClick: () => {
                            Remote.app.call("relaunch");
                            Remote.app.call("quit");
                        },
                    },
                    "重启"
                ),
            });
        })
        .catch((err) => {
            UpdateNotify("error", "解压缩失败，请重式!");
        });
}
