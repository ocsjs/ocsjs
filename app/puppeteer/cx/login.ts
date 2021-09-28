import { Injectable } from "@pioneerjs/common";
import { InjectableScript, Utils, WaitForScript } from "@pioneerjs/core";
import { OCROptions, OCR } from "../common/ocr";
import { LoginConfigs } from "./types";
import { HTTPRequest } from 'puppeteer-core';
import { ScriptEvent } from '../common/event';
import { Status } from "../common/status.types";


@Injectable()
export class CXLogin extends InjectableScript {


    async login<K extends keyof LoginConfigs>(scriptEvent: ScriptEvent, loginConfig: LoginConfigs[K], ocrOptions?: OCROptions) {


        const { page } = this

        const utils: Utils = new Utils(this)
        const waitFor: WaitForScript = new WaitForScript(this)
        // 登录次数
        const loginTimes: any = this.context.store.get('login-times')
        if (loginTimes > 3) {
            scriptEvent.error(Status['自动登录运行超过限制次数'], '请自行输入账号密码登录！')
            this.context.store.set('login-times', 0)
            return
        } else {
            this.context.store.set('login-times', loginTimes + 1 || 0)
        }

        // 截屏保存图片进行验证码破解
        const breakCode = async (ocrOptions: OCROptions) => {
            let clip = await this.getElementClip('#numVerCode')

            if (clip) {
                const buffer = await page.screenshot({ clip });
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

        const check = async () => {
            const errs = await checkPageError()
            if (errs.length !== 0) {
                if (errs.some(e => /验证码/.test(e))) {
                    scriptEvent.error(Status['验证码破解失败'], "即将重新破解验证码");
                    await waitFor.sleep(2000)
                    await this.login(scriptEvent, loginConfig, ocrOptions)
                } else {
                    scriptEvent.error(Status['登录失败'], errs + " , 请在页面上输入登录信息，并自行点击登录")
                    await this.waitForLogin()
                }

            } else {
                if (!await this.islogin()) {
                    await this.waitForLogin()
                }
                scriptEvent.success(Status['登录成功'])
            }
        }

        // 开始登录
        if (loginConfig.type === 1) {
            await utils.value('#phone', loginConfig.phone)
            await utils.value('#pwd', loginConfig.password)
            await page.click('#loginBtn')
            await waitFor.documentReady()
            await check()
        } else if (loginConfig.type === 2) {
            await utils.value('#phone', loginConfig.phone)
            scriptEvent.warn(Status['等待用户自行登录中'], '请在页面上输入您的手机验证码，并自行点击登录')
            await this.waitForLogin()

        } else if (loginConfig.type === 3) {
            await utils.value("#inputunitname", loginConfig.unitname)
            await utils.value('#uname', loginConfig.uname)
            await utils.value('#password', loginConfig.password)
            if (ocrOptions) {
                if (await breakCode(ocrOptions)) {
                    await check()
                } else {
                    scriptEvent.error(Status['等待用户自行登录中'], '验证码破解失败！请在页面上输入验证码，并自行点击登录')
                    await this.waitForLogin()
                }
            } else {
                await this.waitForLogin()
                scriptEvent.warn(Status['等待用户自行登录中'], '请在页面上输入验证码，并自行点击登录')
            }

        }



        // 查看页面是否有错误信息
        async function checkPageError(): Promise<any[]> {
            return new Promise((resolve, reject) => {
                waitFor.nextTick('request', async () => {
                    await waitFor.documentReady()
                    const errs = await page.evaluate(() => Array.from(document.querySelectorAll('[class*=err]')).map((e: any) => e.innerText).filter(e => e && e !== ''))
                    resolve(errs)
                })
            });
        }




    }
    // 检测是否登录
    private async islogin() {
        return this.page.url().startsWith('http://i.mooc.chaoxing.com/space/index')
    }

    // 获取元素的位置信息
    private async getElementClip(selector: string) {

        return await this.page.evaluate((selector) => {
            const target = document.querySelector(selector)
            if (target) {
                let { x, y, width, height } = target.getBoundingClientRect() || {};
                return { x, y, width, height };
            }
        }, selector);
    }

    // 等待用户自己输入信息登录
    private async waitForLogin(): Promise<void> {
        return new Promise((resolve, reject) => {
            const lis = (event: HTTPRequest) => {
                if (event.resourceType() === 'document' && this.islogin()) {
                    this.page.off('request', lis)
                    resolve()
                }
            }
            this.page.on('request', lis)
        });
    }
}

