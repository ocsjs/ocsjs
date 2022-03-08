import { Browser, BrowserContext, chromium, LaunchOptions, Page } from "playwright";
import { CX, ZHS } from ".";
import { ScriptFunction, ScriptOptions } from "./types";

export { LaunchOptions };

export interface Script {
    name: keyof ScriptOptions;
    options: ScriptOptions[keyof ScriptOptions];
}

export interface LaunchScriptsOptions {
    /** 数据缓存文件夹 (如果为空，则进行无痕浏览) */
    userDataDir: string | undefined;
    /** 启动参数 */
    launchOptions: LaunchOptions;
    /** 脚本列表 */
    scripts: Script[];
    /** 是否等待脚本执行，否：直接返回 browser 和 page 对象 */
    sync?: boolean;
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

/**
 * 运行脚本
 */
export async function launchScripts({ userDataDir, launchOptions, scripts, sync = true }: LaunchScriptsOptions) {
    let browser: Browser | BrowserContext;

    if (userDataDir && userDataDir !== "") {
        browser = await chromium.launchPersistentContext(userDataDir, launchOptions);
    } else {
        browser = await chromium.launch(launchOptions);
    }
    let page = await browser.newPage();

    
    if (sync) {
        for (const item of scripts) {
            page = await script(item.name, item.options)(page);
        }
    } else {
        run();
        async function run() {
            const item = scripts.shift();
            if (item) page = await script(item.name, item.options)(page);
            run();
        }
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
