import { Page } from "playwright";
import { waitForLogin } from "../utils";

export interface CXOtherLoginOptions {}

export async function otherLogin(page: Page, opts: CXOtherLoginOptions) {
    await page.goto("https://passport2.chaoxing.com/login?loginType=4&newversion=true");
    await waitForLogin(page);
    return page;
}
