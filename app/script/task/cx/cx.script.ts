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
import { waitForNavigation, waitForClickAndNavigation, TimeoutTask } from "../utils";

import { debounce } from "lodash";

const debouncedScript = debounce(runScript, 10000);

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
            return new Promise(async (resolve, reject) => {
                if (!StoreGet("setting").script.script.cx.study.enable) {
                    task.process("刷课功能关闭，即将自动做作业");
                    await sleep(3000);
                    resolve();
                    return;
                }
                const waitFor = new WaitForScript(script);
                task.process("开始刷课");

                // 脚本拦截
                CXRequestScriptHook(script.page);

                await script.page.goto(script.page.url().replace(/pageHeader=\d+/, "pageHeader=1"));

                log("进入任务页面成功，即将开始刷课");
                task.process("进入任务页面成功，即将开始刷课");
                await waitFor.nextTick("requestfinished");
                await waitFor.documentReady();

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

                await waitFor.nextTick("requestfinished");
                await waitFor.documentReady();

                // 获取章节
                const jobs: string[] = await script.page.evaluate(() => {
                    console.log("document", document);
                    const res = Array.from(document.querySelectorAll('[onclick*="getTeacherAjax"]'))
                        // 切换回父节点
                        .map((el) => el.parentElement)
                        // 如果存在未完成的任务点
                        .filter((el) => !!el?.querySelector(".jobUnfinishCount"))
                        // 获取点击事件
                        .map((el) => el!.querySelector('[onclick*="getTeacherAjax"]') || "")
                        // 过滤掉空值
                        .filter((el) => el !== "")
                        // 转换为章节 eval 数组
                        .map((el: any) => el.getAttribute("onclick"));
                    console.log("res", res);

                    return res;
                });
                log(jobs);
                if (jobs.length === 0) {
                    task.process("检测不到任务点,可能因为所有任务已经完成，即将跳转下一个任务。");
                    resolve();
                } else {
                    task.process("刷课中...");

                    // 任务队列
                    let queue: Frame[] = [];

                    // 当 iframe 时，加载到任务队列
                    script.context.eventPool.on("frameattached", (frame) => {
                        frame.evaluate(() => (window.alert = console.log));
                        queue.push(frame);
                    });
                    // 当 iframe 移除时移除任务
                    script.context.eventPool.on("framedetached", (frame) => {
                        queue = queue.filter((q) => q._id !== frame._id);
                    });

                    const cxSetting = StoreGet("setting").script.script.cx.study;
                    if (cxSetting.review) {
                        // 如果是复习模式，则从当前页面一直下一章
                    } else {
                        // 进入需要刷课的章节，然后一直下一章
                        await script.page.evaluate(jobs[0]);
                    }
                    await waitFor.nextTick("requestfinished");
                    await waitFor.documentReady();

                    async function callback(f: Frame[]) {
                        await next(queue, task, script, callback);
                    }

                    script.context.eventPool.on("requestfinished", async (req) => {
                        // 如果进入作业或者考试页面，自动下一个任务
                        // 问号不能删除，区别于 /mycourse/studentstudyAjax
                        if (RegExp("/mycourse/studentstudy\\?chapterId").test(req.url())) {
                            task.process("已切换到学习界面，即将开始自动刷课");

                            await debouncedScript(queue, task, script, callback);
                        } else if (RegExp("/mycourse/studentstudyAjax").test(req.url()) || RegExp("/knowledge/cards").test(req.url())) {
                            task.process("任务变化，重新分配任务中 ");
                            await waitFor.nextTick("requestfinished");
                            await debouncedScript(queue, task, script, callback);
                        }
                    });
                    task.process("即将开始自动刷课");
                    await debouncedScript(queue, task, script, callback);
                }
            });
        },
    });
}

async function runScript(queue: Frame[], task: ScriptTask<any>, script: LoginScript, callback: (queue: Frame[]) => Promise<void>) {
    console.log(
        "runScript ",
        queue.map((a) => a._id)
    );
    queue = queue.filter((q) => !q.isDetached());
    const cxSetting = StoreGet("setting").script.script.cx;
    // 队列运行脚本
    if (cxSetting.study.queue) {
        // 执行队列
        await execQueue(queue, task, script);
    } else {
        // 同时运行
        await Promise.all(
            queue.map((frame) =>
                TimeoutTask(
                    StoreGet("setting").script.script.taskTimeoutPeriod * 60 * 60 * 1000,
                    () => JobScript(cxSetting.study, task, script, frame),
                    async () => {
                        task.error("任务超时，即将进行下一个任务。");
                    }
                )
            )
        );
    }
    console.log("callback");

    await callback(queue);
}

async function next(queue: Frame[], task: ScriptTask<any>, script: LoginScript, callback: (queue: Frame[]) => Promise<void>) {
    const onclick = await script.page.evaluate(() => (document.querySelector(".next") as any)?.getAttribute("onclick"));
    if (onclick) {
        task.process("正在跳转下一章");
        await script.page.evaluate(() => (document.querySelector(".next") as any)?.click());
        await debouncedScript(queue, task, script, callback);
    } else {
        task.process("刷课完成。");
    }
}

async function execQueue(queue: Frame[], task: ScriptTask<any>, script: LoginScript) {
    const frame = queue.shift();
    console.log("execQueue ", frame?._id);

    if (frame) {
        // 如果队列存在继续执行，否则运行下个任务
        const studySetting = StoreGet("setting").script.script.cx.study;

        await TimeoutTask(
            StoreGet("setting").script.script.taskTimeoutPeriod * 60 * 60 * 1000,
            () => JobScript(studySetting, task, script, frame),
            async () => {
                task.error("任务超时，即将进行下一个任务。");
            }
        );

        await execQueue(queue, task, script);
    }
}

async function JobScript(studySetting: ScriptSetting["script"]["cx"]["study"], task: ScriptTask<any>, script: LoginScript, frame: Frame) {
    const waitFor = new WaitForScript(script);
    await waitFor.nextTick("requestfinished");
    console.log("JobScript ", frame._id);

    if (studySetting.media.enable) {
        await MediaScript("video", task, frame, studySetting.media);
        await MediaScript("audio", task, frame, studySetting.media);
    }
    if (studySetting.ppt) {
        await PPTScript(task, frame, studySetting.ppt);
    }
    if (studySetting.book) {
        await ReadBookScript(task, frame, studySetting.book);
    }
    if (studySetting.qa.enable) {
        await QAScript(task, frame, studySetting.qa);
    }
}
