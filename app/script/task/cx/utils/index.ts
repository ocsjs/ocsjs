import { WaitForScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { Frame, HTTPRequest, Page } from "puppeteer-core";
import { AxiosGet } from "../../../../electron/axios";
import { sleep } from "../../../common/utils";
import { LoginScript } from "../../../login/types";
import { waitForNavigation } from "../../utils";

// 超星脚本拦截
export function CXRequestScriptHook(page: Page) {
    // 开启拦截
    page.setRequestInterception(true);
    page.on("request", async (req) => {
        await requestHook(req, "videojs", (body) => {
            console.log("超星视频脚本拦截");
            return (
                body
                    .replace("mouseout", "")
                    // 解除倍速限制
                    .replace("ratechange", "")
                    // 持4,8,16倍速
                    .replace("[1, 1.25, 1.5, 2]", "[1, 1.25, 1.5, 2,4,8,16]")
                    // 视频播放完毕后发送完成请求
                    .replace("f.on('play'", "f.on('ended',()=>h('log'))\nf.on('play'")
            );
        });
        // 禁止弹窗
        await requestHook(req, "doHomeWorkNew", (body) => {
            console.log("禁止弹窗开启");
            return body.replace(/alert/g, "console.log");
        });
    });
}

/**
 * 请求拦截
 * @param req 请求
 * @param regexp 请求正则匹配
 * @param transform 请求体转换函数
 */
export async function requestHook(req: HTTPRequest, regexp: string | RegExp, transform: (body: string) => string): Promise<void> {
    if (req.response()) {
        return;
    }
    const url = req.url();
    if (RegExp(regexp).test(url)) {
        const { data } = await AxiosGet(url);
        const transformData = transform(data);
        await req.respond({
            status: 200,
            // 解除鼠标移出限制
            body: transformData,
        });
    } else {
        await req.continue();
    }
}
 