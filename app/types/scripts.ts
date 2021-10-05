import { OCROptions } from "../puppeteer/common";
 
import { LoginType, LoginConfigs } from "../puppeteer/cx/types";

export interface ScriptTypes {
    cx: string,
}

export interface ScriptLoginOptions {
    script: keyof ScriptTypes,
    type: LoginType,
    loginConfig: LoginConfigs[keyof LoginConfigs],
    ocrOptions?: OCROptions
}