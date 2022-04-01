import { Page } from "playwright";

/**
 * 进入学习页面
 * @param page
 * @param url 课程首页
 */
export async function gotoStudyPage(page: Page, url: string) {
    await page.goto(url);
    return page;
}

/**
 * 进入作业页面
 * @param page
 * @param url 课程首页
 */
export async function gotoHomeworkPage(page: Page, url: string) {
    page = await gotoStudyPage(page, url);
    await page.click(".box-right > ul > li:nth-child(2)");
    return page;
}

/**
 * 进入考试页面
 * @param page
 * @param url 课程首页
 */
export async function gotoExamPage(page: Page, url: string) {
    page = await gotoStudyPage(page, url);
    await page.click(".box-right > ul > li:nth-child(2)");
    return page;
}
