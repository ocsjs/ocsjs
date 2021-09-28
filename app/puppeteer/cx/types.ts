

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