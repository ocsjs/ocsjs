import { Utils, WaitForScript } from "@pioneerjs/core";

import { Runnable, Inject } from "@pioneerjs/common";
import { CXLoginUtils } from "../common/login.utils";

import { User } from "../../types";
import { LoginScript } from "./types";
import { Task } from "../../electron/task";

export const CX_PHONE_LOGIN_NAME = "cx-phone-login";
export const CX_PHONE_LOGIN_URL = "https://passport2.chaoxing.com/login?loginType=2&newversion=true";

/**
 * 超星手机登录脚本
 */
@Runnable({
    name: CX_PHONE_LOGIN_NAME,
})
export class CXPhoneLoginScript extends LoginScript {
    static scriptName:string = CX_PHONE_LOGIN_NAME
    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    utils!: Utils;

    @Inject()
    loginUtils!: CXLoginUtils;

    async run(): Promise<void> {}

    async login(task:Task ,user: User): Promise<void> {
        await this.page.goto(CX_PHONE_LOGIN_URL);
        const { utils, loginUtils, waitFor } = this;
        await waitFor.documentReady();
        const { phone } = user.loginInfo.cx.phoneLogin;

        await utils.value("#phone", phone);
        task.warn('请手动输入验证码并点击登陆');
        await loginUtils.waitForLogin(5 * 60 * 1000);
    }
}
