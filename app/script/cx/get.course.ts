
import { Injectable } from '@pioneerjs/common';
import { InjectableScript, WaitForScript } from "@pioneerjs/core";

import { Course } from "../../types/script/course";

import { CXLoginUtils } from "../common/login.utils";


@Injectable()
export class CXCourseScript extends InjectableScript {

    getCourseList(): Promise<Course[]> {

        return new Promise(async (resolve, reject) => {
            await new WaitForScript(this).documentReady()
            if (new CXLoginUtils(this).isLogin()) {
                await this.page.goto('http://mooc1-1.chaoxing.com/visit/interaction')
                const waitFor = new WaitForScript(this)
                waitFor.nextTick('request', async () => {
                    resolve(await this.page.evaluate(() => {

                        return Array.from(document.querySelectorAll('li[id*=course]'))
                            .filter(el => !el.querySelector(".not-open-tip"))
                            .map((el: any) => ({
                                img: el.querySelector('.course-cover > a > img').src,
                                url: el.querySelector('.course-cover > a').href,
                                profile: el.querySelector('.course-info').innerText
                            }))
                    }))

                })


            } else {
                resolve([])
            }
        });

    }

}








