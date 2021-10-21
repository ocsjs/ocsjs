import { Platform } from "../../script/common/types";

 
// 课程类型
export interface Course {
    // 用户 id
    uid: string;
    // 课程 id
    id: string;
    // 网课平台
    platform: keyof Platform;

    url?: string;
    selector?: string;
    img: string;
    // 简介
    profile: string;
}
