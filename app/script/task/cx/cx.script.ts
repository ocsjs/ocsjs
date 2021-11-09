import { WaitForScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { Frame, HTTPRequest } from "puppeteer-core";
import { ScriptSetting } from "../../../types";
import { Course } from "../../../types/script/course";
import { StoreGet } from "../../../types/setting";
import { sleep } from "../../common/utils";
import { CXRequestScriptHook } from "./utils";
import { MediaScript } from "./utils/media.script";
import { PPTScript } from "./utils/ppt.script";
import { ReadBookScript } from "./utils/read.book.script";
import { QAScript } from "./utils/qa.script";
import { LoginScript } from "../../login/types";
import { RunnableTask } from "../../../electron/task/runnable.task";
import { ScriptTask } from "../../../electron/task/script.task";
import { waitForNavigation, waitForClickAndNavigation, waitForFrameReady, TimeoutTask } from "../utils";
import { createHash } from "crypto";
import { debounce } from "lodash";

export function CXCourseEntry(course: Course): ScriptTask<void> {
    return ScriptTask.createScript({
        name: "超星课程入口",
        timeout: 60 * 1000,
        target: async function ({ task, script }) {
            // 进入学习页面首页
            if (course.url) await waitForNavigation(script, course.url);
            else if (course.selector) {
                await waitForClickAndNavigation(script, course.selector);
            } else {
                throw new Error("脚本运行失败: 课程链接或课程元素为空，请重新获取课程!");
            }
        },
    });
}

/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function CXScript(): ScriptTask<void> {
    return ScriptTask.createScript({
        name: "超星刷课任务",
        target: async function ({ task, script }) {
            // 脚本拦截
            CXRequestScriptHook(script.page);
            return await start(task, script);
        },
    });
}

function start(task: RunnableTask<void>, script: LoginScript) {
    return new Promise<void>(async (resolve, reject) => {
        // 进入章节列表
        await script.page.goto(script.page.url().replace(/pageHeader=\d+/, "pageHeader=1"));

        log("进入任务页面成功，即将开始刷课");
        task.process("进入任务页面成功，即将开始刷课");
        // 进入 iframe
        await waitForNavigation(script, script.page.frames()[1].url());

        // 阻止页面跳转
        await script.page.evaluate(() => {
            (window as any).open = function (url: string) {
                window.location.href = url;
            };
        });
        // 点击第一个任务的链接 进入学习页面
        await waitForClickAndNavigation(script, ".chapter_item[onclick*='toOld']");
        const waitFor = new WaitForScript(script);
        await waitFor.nextTick("requestfinished");
        await waitFor.documentReady();

        // 获取章节
        const jobs: string[] = await script.page.evaluate(() =>
            Array.from(document.querySelectorAll('[onclick*="getTeacherAjax"]'))
                // 切换回父节点
                .map((el) => el.parentElement)
                // 如果存在未完成的任务点
                .filter((el) => !!el?.querySelector(".jobUnfinishCount"))
                // 获取点击事件
                .map((el) => el!.querySelector('[onclick*="getTeacherAjax"]') || "")
                // 过滤掉空值
                .filter((el) => el !== "")
                // 转换为章节 eval 数组
                .map((el: any) => el.getAttribute("onclick"))
        );
        log(jobs);
        if (jobs.length === 0) {
            task.finish("刷课任务已经完成");
            resolve();
        } else {
            task.process("刷课中...");
            const cxSetting = StoreGet("setting")?.script.script.cx;
            if (cxSetting.review) {
                // 如果是复习模式，则从当前页面一直下一章
            } else {
                // 进入需要刷课的章节，然后一直下一章
                await script.page.evaluate(jobs[0]);
            }

            // 任务队列
            let queue: Frame[] = [];

            let currentTaskId = createHash("md5").update(Date.now().toString()).digest("hex");

            // 当 iframe 时，加载到任务队列
            script.page.on("frameattached", (frame) => {
                queue.push(frame);
            });
            // 当 iframe 移除时移除任务
            script.page.on("framedetached", (frame) => {
                queue = queue.filter((q) => q._id !== frame._id);
            });

            script.page.on("framenavigated", (frame) => {});

            const debouncedScript = debounce(runScript, 5000, { maxWait: 5000 });

            // 防抖
            script.page.on("requestfinished", async function (req: HTTPRequest) {
                if (RegExp("/mycourse/studentstudyAjax").test(req.url()) || RegExp("/knowledge/cards").test(req.url())) {
                    currentTaskId = createHash("md5").update(Date.now().toString()).digest("hex");
                    task.process("页面重新加载，重新刷课中...");
                    await waitFor.nextTick("requestfinished");
                    await waitFor.documentReady();

                    await debouncedScript();
                }
            });

            // 运行任务
            await waitFor.nextTick("requestfinished");
            await waitFor.documentReady();
            await debouncedScript();
            async function runScript() {
                let id = currentTaskId;
                console.log("runScript queue :", queue.length);
                if (script && id === currentTaskId) {
                    const cxSetting = StoreGet("setting").script.script.cx;
                    // 队列运行脚本
                    if (id === currentTaskId) {
                        if (cxSetting.queue) {
                            // 执行队列
                            await execQueue();
                            async function execQueue() {
                                const frame = queue.shift();
                                // 如果队列存在继续执行，否则运行下个任务
                                if (frame && id === currentTaskId) {
                                    const cxSetting = StoreGet("setting").script.script.cx;

                                    await TimeoutTask(
                                        StoreGet("setting").script.script.taskTimeoutPeriod * 60 * 60 * 1000,
                                        () => JobScript(cxSetting, task, frame),
                                        async () => {
                                            task.error("任务超时，即将进行下一个任务。");
                                        }
                                    );

                                    await execQueue();
                                }
                            }
                        } else {
                            // 同时运行
                            await Promise.all(queue.map((frame) => JobScript(cxSetting, task, frame)));
                        }
                        const onclick = await script.page.evaluate(() => (document.querySelector(".next") as any)?.getAttribute("onclick"));
                        if (onclick) {
                            await script.page.evaluate(() => (document.querySelector(".next") as any)?.click());
                            await debouncedScript();
                        } else {
                            task.process("任务运行完毕");
                            resolve();
                        }
                    }
                }
            }
        }
    });
}

async function JobScript(cxSetting: ScriptSetting["script"]["cx"], task: ScriptTask<any>, frame: Frame) {
    await waitForFrameReady(frame);
    if (cxSetting.media.enable) {
        await MediaScript("video", task, frame, cxSetting.media);
        await MediaScript("audio", task, frame, cxSetting.media);
    }
    if (cxSetting.ppt) {
        await PPTScript(task, frame, cxSetting.ppt);
    }
    if (cxSetting.book) {
        await ReadBookScript(task, frame, cxSetting.book);
    }
    if (cxSetting.qa.enable) {
        await QAScript(task, frame, cxSetting.qa);
    }
}
