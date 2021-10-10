import { LoginTypes } from './index';

import { BaseLoginType } from ".";


export interface CXUserLogin extends BaseLoginType {
    type:1,
    phone: string,
    password: string
}

export interface CXPhoneLogin extends BaseLoginType  {
    type:2,
    phone: string,
}

export interface CXOrganizationLogin extends BaseLoginType  {
    type:3,
    // 学校/单位
    unitname: string,
    //学号/工号
    uname: string,
    password: string
}

export interface CXOtherLogin extends BaseLoginType  {
    type:4,
}



