import { ZHSStudentIdLoginScript } from "./../login/zhs.studentId.login";
import { ZHSPhoneLoginScript } from "./../login/zhs.phone.login";
import { CXLoginParams, User, ZHSLoginParams } from "../../types";
import { CXPhoneLoginScript } from "../login/cx.phone.login";
import { CXUnitLoginScript } from "../login/cx.unit.login";
import { CXUserLoginScript } from "../login/cx.user.login";
import { Task } from "../../electron/task";
 

export interface LoginScriptType  {
    login(task:Task,user: User): Promise<any>;
}


export interface Platform {
    cx: CXLoginParams,
    zhs: ZHSLoginParams
}

export enum PlatformAlias{
    "cx" = "超星-(学习通/尔雅/泛雅)",
    "zhs" = "智慧树-(知道)"
}

export interface AllScriptObjects {
    "cx-user-login": CXUserLoginScript;
    "cx-phone-login": CXPhoneLoginScript;
    "cx-unit-login": CXUnitLoginScript;
    "zhs-phone-login": ZHSPhoneLoginScript;
    "zhs-studentId-login": ZHSStudentIdLoginScript;
}

/**
 * 使用横杆来区分前缀
 */
export enum AllScriptAlias{
    "cx-user-login" = "超星-账号密码登录",
    "cx-phone-login" = "超星-手机验证码登录",
    "cx-unit-login" = "超星-机构登录",
    "zhs-phone-login" = "智慧树-手机登录",
    "zhs-studentId-login" = "智慧树-学号登录",
}

export function FromScriptName(script: keyof AllScriptObjects) {
    return script;
}

export function ScriptNameTransform(script: keyof AllScriptObjects) {
    return AllScriptAlias[script];
}

export interface CourseScript {
    index(...args: any[]): any;

    login(...args: any[]): any;
}

export interface Script {
    // find element
    find(...args: any[]): any;
    // execute script
    execute(...args: any[]): any;
}

export interface VideoScript extends Script {
    title: string;
    url: string;
    autoMute: boolean;
    maxPlaybackRate: number;
    playbackRate: number;
    currentTime: number;
    totalDuration: number;

    play(...args: any[]): any;
    pause(...args: any[]): any;
    setPlaybackRate(...args: any[]): any;
    update(...args: any[]): any;
    mute(...args: any[]): any;
}

// Question and Answer script
export interface QAScript extends Script {
    type: "multiple" | "single" | "judgment" | "completion";
    title: string;
    options: string[];
    getAnswer(...args: any[]): any;
    answer(...args: any[]): any;
}

export interface OCROptions {
    username: string;
    password: string;
    typeid?: string;
}
