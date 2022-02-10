import { Page } from "playwright";

export interface CXOtherLoginOptions {
    timeout: number;
}

export async function otherLogin(page: Page, opts: CXOtherLoginOptions) {
    const { timeout } = opts;
    await page.goto("https://passport2.chaoxing.com/login?loginType=4&newversion=true");
    await Promise.race([page.waitForURL(/space\/index/), page.waitForTimeout(timeout)]);

    return page;
}
