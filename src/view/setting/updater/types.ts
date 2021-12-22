import { Button, notification, Progress } from "ant-design-vue";
import { Remote } from "@/utils/remote";

import { IconType, NotificationArgsProps } from "ant-design-vue/lib/notification";
import { unzip } from "@/utils/zip";
import { h, VNodeTypes } from "vue";
import { Gitee } from "./gitee.updater";
import { JsDelivr } from "./jsdelivr.updater";
import { TencentObjectUpdater } from "./tencent.object.updater";
import { UpdaterImpl } from "./updater";

// 需缓存的 更新信息
export interface UpdateInfos {
    // 自动更新
    autoUpdate: boolean;
    // 更新源
    updateSource: "TencentCloud" | "JsDelivr" | "Gitee" | "Github";
    // 版本
    tags: Tag[];
    // 当前版本
    currentTag?: Tag;
    // 当前版本信息
    currentLatestInfo?: LatestType;
    latestTag?: Tag;
    // 最新的版本信息
    latestInfo?: LatestType;
    // 是否需要更新
    needUpdate: boolean;
}

export interface Tag {
    name: string;
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

export function createUpdater(name: UpdateInfos["updateSource"]): UpdaterImpl {
    if (name === "TencentCloud") {
        return new TencentObjectUpdater();
    } else if (name === "Gitee") {
        return new Gitee();
    } else if (name === "JsDelivr" || name === "Github") {
        return new JsDelivr();
    } else {
        // 默认腾讯存储
        return new TencentObjectUpdater();
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
        .then(() => {
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
        .catch(() => {
            UpdateNotify("error", "解压缩失败，请重式!");
        });
}
