import { OCSMessage } from './../events/ocs.event';
import { Pioneer } from "@pioneerjs/core";
import { IpcMain } from "electron";
import { Browser } from "puppeteer-core";
import { StartPuppeteer } from "../../puppeteer";
import { CXScript } from "../../puppeteer/cx";
import { IPCEventTypes, Task } from "../../types";


export function ScriptsRouter(ipcMain: IpcMain) {

    ipcMain
        .on(IPCEventTypes.SCRIPT_LOGIN, (e: any, { name, script, user, ocrOptions }: Task) => {

            const msg = new OCSMessage(script)
            StartPuppeteer({
                scripts: [CXScript],
                async callback(browser: Browser, pioneer: Pioneer) {
                    const s: any = pioneer.runnableScripts?.find((s: any) => s.name === script);
                    if (s) {
                        msg.info('任务正在启动')
                        const cx: CXScript = s;
                        await cx.index(user.loginInfo);
                        await cx.login(
                            user.loginInfo,
                            ocrOptions
                        );
                    } else {
                        msg.warn('自动登录失败，请手动登录')
                    }
                },
            });
        })

}


