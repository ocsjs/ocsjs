import { Injectable } from "@pioneerjs/common";
import { InjectableScript, WaitForScript } from "@pioneerjs/core";
import { HTTPRequest } from "puppeteer-core";

// 登录工具类
export abstract class LoginUtils extends InjectableScript {
    async waitForLogin(timeout?: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const waitFor = new WaitForScript(this);
            // 如果有最大等待时间 timout，则一直等待直到超时，否则直接判断是否登录成功
            if (timeout) {
                this.page.on("requestfinished", async (req) => {
                    if (RegExp(await this.indexUrl()).test(req.url())) {
                        await waitFor.nextTick("requestfinished");
                        await waitFor.documentReady();
                        await this.page.waitForSelector(await this.waitForSelector());
                        resolve();
                    }
                });
                setTimeout(() => {
                    reject("登录超时！");
                }, timeout);
            } else {
                await waitFor.nextTick("requestfinished");
                await waitFor.documentReady();
                if (RegExp(await this.indexUrl()).test(this.page.url())) {
                    await this.page.waitForSelector(await this.waitForSelector());
                    resolve();
                } else {
                    reject("登录失败,请重试！");
                }
            }
        });
    }

    abstract indexUrl(): Promise<string>;
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
    async indexUrl() {
        return "space/index";
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
    async indexUrl() {
        return "onlinestuh5";
    }
    async login() {
        await Promise.all([this.waitForLogin(), this.page.click(".wall-sub-btn")]);
    }
}
