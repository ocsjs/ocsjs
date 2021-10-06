 
export interface ScriptTypes {
    cx: string,
}

export interface ScriptLoginOptions {
    script: keyof ScriptTypes,
    type: LoginType,
    loginConfig: LoginConfigs[keyof LoginConfigs],
    ocrOptions?: OCROptions
}



export enum LoginType {

    "用户登录" = 1,
    "手机验证码登录" = 2,
    "机构账号登录" = 3,
}

export interface LoginConfigs {
    userLogin: {
        type:1,
        phone: string,
        password: string
    },
    phoneLogin: {
        type:2,
        phone: string,
    },
    organizationLogin: {
        type:3,
        // 学校/单位
        unitname: string,
        //学号/工号
        uname: string,
        password: string
    }
}


 

export interface CourseScript {
 
    index(...args: any[]): any

    login(...args: any[]): any
 
}
 
export interface Script {
    // find element
    find(...args: any[]): any
    // execute script
    execute(...args: any[]): any

}
 

export interface VideoScript extends Script {
    title: string
    url: string
    autoMute: boolean
    maxPlaybackRate: number
    playbackRate: number
    currentTime: number
    totalDuration: number

    play(...args: any[]): any
    pause(...args: any[]): any
    setPlaybackRate(...args: any[]): any
    update(...args: any[]): any
    mute(...args: any[]): any
}


// Question and Answer script
export interface QAScript extends Script {
    type: 'multiple' | 'single' | 'judgment' | 'completion'
    title: string,
    options: string[]
    getAnswer(...args: any[]): any
    answer(...args: any[]): any
}



export interface OCROptions {
    username: string,
    password: string,
    typeid?: string
}