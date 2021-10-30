import { AxiosGet, AxiosPost } from "@/utils/request";
import { Version } from "app/types/version";
const yaml = require("yaml");
import { notification, Progress } from "ant-design-vue";
import { Remote } from "@/utils/remote";

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
    resourse: string;
    raw: string;
}

// 更新信息文件 latest.yml 的参数类型
export interface LatestType {
    // 版本
    version: string;
    // 文件信息
    size: number;
    // 更新信息
    message: string;
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
    resolveResourseUrl(tag: Tag): Promise<string>;
    resolveLatestUrl(tag: Tag): Promise<string>;
    getLatestInfo(tag: Tag): Promise<LatestType>;
}

export abstract class UpdaterImpl implements Updater {
    abstract listTags(): Promise<Tag[]>;
    abstract resolveResourseUrl(tag: Tag): Promise<string>;
    abstract resolveLatestUrl(tag: Tag): Promise<string>;

    async getLatestInfo(tag: Tag): Promise<LatestType> {
        const url = await this.resolveLatestUrl(tag);
        const { data } = await AxiosGet(url);
        var buffer = Buffer.from(data.content, "base64");

        return yaml.parse(buffer.toString());
    }

    async isNeedUpdate(latest: LatestType): Promise<boolean> {
        return Version.from(latest.version).greaterThan(Version.from(Remote.app.call("getVersion")));
    }

    resolvePath(tag: Tag): string {
        return resolve(`./resources/app-${tag.name}.zip`);
    }

    //更新
    public async update(tag: Tag): Promise<void> {
        const ispack = Remote.app.get("isPackaged");

        if (ispack) {
            // 写入数据
            const url = await this.resolveResourseUrl(tag);

            const file = this.resolvePath(tag);
            UpdateNotify("info", "创建本地更新文件:" + file);
            if (url) {
                try {
                    UpdateNotify("info", "开始下载远程更新文件:" + url);
                    const { data } = await AxiosGet({
                        url,
                        // 对原生进度事件的处理
                        onDownloadProgress: function (evt: ProgressEvent) {
                            UpdateNotify(
                                "info",
                                h("span", [
                                    h("span", "下载更新包中 "),
                                    h(Progress, {
                                        percent: parseInt(Math.round((evt.total / evt.loaded) * 100).toFixed(0)),
                                    }),
                                ])
                            );
                        },
                    });
                    var buffer = Buffer.from(data.content, "base64");
                    UpdateNotify("info", "创建本地写入流:" + file);
                    writeFileSync(file, buffer);
                    UpdateNotify("info", "正在解压更新文件");
                    upzipResource(file, resolve(join(file, "../app/")));
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

// gitee 码云 更新服务器
export class Gitee extends UpdaterImpl {
    async listTags(): Promise<Tag[]> {
        // 获取授权码
        const { data: auth } = await AxiosGet("https://auth.enncy.cn/token");
        const access_token = auth.access_token;
        // 获取所有 tag 标签
        const { data: res } = await AxiosGet("https://gitee.com/api/v5/repos/enncy/online-course-script/tags?access_token=" + access_token);
        const tags: Tag[] = [];
        for (const { name, message, commit } of res as any[]) {
            // 递归获取文件树
            const { data: trees } = await AxiosGet(`https://gitee.com/api/v5/repos/enncy/online-course-script/git/trees/${commit.sha}?recursive=1&access_token=` + access_token);
            let resourse = "",
                raw = "",
                yml = "",
                _size = 0;

            // 在资源树中寻找文件
            for (const { path, size, sha } of (trees as any).tree) {
                if (/ocs-app-resource\.zip/.test(path)) {
                    resourse = `https://gitee.com/enncy/online-course-script/blob/${name}/${path}`;
                    raw = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}?access_token=${access_token}`;
                    _size = size;
                }
                if (/latest\.(yml|yaml)/.test(path)) {
                    yml = `https://gitee.com/api/v5/repos/enncy/online-course-script/git/blobs/${sha}?access_token=${access_token}`;
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

export function UpdateNotify(type: IconType, msg: VNodeTypes) {
    console.log(msg);

    const key = "update-notify";
    const commonConfig: Omit<NotificationArgsProps, "type"> = {
        duration: 0,
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

export function upzipResource(filePath: string, dist: string) {
    unzip(filePath, dist, (rate) => {
        console.log("rate", rate);
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
            UpdateNotify("success", "更新完毕,请重启软件!");
        })
        .catch((err) => {
            UpdateNotify("error", "解压缩失败，请重式!");
        });
}
