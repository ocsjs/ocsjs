import { RunnableScript } from "@pioneerjs/core";
import { StoreGet } from "../types/setting";
import { Pioneer } from "@pioneerjs/core";

import { AllScriptObjects } from "./common/types";
import { CXUserLoginScript } from "./login/cx.user.login";

import puppeteer from "puppeteer-core";
import { CXPhoneLoginScript } from "./login/cx.phone.login";
import { CXUnitLoginScript } from "./login/cx.unit.login";
import { ZHSPhoneLoginScript } from "./login/zhs.phone.login";
import { ZHSStudentIdLoginScript } from "./login/zhs.studentId.login";
import { logger } from "../types/logger";
const { info: requestInfo } = logger("pioneer-request");
const { info: navigationInfo } = logger("pioneer-navigation");
/**
 * 运行脚本
 * @param name 脚本名称
 * @param handler 回调函数
 * @returns
 */
export async function StartScript<S extends RunnableScript>(name: keyof AllScriptObjects): Promise<S | undefined> {
    let chromePath = StoreGet("setting").script.launch.binaryPath;
    if (chromePath) {
        const browser = await puppeteer.launch({
            // your chrome path
            executablePath: chromePath,
            defaultViewport: null,
            headless: false,
            // 关闭同源策略
            args: [
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process", // 很关键...
            ],
        });

        // 创建 pioneer
        const pioneer = Pioneer.create(browser);
        const script = [CXUserLoginScript, CXPhoneLoginScript, CXUnitLoginScript, ZHSPhoneLoginScript, ZHSStudentIdLoginScript].find((s) => s.scriptName === name);
        if (script) {
            // 启动装配
            await pioneer.startup({
                scripts: [script],
                events: ["request", "response", "frameattached", "framedetached", "framenavigated"],
            });
        }
        const s = pioneer.runnableScripts?.find((s: any) => s.name === name) as unknown as S;
        s.page.on("request", (req) => {
            if (["document",'xhr'].includes(req.resourceType())) {
                requestInfo({
                    url:req.url(),
                    method:req.method(),
                    type:req.resourceType(),
                    postData:req.postData(),
                });
            }
            
        });

        s.page.on('load',()=>{
            navigationInfo(s.page.url())
        })

        return s;
    } else {
        console.error("找不到 chrome 路径!!!");
    }
}
