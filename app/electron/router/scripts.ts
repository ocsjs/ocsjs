import { getCXCourse, StartPuppeteer } from "../../script/index";
import { AllScriptObjects } from "../../script/types";
import { User } from "../../types";
import { Course } from "../../types/script/course";

/**
 * 脚本映射实现，使用此类当做 typeof 类型并且远程映射到渲染进程。具体看 remote.ts
 */
export const ScriptRemote = {
    /**
     * 登录脚本
     * @param name 需要执行的登录脚本类型
     * @param user 需要运行的账号
     * @returns
     */
    login(
        name: keyof AllScriptObjects,
        user: User
    ): Promise<Course[] | undefined> {
        return new Promise((resolve) => {
            StartPuppeteer<any>(name, async (script) => {
                if (script) {
                    console.log("user", user);
                    console.log("script", name);
                    await script.login(user);
                    const c = await getCXCourse(script);
                    console.log("getCourse", c);

                    resolve(c);
                }
            });
        });
    },
};
