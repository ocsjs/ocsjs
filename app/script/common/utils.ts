import { Page, ScreenshotClip } from "puppeteer-core";

// 获取元素的位置信息
export async function getElementClip(page: Page, selector: string): Promise<ScreenshotClip | undefined> {
    return await page.evaluate((selector: any) => {
        const target = document.querySelector(selector);
        if (target) {
            let { x, y, width, height } = target.getBoundingClientRect() || {};
            return { x, y, width, height };
        }
    }, selector);
}

export async function sleep(period: number) {
    return await new Promise((r) => setTimeout(r, period));
}
 