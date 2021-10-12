
import { Pioneer } from '@pioneerjs/core';

import puppeteer from 'puppeteer-core';


import { CXUserLoginScript } from "./login/cx.user.login";
import { CXPhoneLoginScript } from "./login/cx.phone.login";
import { CXUnitLoginScript } from "./login/cx.unit.login";
import { AllScriptObjects, FromScriptName } from "./common/types";
import { RunnableScript, InjectableScript } from "@pioneerjs/core";
import { Inject, Injectable, Runnable } from '@pioneerjs/common';
import { StoreGet } from "../types/setting";
import { LoginScript } from './login';

export { CXUserLoginScript, CXPhoneLoginScript, CXUnitLoginScript, AllScriptObjects, RunnableScript, InjectableScript, FromScriptName, Inject, Injectable, Runnable, LoginScript }

export async function StartPuppeteer<S extends RunnableScript>(name: keyof AllScriptObjects, handler: (script: S | undefined) => void) {
    let chromePath = StoreGet('setting').script.launch.binaryPath
    if (chromePath) {
        const browser = await puppeteer.launch({
            // your chrome path
            executablePath: chromePath,
            defaultViewport: null,
            headless: false,
        })

        const pioneer = Pioneer.create(browser)

        await pioneer.startup({
            scripts: [CXUserLoginScript, CXPhoneLoginScript, CXUnitLoginScript],
            events: ['request', "response"],
        })

        handler((pioneer.runnableScripts?.find((s: any) => s.name === name) as unknown as S))

        return pioneer
    } else {
        console.error('找不到 chrome 路径!!!');
    }
}