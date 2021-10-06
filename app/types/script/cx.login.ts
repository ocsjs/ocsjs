 
export interface CXUserLogin {
    type:1,
    phone: string,
    password: string
}

export interface CXPhoneLogin {
    type:2,
    phone: string,
}

export interface CXOrganizationLogin {
    type:3,
    // 学校/单位
    unitname: string,
    //学号/工号
    uname: string,
    password: string
}

export interface CXOtherLogin{
    type:4,
}

 

