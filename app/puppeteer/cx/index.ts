import { OCROptions } from './../common/ocr';
import { DataCollector, ExamScript } from '../common/index';
import { RunnableScript, WaitForScript } from "@pioneerjs/core";
import { Runnable, Inject } from '@pioneerjs/common';
import { ChapterTestScript, CourseScript, StudyScript } from "../common";
import { LoginConfigs, LoginType } from './types';
import { CXLogin } from './login';
import { ScriptEvent } from '../common/event';

@Runnable({ name: 'cx' })
export class CXScript extends RunnableScript implements CourseScript, StudyScript, ChapterTestScript, ExamScript, DataCollector {
    scriptEvent: ScriptEvent = new ScriptEvent(this.name);

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    loginScript!: CXLogin;

    islogin: boolean = false

    getCourseList(...arg: any[]) {
        throw new Error('Method not implemented.');
    }

    async intoChapterTestPage() {
        throw new Error('Method not implemented.');
    }
    async intoEaxmPage() {
        throw new Error('Method not implemented.');
    }

    async intoStudyPage() {
        throw new Error("Method not implemented.");
    }

    async index(type: LoginType) {
        await this.page.goto('https://passport2.chaoxing.com/login?newversion=true&loginType=' + type.toString())
        await this.waitFor.documentReady()
    }

    async login<K extends keyof LoginConfigs>(loginConfig: LoginConfigs[K], ocrOptions?: OCROptions) {
        this.scriptEvent.onSuccess((v, s) => {
            this.islogin = true
        })

        await this.loginScript.login(this.scriptEvent, loginConfig, ocrOptions)
    }

    async logout() {
        throw new Error("Method not implemented.");
    }



    async run(): Promise<void> {
        console.log("url", this.page.url());
    }
    // called when document change
    async update(): Promise<void> {
        console.log("update", this.page.url());
    }
}