import { IPCEventTypes } from './../events/index';

import { Browser } from 'puppeteer-core';
import { Pioneer } from '@pioneerjs/core';
import { IpcMain } from "electron";
import { StartPuppeteer } from "../../puppeteer";
import { CXScript } from "../../puppeteer/cx";
import { LoginConfigs, LoginType } from "../../puppeteer/cx/types";
import { OCROptions } from '../../puppeteer/common/index';
import {info} from 'electron-log';


export interface ScriptTypes {
    cx: CXScript,
}

export interface ScriptLoginOptions {
    script: keyof ScriptTypes,
    type: LoginType,
    loginConfig: LoginConfigs[keyof LoginConfigs],
    ocrOptions?: OCROptions
}

export function ScriptsRouter(ipcMain: IpcMain) {
    info("ScriptsRouter");
    
    ipcMain
        .on(IPCEventTypes.SCRIPT_LOGIN, (e: any, { script, type, loginConfig, ocrOptions }: ScriptLoginOptions) => {
            StartPuppeteer({
                scripts: [CXScript],
                async callback(browser: Browser, pioneer: Pioneer) {
                    const s: any = pioneer.runnableScripts?.find((s: any) => s.name === script);
                    if (s) {
                        const cx: CXScript = s;
                        await cx.index(type);
                        await cx.login(
                            loginConfig,
                            ocrOptions
                        );
                    }
                },
            });
        })

}


