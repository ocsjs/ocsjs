import { AllScriptObjects } from './../script/common/types';
 
import { ZHSLoginParams } from './script/zhs.login';
 
import {   CXLoginParams } from './script/cx.login';
import { Course } from './script/course';


// 系统设置
export interface SystemSetting {
    win: {
        isAlwaysOnTop: boolean
    }
    path: {
        userData: string
        logs: string
    }
}
// 自动更新设置
export interface UpdateSetting {
    autoUpdate: boolean,
    hour: number,
    // 上一次检测更新时间
    lastTime: number
}


export interface CommonSetting {
    // 最大任务数量
    task: {
        maxTasks: number,
    }

}
// 脚本设置
export interface ScriptSetting {
    // 启动设置
    launch: {
        // 浏览器执行路径
        binaryPath: string,
    }
    // 脚本设置
    script: {
        video: boolean
        qa: boolean
    },
    // 信息设置
    account: {
        // 查题码
        queryToken: string,
        // ocr 设置
        ocr: {
            username: string,
            password: string
        }
    }

}
export interface Setting {
    system: SystemSetting
    update: UpdateSetting
    common: CommonSetting
    script: ScriptSetting
}



export interface User {
    uid: string
    // 登录平台
    platform: keyof User['loginInfo'],
    // 登录参数
    params: keyof CXLoginParams | keyof ZHSLoginParams
    // 需求启动的登录程序
    loginScript: keyof AllScriptObjects
    // 自动登录类型
    loginInfo: {
        cx: CXLoginParams,
        zhs: ZHSLoginParams
    }
    course: Course[],
    // 用户名
    name: string
    // 上次登录时间
    loginTime: number
    // 创建时间
    createTime: number
    // 修改时间
    updateTime: number
    // 逻辑删除
    delete: boolean

}


export interface StoreSchema {
    setting: Setting
    users: User[]
    task: any[]
}