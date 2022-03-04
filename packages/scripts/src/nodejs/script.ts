import { chromium, LaunchOptions, Page } from "playwright";
import { CX, ZHS } from ".";
import { ScriptFunction, ScriptOptions } from "./types";

export { LaunchOptions };
export interface Script {
    name: keyof ScriptOptions;
    options: ScriptOptions[keyof ScriptOptions];
}

export const scripts: Record<keyof ScriptOptions, ScriptFunction> = {
    "cx-login-other": CX.otherLogin,
    "cx-login-phone": CX.phoneLogin,
    "cx-login-phone-code": CX.phoneCodeLogin,
    "cx-login-school": CX.schoolLogin,
    "zhs-login-other": ZHS.otherLogin,
    "zhs-login-phone": ZHS.phoneLogin,
    "zhs-login-school": ZHS.schoolLogin,
};

export const scriptNames = [
    ["cx-login-other", "超星手动登录"],
    ["cx-login-phone", "超星手机密码登录"],
    ["cx-login-phone-code", "超星手机验证码登录"],
    ["cx-login-school", "超星学校登录"],
    ["zhs-login-other", "智慧树手动登录"],
    ["zhs-login-phone", "智慧树手机登录"],
    ["zhs-login-school", "智慧树学校登录"],
];

export async function launchScripts(launchOptions: LaunchOptions, ...scripts: Script[]) {
    const browser = await chromium.launch(launchOptions);
    let page = await browser.newPage();

    for (const item of scripts) {
        page = await script(item.name, item.options)(page);
    }

    return {
        browser,
        page,
    };
}

export function script<T extends keyof ScriptOptions>(name: T, options: ScriptOptions[T]) {
    return function (page: Page) {
        return scripts[name](page, options);
    };
}
