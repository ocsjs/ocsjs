import { Page } from "playwright";

export interface ZHSOtherLoginOptions {
    timeout: number;
}

export async function otherLogin(page: Page, opts: ZHSOtherLoginOptions) {
    const { timeout } = opts;
    await page.goto(
        "https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#signin"
    );
    await Promise.race([page.waitForURL(/onlinestuh5/), page.waitForTimeout(timeout)]);

    return page;
}
