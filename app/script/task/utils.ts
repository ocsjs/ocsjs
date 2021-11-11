import { WaitForScript } from "@pioneerjs/core";
import { Frame } from "puppeteer-core";
import { sleep } from "../common/utils";
import { LoginScript } from "../login/types";

/**
 * 等待页面准备完毕
 * @param script
 */
export async function waitForReady(script: LoginScript) {
    const waitFor = new WaitForScript(script);
    await waitFor.documentReady();
    await waitFor.nextTick("requestfinished");
}

/**
 * 等待点击跳转
 * @param script
 * @param selector
 */
export async function waitForClickAndNavigation(script: LoginScript, selector: string) {
    await Promise.all([script.page.click(selector), waitForReady(script)]);
}

/**
 * 等待导航完毕
 * @param script
 * @param url
 */
export async function waitForNavigation(script: LoginScript, url: string) {
    await Promise.all([script.page.goto(url), waitForReady(script)]);
}

export function TimeoutTask(period: number, task: () => Promise<any>, timeout: () => Promise<void>) {
    return new Promise<any>(async (resolve, reject) => {
        let resolved = false;
        let to = setTimeout(async () => {
            if (!resolved) {
                resolved = true;
                await timeout();
                setTimeout(resolve, 3000);
            }
        }, period);

        const v = await task();

        if (!resolved) {
            clearTimeout(to);
            resolved = true;
            resolve(v);
        }
    });
}
