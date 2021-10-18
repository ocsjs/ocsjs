import { CXCourseScript } from "./cx/get.course";

import { RunnableScript } from "@pioneerjs/core";
import { StoreGet } from "../types/setting";
import { Pioneer } from "@pioneerjs/core";

import { AllScriptObjects } from "./common/types";
import { CXPhoneLoginScript } from "./login/cx.phone.login";
import { CXUnitLoginScript } from "./login/cx.unit.login";
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

        const pioneer = Pioneer.create(browser);

        await pioneer.startup({
            scripts: [CXUserLoginScript, CXPhoneLoginScript, CXUnitLoginScript],
            events: ["request", "response"],
        });

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

/**
 * 获取课程列表
 * @param script 需要执行的脚本类
 * @returns
 */
export async function getCXCourse<S extends RunnableScript>(script: S) {
    return new CXCourseScript(script).getCourseList();
}
