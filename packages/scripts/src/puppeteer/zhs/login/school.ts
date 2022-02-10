import { Page } from "playwright";

export interface ZHSSchoolLoginOptions {
    /** 学校名 */
    schoolname: string;
    /** 学号 */
    code: string;
    /** 密码 */
    password: string;
}

export async function schoolLogin(page: Page, opts: ZHSSchoolLoginOptions) {
    const { schoolname, password, code } = opts;

    await page.goto(
        "https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#studentID"
    );
    await page.fill("#quickSearch", schoolname);
    // 显示学校列表
    await Promise.all([
        /** 为防止页面未加载学校数据，所以这里即可能为远程加载或者缓存读取学校记录 */
        Promise.race([
            /** 等待请求完成 */
            page.waitForResponse(/getAllSchool/),
            /** 等待元素出现 */
            page.waitForSelector("#schoolListCode li"),
        ]),
        page.evaluate("userindex.selectSchoolByName();"),
    ]);
    // 单击第一个匹配的学校
    await page.click("#schoolListCode li");
    await page.fill("#clCode", code);
    await page.fill("#clPassword", password);
    await Promise.all([page.waitForNavigation(), page.click(".wall-sub-btn")]);

    return page;
}
