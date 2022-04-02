import { message, Modal } from "ant-design-vue";
import { h } from "vue";
import { store } from "../store";
const { OCSApi } = require("@ocsjs/common") as typeof import("@ocsjs/common");

/**
 * 防抖
 * @param fn 方法
 * @param period 间隔
 */
export function debounce(fn: Function, period: number) {
    var timer: number | null = null;
    return function () {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(fn, period);
    };
}

/**
 * 检测 json 语法
 * @param jsonString json 字符串
 */
export function jsonLint(jsonString: string) {
    try {
        JSON.parse(jsonString);
    } catch (e) {
        const msg = (e as Error).message;
        const match = msg.match(/Unexpected token(.*)in JSON at position (\d+)/);
        const position = parseInt(match?.[2] || "0");
        let count = 0;
        let line = 0;
        for (const str of jsonString.split("\n")) {
            count += str.length + 1;

            if (count >= position) {
                return {
                    token: match?.[1],
                    line,
                };
            }

            line++;
        }
    }
}

export function formatDate() {
    const date = new Date();
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        date.getDate().toString().padStart(2, "0"),
    ].join("-");
}

/** 获取远程通知 */
export async function fetchRemoteNotify() {
    try {
        const infos = await OCSApi.getInfos();

        const remoteNotify = infos.notify;
        const storeNotify: typeof infos.notify = store.notify;
        /** 寻找未阅读的通知 */
        const unread = remoteNotify.filter(
            (item) => storeNotify.findIndex((localeItem) => item?.id === localeItem?.id) === -1
        );

        console.log("notify", { infos, exits: storeNotify, unread });
        if (unread.length) {
            Modal.info({
                title: () => "🎉最新公告🎉",
                okText: "朕已阅读",
                cancelText: "下次一定",
                okCancel: true,
                style: { top: "20px" },
                content: () =>
                    h(
                        "div",
                        {
                            style: {
                                maxHeight: "320px",
                                overflow: "auto",
                            },
                        },
                        unread.map((item) =>
                            h("div", [
                                h(
                                    "div",
                                    {
                                        style: {
                                            marginBottom: "6px",
                                            fontWeight: "bold",
                                        },
                                    },
                                    item?.id || "无标题"
                                ),
                                h(
                                    "ul",
                                    item.content.map((text: string) => h("li", text))
                                ),
                            ])
                        )
                    ),
                onOk() {
                    store.notify = [...store.notify].concat(unread);
                },
                onCancel() {},
            });
        }
    } catch (e) {
        message.error("最新通知获取失败：" + e);
    }
}
