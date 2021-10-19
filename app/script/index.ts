 
import { RunnableScript } from "@pioneerjs/core";
import { StoreGet } from "../types/setting";
import { Pioneer } from "@pioneerjs/core";

import { AllScriptObjects } from "./common/types";
import { CXUserLoginScript } from "./login/cx.user.login";

import puppeteer from "puppeteer-core";

/**
 * 运行脚本
 * @param name 脚本名称
 * @param handler 回调函数
 * @returns
 */
export async function StartPuppeteer<S extends RunnableScript>(
    name: keyof AllScriptObjects,
    handler: (script: S | undefined) => void
) {
    let chromePath = StoreGet("setting").script.launch.binaryPath;
    if (chromePath) {
        const browser = await puppeteer.launch({
            // your chrome path
            executablePath: chromePath,
            defaultViewport: null,
            headless: false,
        });

        // 创建 pioneer
        const pioneer = Pioneer.create(browser);

        // 启动装配
        await pioneer.startup({
            scripts: [CXUserLoginScript ],
            events: ["request", "response"],
        });

        // 回调
        handler(
            pioneer.runnableScripts?.find(
                (s: any) => s.name === name
            ) as unknown as S
        );

        return pioneer;
    } else {
        console.error("找不到 chrome 路径!!!");
    }
}
 
 