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

/**
 * 等待 iframe 加载完成
 * @param frame
 */
export async function waitForFrameReady(frame: Frame): Promise<void> {
    let readyState: DocumentReadyState | undefined;
    while (readyState !== "complete") {
        await sleep(1000);
        try {
            const document = await frame.evaluateHandle("document");
            readyState = await frame.evaluate((document) => document.readyState, document);
            // eslint-disable-next-line no-empty
        } catch {}
    }
}
