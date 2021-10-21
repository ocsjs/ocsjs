import { ZHSLoginUtils } from "./../common/login.utils";
import { Utils, WaitForScript } from "@pioneerjs/core";

import { Runnable, Inject } from "@pioneerjs/common";

import { User } from "../../types";
import { LoginScript } from "./types";

export const ZHS_PHONE_LOGIN_NAME = "zhs-phone-login";
export const ZHS_PHONE_LOGIN_URL = "https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#signin";

/**
 * 超星手机登录脚本
 */
@Runnable({
    name: ZHS_PHONE_LOGIN_NAME,
})
export class ZHSPhoneLoginScript extends LoginScript<void> {
    static scriptName:string = ZHS_PHONE_LOGIN_NAME

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    utils!: Utils;

    @Inject()
    loginUtils!: ZHSLoginUtils;

    async run(): Promise<void> {}

    async login(user: User): Promise<void> {
        await this.page.goto(ZHS_PHONE_LOGIN_URL);
        const { utils, loginUtils, waitFor } = this;
        await waitFor.documentReady();
        const { phone, password } = user.loginInfo.zhs.phoneLogin;

        await utils.value("#lUsername", phone);
        await utils.value("#lPassword", password);
 
        await loginUtils.login();
    }
}
