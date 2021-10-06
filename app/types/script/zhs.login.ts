


export interface ZHSPhoneLogin {
    type: 5,
    phone: string,
    password: string
}

// 学号登录
export interface ZHSStudentIDLogin {
    type: 6,
    school: string,
    studentId: string,
    password: string
}


export interface ZHSOtherLogin {
    type: 7,
}
