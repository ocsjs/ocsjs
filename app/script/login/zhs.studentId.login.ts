import { ZHSLoginUtils } from "./../common/login.utils";
import { Utils, WaitForScript } from "@pioneerjs/core";

import { Runnable, Inject } from "@pioneerjs/common";

import { User } from "../../types";
import { LoginScript } from "./types";
import { Task } from "../../electron/task";

export const ZHS_STUDENTID_LOGIN_NAME = "zhs-studentId-login";
export const ZHS_STUDENTID_LOGIN_URL = "https://passport.zhihuishu.com/login?service=https://onlineservice.zhihuishu.com/login/gologin#studentID";

/**
 * 超星手机登录脚本
 */
@Runnable({
    name: ZHS_STUDENTID_LOGIN_NAME,
})
export class ZHSStudentIdLoginScript extends LoginScript<void> {
    static scriptName:string = ZHS_STUDENTID_LOGIN_NAME

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    utils!: Utils;

    @Inject()
    loginUtils!: ZHSLoginUtils;

    async run(): Promise<void> {}

    async login(task:Task<void>,user: User): Promise<void> {
        await this.page.goto(ZHS_STUDENTID_LOGIN_URL);
        const { utils, loginUtils, waitFor } = this;
        await waitFor.documentReady();
        const { school, studentId, password } = user.loginInfo.zhs.studentIdLogin;

        await utils.value("#quickSearch", school);
        await utils.value("#clCode", studentId);
        await utils.value("#clPassword", password);
 
        await loginUtils.login();
    }
}
