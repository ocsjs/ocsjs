 
import { Utils, WaitForScript } from "@pioneerjs/core";
import { message } from "ant-design-vue";

import { LoginScript } from ".";
import {   User } from "../../types";
import { Runnable, Inject } from '@pioneerjs/common';
import { CXLoginUtils } from "../common/login.utils";

export const CX_PHONE_LOGIN_NAME = 'cx-phone-login'
export const CX_PHONE_LOGIN_URL = 'https://passport2.chaoxing.com/login?loginType=2&newversion=true'


@Runnable({
    name: CX_PHONE_LOGIN_NAME,
    url: CX_PHONE_LOGIN_URL
})
export class CXPhoneLoginScript extends LoginScript {

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    utils!: Utils;

    @Inject()
    loginUtils!: CXLoginUtils

    async run(): Promise<void> { }

    async login(user: User): Promise<void> {
        const { phone } = user.loginInfo.cx.phoneLogin
        const { utils, loginUtils } = this
        await utils.value('#phone', phone)
        message.info('请手动输入验证码并点击登陆')
        await loginUtils.waitForCXLogin()
    }


}