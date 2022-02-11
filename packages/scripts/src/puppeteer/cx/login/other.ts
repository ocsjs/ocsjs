import { Page } from "playwright";
import { waitForCXLogin } from "../utils";

export interface CXOtherLoginOptions {}

export async function otherLogin(page: Page, opts: CXOtherLoginOptions) {
    await page.goto("https://passport2.chaoxing.com/login?loginType=4&newversion=true");
    await waitForCXLogin(page);
    return page;
}
