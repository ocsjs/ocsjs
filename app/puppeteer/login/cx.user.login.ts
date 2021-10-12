
import { Utils, WaitForScript } from "@pioneerjs/core";

import { LoginScript } from ".";
import { Runnable, Inject } from '@pioneerjs/common';
import { User } from "../../types";

import { CXLoginUtils } from "../common/login.utils";


export const CX_USER_LOGIN_URL = 'https://passport2.chaoxing.com/login?loginType=1&newversion=true'
export const CX_USER_LOGIN_NAME = 'cx-user-login'



@Runnable({
    name: CX_USER_LOGIN_NAME,
    url: CX_USER_LOGIN_URL
})
export class CXUserLoginScript extends LoginScript {

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    utils!: Utils;

    @Inject()
    loginUtils!: CXLoginUtils

    async run(): Promise<void> { }

    async login(user: User): Promise<void> {
        const { phone, password } = user.loginInfo.cx.userLogin
        const { utils, loginUtils } = this
        await utils.value('#phone', phone)
        await utils.value('#pwd', password)
        await loginUtils.login()
    }

}