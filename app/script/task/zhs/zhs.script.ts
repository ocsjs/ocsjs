import { WaitForScript } from "@pioneerjs/core";
import { ScriptTask } from "../../../electron/task/script.task";
import { Course } from "../../../types/script/course";
import { StoreGet } from "../../../types/setting";
import { waitForNavigation, waitForClickAndNavigation } from "../utils";

/**
 * 超星刷课任务
 * @param script 脚本上下文
 * @returns
 */
export function ZHSScript(course: Course): ScriptTask<void> {
    return ScriptTask.createScript({
        name: "超星刷课任务",
        target: function ({ task, script }) {
            return new Promise(async (resolve, reject) => {
                const { page } = script;

                const waitFor = new WaitForScript(script);
                await waitFor.documentReady();
                console.log(course);
                // 确认，切换身份按钮，一般需要点2次
                await page.evaluate(() => {
                    (document.querySelector(".next-btn") as HTMLDivElement)?.click();
                    (document.querySelector(".next-btn") as HTMLDivElement)?.click();
                });

                // 进入学习页面首页
                if (course.url) await waitForNavigation(script, course.url);
                else if (course.selector) {
                    await waitForClickAndNavigation(script, course.selector);
                } else {
                    throw new Error("脚本运行失败: 课程链接或课程元素为空，请重新获取课程!");
                }

                // 取消弹窗
                await page.evaluate(() => {
                    (document.querySelector(".v-modal") as HTMLDivElement).remove();
                    (Array.from(document.querySelectorAll(".el-dialog__wrapper,.dialog")) as HTMLDivElement[]).forEach((e) => {
                        e.remove();
                    });
                });
                await waitFor.sleep(5000);

                const zhsSetting = StoreGet("setting").script.script.zhs;
                // 如果不刷视频直接推出此任务，进行下一个
                if (!zhsSetting.video.enable) {
                    resolve();
                    return;
                }

                // 定时关闭 autoStop 是小时为单位
                setTimeout(() => {
                    resolve();
                }, zhsSetting.autoStop * 60 * 60 * 1000);

                task.process("正在自动播放视频");

                // 暂时使用旧版本的刷课方法
                await page.evaluate(
                    (autoStop, playbackRate) => {
                        return new Promise<void>((resolve, reject) => {
                            const $ = (window as any).$;

                            // 自动关闭
                            setTimeout(function () {
                                window.history.back();
                            }, autoStop * 60 * 60 * 1000);

                            setTimeout(() => {
                                start("li.clearfix.video", ".time_icofinish");
                            }, 3000);

                            function start(all_li: string, with_out: string) {
                                console.log("开始自动播放视频", arguments);

                                callback();

                                function callback() {
                                    let list = getList();
                                    if (list.length === 0) {
                                        resolve();
                                        return;
                                    } else {
                                        list[0].click();
                                        setTimeout(() => {
                                            const v = document.querySelector("video");
                                            if (v) {
                                                Player(v, callback);
                                            } else {
                                                callback();
                                            }
                                        }, 3000);
                                    }
                                }

                                function Player(video: HTMLVideoElement, callback: () => void) {
                                    video.play();
                                    video.playbackRate = playbackRate;
                                    video.onpause = function () {
                                        if (!video.ended) {
                                            video.play();
                                        }
                                    };
                                    video.onended = function () {
                                        callback();
                                    };
                                }
                                //获取所有要播放的视频
                                function getList() {
                                    return Array.from(document.querySelectorAll(all_li)).filter((el) => el.querySelector(with_out) === null) as HTMLLIElement[];
                                }

                                //题目弹窗，选择A,关闭
                                setInterval(function () {
                                    if ($(".speedBox").find("span").text() == "X 1.0") $(".speedTab15").click();
                                    if ($(".topic-item").length != 0) {
                                        setTimeout("$('.topic-item').eq(0).click();", 500); //选择A
                                        setTimeout("$('div.btn').eq(0).click();", 1000); //关闭
                                    }
                                }, 2000);
                            }
                        });
                    },
                    zhsSetting.autoStop,
                    zhsSetting.video.playbackRate
                );
            });

            // next-btn
        },
    });
}
