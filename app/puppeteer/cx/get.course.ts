 
import { Injectable } from "@pioneerjs/common";
import { InjectableScript } from "@pioneerjs/core";
import { message } from "ant-design-vue";
import { Course } from "../../types/script/course";
 
import { CXLoginUtils } from "../common/login.utils";


@Injectable()
export class CXCourseScript extends InjectableScript {

    async getCourseList(): Promise<Course[]> {

        if (new CXLoginUtils(this).isLogin()) {

        } else {
            message.info('获取课程失败，当前页面不是超星个人首页')
        }

        return []
    }

}








