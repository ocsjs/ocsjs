import { Page } from "playwright";
import { URLSearchParams } from "url";

/**
 * 进入学习页面
 * @param page
 * @param url 课程首页
 */
export async function gotoStudyPage(page: Page, url: string) {
    const params = new URLSearchParams(url);
    params.set("pageHeader", "1");
    await page.goto(params.toString());
    const frame = page.frame("frame_content-zj");

    if (frame) {
        await Promise.all([page.waitForNavigation(), frame.click("[onclick*='toOld']")]);
    }

    return page;
}

/**
 * 进入作业页面
 * @param page
 * @param url 课程首页
 */
export async function gotoHomeworkPage(page: Page, url: string) {
    const params = new URLSearchParams(url);
    params.set("pageHeader", "8");
    await page.goto(params.toString());
    return page;
}

/**
 * 进入考试页面
 * @param page
 * @param url 课程首页
 */
export async function gotoExamPage(page: Page, url: string) {
    const params = new URLSearchParams(url);
    params.set("pageHeader", "9");
    await page.goto(params.toString());
    return page;
}
