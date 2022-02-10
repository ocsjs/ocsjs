import { Page } from "playwright";
import { breakCode } from "../../common/break.code";
import { ocr } from "../../common/ocr";

export interface CXSchoolLoginOptions {
    unitname: string;
    uname: string;
    password: string;
    verify: {
        username: string;
        password: string;
    };
}

export async function schoolLogin(page: Page, opts: CXSchoolLoginOptions) {
    const { unitname, uname, password, verify } = opts;
    ocr;
    await page.goto("https://passport2.chaoxing.com/login?loginType=3&newversion=true");
    await page.fill("#inputunitname", unitname);
    await page.fill("#uname", uname);
    await page.fill("#password", password);

    const code = await breakCode(page, "#codeImg", verify);
 
    if (code) {
        await page.fill("#vercode", code);
    }
    await Promise.all([page.waitForNavigation(), page.click("#loginBtn")]);

    return page;
}
