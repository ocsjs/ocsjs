
import { OCROptions } from "..";
import { CXUserLogin, CXPhoneLogin, CXOrganizationLogin, CXOtherLogin } from "./cx.login";
import { ZHSOtherLogin, ZHSPhoneLogin, ZHSStudentIDLogin } from "./zhs.login";


export interface SupportLoginPlatform {
    cx: CXLoginTypes,
    zhs: ZHSLoginTypes
}

export interface CXLoginTypes {
    "超星用户登录": CXUserLogin,
    "超星手机验证码登录": CXPhoneLogin,
    "超星机构账号登录": CXOrganizationLogin,
    "超星机手动登录": CXOtherLogin,
}

export interface ZHSLoginTypes {
    "智慧树手机号登录": ZHSPhoneLogin,
    "智慧树学号登录": ZHSStudentIDLogin,
    "智慧树手动登录": ZHSOtherLogin,
}

export type AllLoginTypes = CXLoginTypes & ZHSLoginTypes

export interface ScriptLoginOptions {
    script: keyof SupportLoginPlatform,
    loginConfig: AllLoginTypes[keyof AllLoginTypes],
    ocrOptions?: OCROptions
}


