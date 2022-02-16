import { Page } from "playwright";
import { waitForLogin } from "../utils";

export interface ZHSOtherLoginOptions {
    timeout: number;
}

export async function otherLogin(page: Page, opts: ZHSOtherLoginOptions) {
    const { timeout } = opts;
    await page.goto(
        "https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#signin"
    );
    await waitForLogin(page);
    return page;
}
