import { WaitForScript } from "@pioneerjs/core";
import { log } from "electron-log";
import { Frame, JSHandle, Page, SerializableOrJSHandle } from "puppeteer-core";
import { AxiosGet, AxiosPost } from "../../../electron/axios";
import { Task } from "../../../electron/task";
import { BaseTask, ScriptSetting } from "../../../types";
import { Course } from "../../../types/script/course";
import { StoreGet } from "../../../types/setting";
import { sleep } from "../../common/utils";
import { LoginScript } from "../../login/types";
import https from "https";
import similarity from "string-similarity";

similarity;
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
                const waitFor = new WaitForScript(script);
                await waitFor.nextTick("request");
                await waitFor.sleep(5000);
                // 获取章节
                const jobs: string[] = await script.page.evaluate(() =>
                    Array.from(document.querySelectorAll('[onclick*="getTeacherAjax"]'))
                        // 切换回父节点
                        .map((el) => el.parentElement)
                        // 如果存在未完成的任务点
                        .filter((el) => !!el?.parentElement?.querySelector(".jobUnfinishCount"))
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

                    // 任务队列
                    let queue: Frame[] = [];

                    // 当 iframe 时，加载到任务队列
                    script.page.on("frameattached", (frame) => {
                        queue.push(frame);
                    });
                    // 当 iframe 移除时移除任务
                    script.page.on("framedetached", (frame) => {
                        queue = queue.filter((q) => q._id !== frame._id);
                    });

                    script.page.on("framenavigated", (frame) => {});

                    script.page.on("load", async (e: any) => {
                        task.process("页面重新加载，重新刷课中...");
                        await waitFor.nextTick("request");
                        await runJob();
                    });
                    // 运行任务
                    await runJob();
                    async function runJob() {
                        const job = jobs.shift();

                        if (job && script) {
                            const cxSetting = StoreGet("setting").script.script.cx;

                            if (cxSetting.review) {
                                // 如果是复习模式，则从当前页面一直下一章
                            } else {
                                // 进入需要刷课的章节，然后一直下一章
                                await script.page.evaluate(job);
                            }

                            await waitFor.nextTick("request");
                            await runScript();
                            async function runScript() {
                                console.log("runScript queue :", queue.length);

                                if (script) {
                                    const cxSetting = StoreGet("setting").script.script.cx;
                                    // 队列运行脚本
                                    if (cxSetting.queue) {
                                        // 执行队列
                                        await execQueue();
                                        async function execQueue() {
                                            const frame = queue.shift();
                                            // 如果队列存在继续执行，否则运行下个任务
                                            if (frame) {
                                                const cxSetting = StoreGet("setting").script.script.cx;
                                                await JobScript(cxSetting, task, frame);
                                                await execQueue();
                                            }
                                        }
                                    } else {
                                        // 同时运行
                                        await Promise.all(queue.map((frame) => JobScript(cxSetting, task, frame)));
                                    }
                                    const onclick = await script.page.evaluate(() => (document.querySelector(".next") as any).getAttribute("onclick"));
                                    if (onclick) {
                                        await script.page.evaluate(() => (document.querySelector(".next") as any)?.click());
                                        await sleep(3000);
                                        await runScript();
                                    } else {
                                        resolve();
                                    }
                                }
                            }
                        } else {
                            resolve();
                        }
                    }
                }
            });
        },
    });
}

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
        await sleep(2000);
        try {
            const document = await frame.evaluateHandle("document");
            readyState = await frame.evaluate((document) => document.readyState, document);
            // eslint-disable-next-line no-empty
        } catch {}
    }
}

async function JobScript(cxSetting: ScriptSetting["script"]["cx"], task: BaseTask<any>, frame: Frame) {
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
        await WorkScript(task, frame, cxSetting.qa);
    }
}

// 媒体播放脚本
async function MediaScript(selector: "video" | "audio", task: BaseTask<any>, frame: Frame, setting: ScriptSetting["script"]["cx"]["media"]) {
    const video = await frame.$(selector);

    if (video) {
        const name = selector === "video" ? "视频" : "音频";
        task.process(`正在播放${name}`);
        await frame.evaluate(
            async (video: HTMLVideoElement, playbackRate) => {
                function playVideo(video: HTMLVideoElement, playbackRate: number) {
                    return new Promise<void>((resolve, reject) => {
                        video.play();
                        video.playbackRate = playbackRate;
                        video.onratechange = function () {
                            console.log("onratechange", playbackRate);

                            video.playbackRate = playbackRate;
                        };
                        video.onpause = function () {
                            if (!video.ended) {
                                video.play();
                            }
                        };
                        video.onended = function () {
                            console.log(video, "播放完毕", video.currentTime);
                            resolve();
                        };
                    });
                }
                console.log(video, playbackRate);

                return await playVideo(video, playbackRate);
            },
            video,
            setting.playbackRate
        );
        task.process(`${name}播放完毕`);
    }
}

// 题目类型
interface Question {
    // 头部
    head: SerializableOrJSHandle;
    // 题目
    title: string;
    // 选择题
    choice: SerializableOrJSHandle;
    // 判断题
    judgment: SerializableOrJSHandle;
    // 填空题
    completion: SerializableOrJSHandle;
}

// 自动答题脚本
async function WorkScript(task: BaseTask<any>, frame: Frame, setting: ScriptSetting["script"]["cx"]["work"]) {
    const TiMus = await frame.$$(".TiMu");
    if (TiMus.length !== 0) {
        task.process(`正在自动答题,一共${TiMus.length}个题目`);
    }

    for (const TiMu of TiMus) {
        // 获取题目
        const infos: JSHandle<Question> = await TiMu.evaluateHandle((timu) => {
            return {
                head: timu.querySelector(".Zy_TItle"),
                title: (timu.querySelector(".Zy_TItle span") as any).innerText,
                choice: timu.querySelector(".Zy_ulTop"),
                judgment: timu.querySelector(".Zy_ulBottom"),
                completion: timu.querySelector(".Zy_ulTk"),
            } as Question;
        }, TiMu);

        // 查题
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        const { data: res } = await AxiosPost({
            url: "https://wk.enncy.cn/chati",
            httpsAgent: agent,
            data: {
                chatiId: StoreGet("setting").script.account.queryToken,
                question: (await infos.jsonValue<Question>()).title,
            },
        });
        // 匹配答案
        if (res.success) {
            const { question, answer } = res;
            const que = await infos.jsonValue<Question>();
            if (que.choice) {
                // 获取选项
                const options = await TiMu.evaluate((timu) => {
                    return Array.from(timu.querySelectorAll("li")).map((li) => li.innerText);
                }, TiMu);
                // 查找答案
                const index = similarity.findBestMatch(answer, options).bestMatchIndex;
                // 选择答案
                await TiMu.evaluate(
                    (timu, index) => {
                        timu.querySelectorAll("input")[index]?.click();
                        return;
                    },
                    TiMu,
                    index
                );
                console.log("选择题:" + question + "的答案为:" + options[index]);
            } else if (que.judgment) {
                // 查找答案
                const rightWord = "是|对|正确|√|对的|是的|正确的";
                const wrongWord = "否|错|错误|×|错的|不正确的|不正确|不是|不是的";
                const { target } = similarity.findBestMatch(answer, rightWord.split("|").concat(wrongWord.split("|"))).bestMatch;
                if (RegExp(rightWord).test(target)) {
                    await TiMu.evaluate((timu) => {
                        timu.querySelectorAll("input")[0]?.click();
                    }, TiMu);
                } else if (RegExp(wrongWord).test(target)) {
                    await TiMu.evaluate((timu) => {
                        timu.querySelectorAll("input")[1]?.click();
                    }, TiMu);
                }
                console.log("判断题:" + question + "的答案为:", target);
            } else if (que.completion) {
                // 找到填空串
                function findCompletion(str: string) {
                    let spl = str.split(/ |\s|=|#|&|;/).filter((s) => !!s);
                    if (spl.length > 4) {
                        return [];
                    } else {
                        return spl;
                    }
                }
                // 自动填空
                const ans = findCompletion(answer);
                await TiMu.evaluate(
                    (timu, answers) => {
                        const textareas = Array.from(timu.querySelectorAll("textarea"));
                        for (let i = 0; i < textareas.length; i++) {
                            textareas[i].value = answers[i] || "";
                        }
                    },
                    TiMu,
                    ans
                );
                console.log("填空题:" + question + "的答案为:", ans);
            } else {
                console.log("不支持的题目类型");
            }
        }
    }
}

// PPT播放脚本
async function PPTScript(task: BaseTask<any>, frame: Frame, setting: ScriptSetting["script"]["cx"]["ppt"]) {
    const imglook = await frame.$("#img.imglook");
    if (imglook) {
        task.process("正在播放PPT");
        await imglook.evaluate(() => {
            const finishJob = (window as any).finishJob;
            if (finishJob) finishJob();
        });
        await new Promise((r) => setTimeout(r, 3000));
        task.process("PPT播放完毕");
    }
}

async function ReadBookScript(task: BaseTask<any>, frame: Frame, setting: ScriptSetting["script"]["cx"]["book"]) {
    const readWeb = await frame.$("#Readweb");

    if (readWeb) {
        task.process("正在翻阅书本:" + ((await frame.title()) || "未知书名"));
        await readWeb.evaluate((readWeb) => {
            return new Promise(async (resolve, reject) => {
                const imgs = Array.from(document.querySelectorAll("#Readweb .duxiuimg"));
                let count = 0;
                await new Promise((resolve, reject) => {
                    const int = setInterval(() => {
                        if (count > 5) {
                            clearInterval(int);
                            resolve(true);
                            return;
                        }
                        count++;
                        (readWeb as any).scrollTo({ top: (imgs.pop() as any).offsetTop - 100, behavior: "smooth" });
                    }, 5000);
                });
                resolve(true);
            });
        }, readWeb);
        task.process("翻阅书本完成! :" + ((await frame.title()) || "未知书名"));
    }
}
