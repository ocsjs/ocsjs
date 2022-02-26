import { chromium, LaunchOptions, Page } from "playwright";
import { CX, ZHS } from ".";
import { ScriptFunction, ScriptOptions } from "./types";

export const scripts: Record<keyof ScriptOptions, ScriptFunction> = {
    "cx-login-other": CX.otherLogin,
    "cx-login-phone": CX.phoneLogin,
    "cx-login-phone-code": CX.phoneCodeLogin,
    "cx-login-school": CX.schoolLogin,
    "zhs-login-other": ZHS.otherLogin,
    "zhs-login-phone": ZHS.phoneLogin,
    "zhs-login-school": ZHS.schoolLogin,
};

export async function launchScripts(
    launchOptions: LaunchOptions,
    ...scripts: { name: keyof ScriptOptions; options: ScriptOptions[keyof ScriptOptions] }[]
) {
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
