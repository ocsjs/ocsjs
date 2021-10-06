import { Runnable, Inject } from "@pioneerjs/common";
import { RunnableScript, WaitForScript } from "@pioneerjs/core";
import { CourseScript, OCSEventTypes, LoginType, LoginConfigs, OCROptions } from "../../../types";
import { OCSEvent, OCSMessage } from "../../electron/events/ocs.event";
 
import { CXLogin } from "./login";

 
@Runnable({ name: 'cx' })
export class CXScript extends RunnableScript implements CourseScript  {
    event: OCSEvent = new OCSMessage(OCSEventTypes.CX);
    loginEvnt: OCSEvent = new OCSMessage(OCSEventTypes.CX_LOGIN);

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    loginScript!: CXLogin;

    // 是否登录
    islogin: boolean = false

     
    async index(type: LoginType) {
        await this.page.goto('https://passport2.chaoxing.com/login?newversion=true&loginType=' + type.toString())
        await this.waitFor.documentReady()
    }

    async login(loginConfig: LoginConfigs[keyof LoginConfigs], ocrOptions?: OCROptions) {
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