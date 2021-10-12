


export interface CXUserLoginParams {
    phone: string,
    password: string
}

export interface CXPhoneLoginParams {
    phone: string,
}

export interface CXUnitLoginParams {
    // 学校/单位
    unitname: string,
    //学号/工号
    uname: string,
    password: string
}



export interface CXLoginParams {
    userLogin: CXUserLoginParams,
    phoneLogin: CXPhoneLoginParams,
    unitLogin: CXUnitLoginParams
}
