 
import { WaitForScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { Frame, Page } from "puppeteer-core";
import { AxiosGet } from "../../../electron/axios";
import { Task } from "../../../electron/task";
import { Course } from "../../../types/script/course";
import { LoginScript } from "../../login/types";

interface CXChapter {
    eval: string;
    children: string[];
}

/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function CXScript(course: Course): Task<void> {
    return Task.createBlockTask({
        name: "超星刷课任务",
        target: async function (task, script) {
            return new Promise(async (resolve, reject) => {
                await intoCourseIndex();

                // 进入学习页面首页
                async function intoCourseIndex() {
                    if (script) {
                        if (course.url) await waitForNavigation(script, course.url);
                        else if (course.selector) {
                            await waitForClickAndNavigation(script, course.selector);
                        } else {
                            throw new Error("脚本运行失败: 课程链接或课程元素为空，请重新获取课程!");
                        }
                    } else {
                        throw new Error("脚本运行失败: 脚本上下文为空!");
                    }
                }
                if (!script) {
                    return;
                }
                // 进入章节列表
                await script.page.goto(script.page.url().replace(/pageHeader=\d+/, "pageHeader=1"));

                script.page.setRequestInterception(true);
                script.page.on("request", async (req) => {
                    if (req.url().indexOf("videojs-ext.min.js") !== -1) {
                        // 通过拦截请求进行脚本篡改
                        const js: string = (await AxiosGet(req.url())).data;
                        req.respond({
                            status: 200,
                            // 解除鼠标移出限制
                            body: js
                                .replace("mouseout", "")
                                // 解除倍速限制
                                .replace("ratechange", "")
                                // 持4,8,16倍速
                                .replace("[1, 1.25, 1.5, 2]", "[1, 1.25, 1.5, 2,4,8,16]")
                                // 视频播放完毕后发送完成请求
                                .replace("f.on('play'", "f.on('ended',()=>h('log'))\nf.on('play'"),
                        });
                    } else if (req.url().indexOf("enc_js_work.js") !== -1) {
                        const js: string = (await AxiosGet(req.url())).data;
                        req.respond({
                            status: 200,
                            // 解除 debugger 保护
                            body: js.replace("debuggerProtection", "a"),
                        });
                    } else {
                        req.continue();
                    }
                });
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

                // 获取章节
                const jobs: CXChapter[] = await script.page.evaluate(() =>
                    Array.from(document.querySelectorAll('[onclick*="getTeacherAjax"]'))
                        // 切换回父节点
                        .map((el) => el.parentElement)
                        // 如果存在未完成的任务点
                        .filter((el) => !!el?.parentElement?.querySelector(".jobUnfinishCount"))
                        // 获取点击事件
                        .map((el) => el!.querySelector('[onclick*="getTeacherAjax"]')?.getAttribute("onclick") || "")
                        // 过滤掉空值
                        .filter((c) => c !== "")
                        // 转换为章节 eval 数组
                        .map((c) => ({ eval: c, children: [] }))
                );
                log(jobs);
                if (jobs.length === 0) {
                    task.finish("刷课任务已经完成，即将跳转到作业界面");
                    // await intoCourseIndex();
                    resolve();
                } else {
                    task.process("刷课中...");

                    script.page.on("frameattached", async (frame) => {
                        await waitForFrameReady(frame);
                        await MediaScript("video", frame);
                        await MediaScript("audio", frame);
                        await PPTScript(frame);
                    });

                    // while (jobs.length !== 0) {
                    //     const job = jobs.shift();
                    //     if (job) {
                    //         // 运行任务
                    //         await script.page.evaluate(job.eval);
                    //         // 获取子任务
                    //         await waitForReady(script);
                    //         job.children = await script.page.evaluate(() =>
                    //             Array.from(document.querySelectorAll('[onclick*="changeDisplayContent"]'))
                    //                 .map((el) => el.getAttribute("onclick") || "")
                    //                 .filter((c) => c !== "")
                    //         );

                    //         while (job.children.length !== 0) {
                    //             const childrenJob = job.children.shift();
                    //             if (childrenJob) {
                    //                 await script.page.evaluate(childrenJob);

                    //                 return;
                    //             }
                    //         }
                    //     }
                    // }
                }
            });
        },
    });
}

function chapterScript() {}

async function waitForReady(script: LoginScript<void>) {
    const waitFor = new WaitForScript(script);
    await waitFor.documentReady();
    await waitFor.nextTick("requestfinished");
}

async function waitForClickAndNavigation(script: LoginScript<void>, selector: string) {
    await Promise.all([script.page.click(selector), waitForReady(script)]);
}

async function waitForNavigation(script: LoginScript<void>, url: string) {
    await Promise.all([script.page.goto(url), waitForReady(script)]);
}

async function waitForFrameReady(frame: Frame): Promise<void> {
    let readyState: DocumentReadyState | undefined;
    while (readyState !== "complete") {
        await new Promise((r) => setTimeout(r, 1000));
        try {
            const document = await frame.evaluateHandle("document");
            readyState = await frame.evaluate((document) => document.readyState, document);
            // eslint-disable-next-line no-empty
        } catch {}
    }
}

// 媒体播放脚本
async function MediaScript(selector: "video" | "audio", frame: Frame) {
    for (const video of await frame.$$(selector)) {
        await frame.evaluate(async (video: HTMLVideoElement) => {
            await playVideo(video);

            async function playVideo(video: HTMLVideoElement) {
                return new Promise<void>((resolve, reject) => {
                    video.play();
                    video.playbackRate = 16;
                    video.onended = function () {
                        resolve();
                    };
                });
            }
        }, video);
        log("视频播放完毕");
    }
}

// 作业播放脚本
async function WorkScript(frame: Frame) {}

// PPT播放脚本
async function PPTScript(frame: Frame) {
    for (const imglook of await frame.$$("#img.imglook")) {
        await imglook.evaluate("finishJob()");
        await new Promise((r) => setTimeout(r, 3000));
        log("视频播放完毕");
    }
}
