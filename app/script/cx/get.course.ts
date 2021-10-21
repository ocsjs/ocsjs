import { randomUUID } from "crypto";
import { ScriptOptions, WaitForScript } from "@pioneerjs/core";
import { Task } from "../../electron/task";

import { Course } from "../../types/script/course";
 
import path from "path";
import { app } from "electron";
import { CXLoginUtils } from "../common/login.utils";
import { getElementClip } from "../common/utils";
import { StoreGet } from "../../types/setting";
 
/**
 * 获取超星课程列表
 * @param script 脚本上下文
 * @returns
 */
export function getCXCourseList(script: ScriptOptions): Task<Course[]> {
    return Task.createBlockTask({
        name: "获取课程列表",
        target: async () =>
            new Promise(async (resolve, reject) => {
                // 等待页面加载
                await new WaitForScript(script).documentReady();
                // 如果已经登录
                if (new CXLoginUtils(script).isLogin()) {
                    await script.page.goto("http://mooc1-1.chaoxing.com/visit/interaction");
                    const waitFor = new WaitForScript(script);
                    // 等待页面所有请求结束
                    waitFor.nextTick("request", async () => {
                        const courses = await script.page.evaluate(() => {
                            // 获取课程信息
                            return Array.from(document.querySelectorAll("li[id*=course]"))
                                .filter((el) => !el.querySelector(".not-open-tip"))
                                .map((el: any) => ({
                                    id: '',
                                    img: el.querySelector(".course-cover > a > img").src,
                                    url: el.querySelector(".course-cover > a").href,
                                    profile: el.querySelector(".course-info").innerText,
                                }));
                        });
                        for (const course of courses) {
                            course.id = randomUUID().replace(/-/g, "")
                            let clip = await getElementClip(script.page, `img[src="${course.img}"]`);
                            if (clip) {
                                const p = path.resolve(path.join(StoreGet('setting').system.path.courseImg, `${course.id}.png`))
                                await script.page.screenshot({ clip, path: p });
                                course.img = p
                            }
                        }
                        resolve(courses);
                    });
                } else {
                    resolve([]);
                }
            }),
    });
}
