import { Injectable } from "@pioneerjs/common";
import { InjectableScript, WaitForScript } from "@pioneerjs/core";
import { HTTPRequest } from "puppeteer-core";

export abstract class LoginUtils extends InjectableScript {
    async waitForLogin(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            await new WaitForScript(this).nextTick("requestfinished");
            if (await this.isLogin()) {
                await this.page.waitForSelector(await this.waitForSelector());
                setTimeout(() => {
                    resolve();
                }, 3000);
            } else {
                reject("登录失败！请重试！");
            }
        });
    }

    abstract isLogin(): Promise<boolean>;
    abstract login(): Promise<void>;
    abstract waitForSelector(): Promise<string>;
}

/**
 * 超星登录工具脚本
 */
@Injectable()
export class CXLoginUtils extends LoginUtils {
    async waitForSelector() {
        return "#to_top";
    }
    async isLogin() {
        return this.page.url().startsWith("http://i.mooc.chaoxing.com/space/index");
    }
    async login() {
        await Promise.all([this.waitForLogin(), this.page.click("#loginBtn")]);
    }
}

/**
 * 智慧树登录工具脚本
 */
@Injectable()
export class ZHSLoginUtils extends LoginUtils {
    async waitForSelector() {
        return ".datalist";
    }
    async isLogin() {
        return this.page.url().startsWith("https://onlineh5.zhihuishu.com/onlineWeb.html");
    }
    async login() {
        await Promise.all([this.waitForLogin(), this.page.click(".wall-sub-btn")]);
    }
}
