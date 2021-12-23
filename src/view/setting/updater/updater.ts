import { Remote } from "@/utils/remote";
import { AxiosGet } from "@/utils/request";
import { Progress } from "ant-design-vue";

import { h } from "vue";
import { LatestType, Tag, unzipResource, UpdateNotify } from "./types";
const { resolve, join } = require("path");
const { writeFileSync } = require("fs");
import { Version } from "app/types/version";
import json from "root/package.json";

export interface Updater {
    listTags(): Promise<Tag[]>;
    resolveResourceUrl(tag: Tag): Promise<string>;
    resolveLatestUrl(tag: Tag): Promise<string>;
    getLatestInfo(tag: Tag): Promise<LatestType>;
}

export abstract class UpdaterImpl implements Updater {
    abstract listTagNames(): Promise<string[]>;

    abstract listTags(): Promise<Tag[]>;

    // 获取 latest.json 信息
    async getLatestInfo(tag: Tag): Promise<LatestType> {
        const url = await this.resolveLatestUrl(tag);
        const { data } = await AxiosGet(url);
        return data;
    }

    // 获取资源压缩包路径
    async resolveResourceUrl(tag: Tag): Promise<string> {
        return tag.raw;
    }

    // 获取 latest.json 下载路径
    async resolveLatestUrl(tag: Tag): Promise<string> {
        return tag.latest;
    }

    // 是否需要更新
    async isNeedUpdate(latest: LatestType): Promise<boolean> {
        return Version.from(latest.version).greaterThan(Version.from(json.version));
    }

    // 设置亚索路径
    resolvePath(tag: Tag): string {
        return resolve(`./resources/app-${tag.name}.zip`);
    }

    //更新
    public async update(tag: Tag, latestInfo: LatestType): Promise<void> {
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
                        responseType: "arraybuffer",
                        // 对原生进度事件的处理
                        onDownloadProgress: function (evt: ProgressEvent) {
                            UpdateNotify(
                                "info",
                                h("span", [
                                    h("span", "下载更新包中 "),
                                    h(Progress, {
                                        percent: parseInt(Math.round((evt.loaded / latestInfo.size) * 100).toFixed(0)),
                                    }),
                                ])
                            );
                        },
                    })
                        .then((res: any) => {
                            console.log("AxiosGet", res);
                            UpdateNotify("info", "保存压缩包中");
                            console.log("path ", file, "=>", resolve(join(file, "../app/")));
                            writeFileSync(file, Buffer.from(res.data));
                            UpdateNotify("info", "正在解压更新文件");
                            unzipResource(file, resolve(join(file, "../app/")));
                        })
                        .catch((err: any) => {
                            console.error(err);
                            UpdateNotify("error", "更新失败,压缩包下载失败！ " + err.message);
                        });
                } catch (err: any) {
                    console.error(err);
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
