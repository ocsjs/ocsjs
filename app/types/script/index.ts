
import { OCROptions, User } from "..";
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



export interface OtherLoginTypes {
    "手动登录": { type: -1 },
}

export type AllLoginTypes = CXLoginTypes & ZHSLoginTypes & OtherLoginTypes


export interface TaskStatus {
    startTime:number,
    url:string,
    scriptName:string,
    videos:number,
    qa:number
}

export interface Task {
    name: string,
    script: keyof SupportLoginPlatform,
    user: User,
    ocrOptions?: OCROptions
    // 是否暂停
    pasue: boolean

    // 状态
    status?: TaskStatus
}

export function typeToPlatform(type: number): keyof SupportLoginPlatform | undefined {
    if ([1, 2, 3, 4].includes(type)) {
        return "cx";
    } else if ([5, 6, 7].includes(type)) {
        return "zhs";
    }
}