import { Page } from "playwright";
import { waitForCXLogin } from "../utils";

export interface CXPhoneCodeLoginOptions {
    phone: string;
}

export async function phoneLogin(page: Page, opts: CXPhoneCodeLoginOptions) {
    const { phone } = opts;

    await page.goto("https://passport2.chaoxing.com/login?loginType=2&newversion=true");
    await page.fill("#phone", phone);
    await waitForCXLogin(page);
    return page;
}
