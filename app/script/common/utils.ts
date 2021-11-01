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

/**
 * @description  QuestionResolver —— 答题工具类，传入3个参数，经过处理可得出较为正确的答案
 * @param  question 问题
 * @param  answer 回答
 * @param  options 全部选项
 * @returns {number} 选项下标，如果没有正确答案返回 -1
 */

function QuestionResolver(question: string, answers: string, options: string[]):number {
    return -1
}
