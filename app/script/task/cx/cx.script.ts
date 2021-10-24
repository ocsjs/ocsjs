import { AxiosGet } from "./../../../electron/updater/axios";
import { ScriptOptions } from "vm";
import { WaitForScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { Frame, Page } from "puppeteer-core";
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

                script.page.setRequestInterception(true);
                script.page.on("request", async (req) => {
                    if (req.url().indexOf("videojs-ext.min.js") !== -1) {
                        const js: string = (await AxiosGet("https://mooc1.chaoxing.com/ananas/videojs-ext/videojs-ext.min.js?v=2021-1009-1441")).data;
                        req.respond({
                            status: 200,
                            // 解除鼠标移出限制，解除倍速限制，支持4,8,16倍速
                            body: js.replace("mouseout", "").replace("ratechange", "").replace("[1, 1.25, 1.5, 2]", "[1, 1.25, 1.5, 2,4,8,16]"),
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
                    while (jobs.length !== 0) {
                        const job = jobs.shift();
                        if (job) {
                            // 运行任务
                            await script.page.evaluate(job.eval);
                            // 获取子任务
                            await waitForReady(script);
                            job.children = await script.page.evaluate(() =>
                                Array.from(document.querySelectorAll('[onclick*="changeDisplayContent"]'))
                                    .map((el) => el.getAttribute("onclick") || "")
                                    .filter((c) => c !== "")
                            );

                            while (job.children.length !== 0) {
                                const childrenJob = job.children.shift();
                                if (childrenJob) {
                                    await script.page.evaluate(childrenJob);
                                    await waitForReady(script);
                                    await new Promise((r) => setTimeout(r, 5000));
                                    const elementHandle = await script.page.$("iframe");
                                    const frame = await elementHandle?.contentFrame();

                                    if (frame) {
                                        const iframe: Frame[] = [];
                                        await dumpFrameTree(frame);
                                        async function dumpFrameTree(frame: Frame) {
                                            iframe.push(frame);

                                            for (let child of await frame.$$("iframe")) {
                                                const doc = await child.contentFrame();
                                                if (doc) {
                                                    dumpFrameTree(doc);
                                                }
                                            }
                                        }
                                        log("iframe", iframe.length);
                                        iframe.forEach(async (frame) => {
                                            for (const video of await frame.$$("video")) {
                                                await frame.evaluate(async (video: HTMLVideoElement) => {
                                                    await playVideo(video);

                                                    async function playVideo(video: HTMLVideoElement) {
                                                        return new Promise<void>((resolve, reject) => {
                                                            video.play()
                                                            video.playbackRate = 2
                                                            video.onended = function () {
                                                                resolve();
                                                            };
                                                            video.onpause = function () {
                                                                video.play();
                                                            };
                                                        });
                                                    }
                                                }, video);
                                                log("视频播放完毕")
                                                resolve();
                                                return
                                            }
                                        });
                                    }

                              
                                    return;
                                }
                            }
                        }
                    }
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
