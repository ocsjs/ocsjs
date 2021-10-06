import { Pioneer } from "@pioneerjs/core";
import { IpcMain } from "electron";
import { Browser } from "puppeteer-core";
import { StartPuppeteer } from "../../puppeteer";
import { CXScript } from "../../puppeteer/cx";
import { IPCEventTypes, ScriptLoginOptions } from "../../types";

 

export function ScriptsRouter(ipcMain: IpcMain) {
    
    ipcMain
        .on(IPCEventTypes.SCRIPT_LOGIN, (e: any, { script, loginConfig, ocrOptions }: ScriptLoginOptions) => {
            StartPuppeteer({
                scripts: [CXScript],
                async callback(browser: Browser, pioneer: Pioneer) {
                    const s: any = pioneer.runnableScripts?.find((s: any) => s.name === script);
                    if (s) {
                        const cx: CXScript = s;
                        await cx.index(loginConfig);
                        await cx.login(
                            loginConfig,
                            ocrOptions
                        );
                    }
                },
            });
        })

}


