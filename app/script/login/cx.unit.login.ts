
import { CXLoginUtils } from '../common/login.utils';

import { OCROptions } from '../common/types';

import { Utils, WaitForScript } from "@pioneerjs/core";

import { OCR } from '../common/ocr';

import { LoginScript } from './types';
import { Runnable, Inject } from '@pioneerjs/common';

import { StoreGet } from '../../types/setting';

import { RunnableScript } from '@pioneerjs/core';
import { User } from '../../types';

export const CX_UNIT_LOGIN_NAME = 'cx-user-login'
export const CX_UNIT_LOGIN_URL = 'https://passport2.chaoxing.com/login?loginType=3&newversion=true'




@Runnable({
    name: CX_UNIT_LOGIN_NAME,

})
export class CXUnitLoginScript extends LoginScript {

    @Inject()
    waitFor!: WaitForScript;

    @Inject()
    utils!: Utils;

    @Inject()
    loginUtils!: CXLoginUtils

    async run(): Promise<void> { }

    async login(user: User): Promise<void> {
        await this.page.goto(CX_UNIT_LOGIN_URL)
        const { utils, loginUtils, waitFor } = this
        await waitFor.documentReady()
        const { unitname, uname, password } = user.loginInfo.cx.unitLogin

        await utils.value("#inputunitname", unitname)
        await utils.value('#uname', uname)
        await utils.value('#password', password)
        if (StoreGet('setting').script.account.ocr.username !== '') {
            if (await this.breakCode(StoreGet('setting').script.account.ocr)) {
                await loginUtils.login()
            } else {
                // message.info('验证码破解失败，请手动输入并点击登陆')
                await loginUtils.waitForCXLogin()
            }
        } else {
            // message.info('您暂未配置OCR，所以不能自动获取验证码，请手动输入并点击登陆')
            await loginUtils.waitForCXLogin()
        }

    }

    // 获取元素的位置信息
    private async getElementClip(selector: string) {

        return await this.page.evaluate((selector: any) => {
            const target = document.querySelector(selector)
            if (target) {
                let { x, y, width, height } = target.getBoundingClientRect() || {};
                return { x, y, width, height };
            }
        }, selector);
    }

    // 截屏保存图片进行验证码破解
    async breakCode(ocrOptions: OCROptions) {
        const { utils, waitFor, page } = this
        let clip = await this.getElementClip('#numVerCode')

        if (clip) {
            const buffer = await this.page.screenshot({ clip });
            if (buffer) {
                const code = await OCR.resolve(ocrOptions, buffer)
                if (code && code.trim() !== '') {
                    await utils.value('#vercode', code)
                    await page.click('#loginBtn')
                    await waitFor.documentReady()
                    return true
                }
            }
        }
        return false
    }
}