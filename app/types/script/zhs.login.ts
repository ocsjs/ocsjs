


export interface ZHSPhoneLoginParams {

    phone: string,
    password: string
}

// 学号登录
export interface ZHSStudentIDLoginParams {

    school: string,
    studentId: string,
    password: string
}


export interface ZHSLoginParams {
    phoneLogin: ZHSPhoneLoginParams,
    studentIdLogin: ZHSStudentIDLoginParams
}
