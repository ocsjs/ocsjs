import { Injectable } from "@pioneerjs/common";
import { InjectableScript } from "@pioneerjs/core";
import { HTTPRequest } from "puppeteer-core";

/**
 * 超星登录工具脚本
 */
@Injectable()
export class CXLoginUtils extends InjectableScript {
    async waitForCXLogin(): Promise<void> {
        return new Promise((resolve, reject) => {
            const handler = (event: HTTPRequest) => {
                if (event.resourceType() === "document" && this.isLogin()) {
                    this.page.off("request", handler);
                    resolve();
                }
            };
            this.page.on("request", handler);
        });
    }

    isLogin() {
        return this.page.url().startsWith("http://i.mooc.chaoxing.com/space/index");
    }

    async login() {
        await Promise.all([this.waitForCXLogin(), this.page.click("#loginBtn")]);
    }
}
