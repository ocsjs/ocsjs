import { AllLoginTypes } from './../../types/script/index';
import { Runnable, Inject } from "@pioneerjs/common";
import { RunnableScript, WaitForScript } from "@pioneerjs/core";
import { OCSEvent, OCSMessage } from "../../electron/events/ocs.event";
import { CourseScript, OCSEventTypes, OCROptions } from "../../types";

import { CXLogin } from "./login";



@Runnable({ name: 'cx' })
export class CXScript extends RunnableScript implements CourseScript {
    event: OCSEvent = new OCSMessage(OCSEventTypes.CX);
    loginEvnt: OCSEvent = new OCSMessage(OCSEventTypes.CX_LOGIN);

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    loginScript!: CXLogin;

    // 是否登录
    islogin: boolean = false


    async index(loginType: AllLoginTypes[keyof AllLoginTypes]) {
        
        await this.page.goto('https://passport2.chaoxing.com/login?newversion=true&loginType=' + loginType.type)
        await this.waitFor.documentReady()
    }

    async login(loginConfig: AllLoginTypes[keyof AllLoginTypes], ocrOptions?: OCROptions) {
        this.loginEvnt.onSuccess((s) => {
            this.islogin = true
        })

        await this.loginScript.login(this.loginEvnt, loginConfig, ocrOptions)
    }


    async run(): Promise<void> {
        console.log("url", this.page.url());
    }
    // called when document change
    async update(): Promise<void> {
        console.log("update", this.page.url());
    }
}