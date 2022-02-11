import { Page } from "playwright";
import { setting } from ".";

export interface CXPhoneLoginOptions {
    phone: string;
    password: string;
}

export async function phoneLogin(page: Page, opts: CXPhoneLoginOptions) {
    const { phone, password } = opts;

    await page.goto("https://passport2.chaoxing.com/login?loginType=1&newversion=true");
    await page.fill("#phone", phone);
    await page.fill("#pwd", password);
    await Promise.all([page.waitForNavigation({ timeout: setting.timeout }), page.click("#loginBtn")]);

    return page;
}
