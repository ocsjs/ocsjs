import { AllScriptObjects, Platform } from "./../script/common/types";

import { Course } from "./script/course";
import { Task } from "../electron/task";
import { BaseTask } from "../electron/task/types";

// 系统设置
export interface SystemSetting {
    win: {
        isAlwaysOnTop: boolean;
    };
    path: {
        userData: string;
        logs: string;
        // 课程图片缓存
        courseImg: string;
    };
}
// 自动更新设置
export interface UpdateSetting {
    autoUpdate: boolean;
    hour: number;
    // 上一次检测更新时间
    lastTime: number;
}

export interface CommonSetting {
    // 最大任务数量
    task: {
        maxTasks: number;
    };
}

// 脚本音视频设置
export interface ScriptMediaSetting {
    // 是否开启
    enable: boolean;
    // 倍速
    playbackRate: number;
    // 静音
    mute: boolean;
}

// 脚本自动答题统一设置
export interface ScriptQASetting {
    // 是否开启
    enable: boolean;
    // 自动提交
    autoReport: boolean;
}

// 脚本设置
export interface ScriptSetting {
    // 启动设置
    launch: {
        // 浏览器执行路径
        binaryPath: string;
    };
    // 脚本设置
    script: {
        // 任务间隔时间
        taskPeriod: number;

        // cx 脚本配置
        cx: {
            // 视频，音频
            media: ScriptMediaSetting;

            // ppt, word
            ppt: boolean;
            // 书本
            book: boolean;

            // 自动答题, QA 就是 Question and Answer
            qa: ScriptQASetting;
            // 自动做作业
            work: ScriptQASetting;
            // 自动考试
            exam: ScriptQASetting;
        };
        // zhs 脚本配置
        zhs: {
            // 脚本自动停止计时
            autoStop: number;

            // 视频
            video: ScriptMediaSetting;

            // 自动答题, QA 就是 Question and Answer
            qa: ScriptQASetting;

            // 自动做作业
            work: ScriptQASetting;
            // 自动考试
            exam: ScriptQASetting;
        };
    };
    // 信息设置
    account: {
        // 查题码
        queryToken: string;
        // ocr 设置
        ocr: {
            username: string;
            password: string;
        };
    };
}
export interface Setting {
    version: string;
    system: SystemSetting;
    update: UpdateSetting;
    common: CommonSetting;
    script: ScriptSetting;
}

export interface User {
    uid: string;

    // 需求启动的登录程序
    loginScript: keyof AllScriptObjects;
    // 登录平台
    platform: keyof Platform;
    // 自动登录参数配置
    loginInfo: Platform;
    courses: Course[];
    // 用户名
    name: string;
    // 上次登录时间
    loginTime: number;
    // 创建时间
    createTime: number;
    // 修改时间
    updateTime: number;
    // 逻辑删除
    delete: boolean;
}

export interface StoreSchema {
    setting: Setting;
    users: User[];
    tasks: BaseTask<any>[];
}
