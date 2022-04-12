import defaults from "lodash/defaults";
import { logger } from "../../logger";
import { domSearch, domSearchAll, getNumber, searchIFrame, sleep, StringUtils } from "../../core/utils";
import { defaultAnswerWrapperHandler } from "../../core/worker/answer.wrapper.handler";
import { OCSWorker } from "../../core/worker";
import { defaultSetting, ScriptSettings } from "../../scripts";

import { store } from "..";

/**
 * cx 任务学习
 */
export async function study(setting: ScriptSettings["cx"]["video"]) {
    logger("debug", "即将开始");

    const tasks = searchTask(setting);

    for (const task of tasks) {
        await sleep(3000);
        await task();
    }

    // 下一章按钮
    const { next } = domSearch({ next: ".next" }, top?.document);
    // 上方小节任务栏
    const { tabs } = domSearchAll({ tabs: ".prev_ul li" }, top?.document);

    // 如果按钮显示
    if (next && next.style.display === "block") {
        // 如果下一章的id和当前保存的下一章id一致，则说明当前为闯关模式
        if (tabs.length && tabs[tabs.length - 1].classList.contains("active")) {
            // 最后一小节完成的时候， 暂停久一点防止任务点刷新太慢
            await sleep(5000);
            const { chapterIdInput } = domSearch({ chapterIdInput: `input[id="chapterId"]` }, top?.document);
            // 章节id相同，则不能继续下一章
            if ((chapterIdInput as HTMLInputElement).value === store.setting.cx.video.chapterId) {
                logger("warn", "当前章节未完成, 必须自行手动完成后才能进行下一章。");
                return;
            } else {
                store.setting.cx.video.chapterId = (chapterIdInput as HTMLInputElement).value;
            }
        }

        logger("debug", "完成, 即将跳转");
        await sleep(3000);
        next.click();
    } else {
        alert("OCS助手： 全部任务点已完成！");
    }
}

/**
 * 搜索任务点
 */
function searchTask(setting: ScriptSettings["cx"]["video"]): (() => Promise<void> | undefined)[] {
    return searchIFrame(document)
        .map((frame) => {
            const { media, ppt, chapterTest } = domSearch(
                {
                    media: "video,audio",
                    chapterTest: ".TiMu",
                    ppt: "#img.imglook",
                },
                frame.contentDocument || document
            );

            function getJob() {
                return media
                    ? mediaTask(setting, media as any, frame)
                    : ppt
                    ? pptTask(frame)
                    : chapterTest
                    ? chapterTestTask(store.setting.cx.work, frame)
                    : undefined;
            }
            if (media || ppt || chapterTest) {
                return () => {
                    // @ts-ignore
                    let _parent = frame.contentWindow;
                    // @ts-ignore
                    let jobIndex = getNumber(frame.contentWindow?._jobindex, _parent._jobindex);
                    if (ppt) {
                        console.log({ jobIndex, _parent });
                    }
                    while (_parent) {
                        // @ts-ignore
                        jobIndex = getNumber(jobIndex, frame.contentWindow?._jobindex, _parent._jobindex);
                        // @ts-ignore
                        let attachments = _parent?.JC?.attachments || _parent.attachments;

                        if (attachments && typeof jobIndex == "number") {
                            const { name, title, bookname, author } = attachments[jobIndex]?.property || {};
                            const jobName = name || title || (bookname ? bookname + author : undefined) || "未知任务";

                            // 直接重复学习，不执行任何判断, 章节测试除外
                            if (setting.restudy && !chapterTest) {
                                logger("debug", jobName, "即将重新学习。");
                                return getJob();
                            } else if (attachments[jobIndex]?.job === true) {
                                logger("debug", jobName, "即将开始。");
                                return getJob();
                            } else {
                                logger("debug", jobName, "已经完成，即将跳过。");
                                break;
                            }
                        }
                        // @ts-ignore
                        if (_parent.parent == _parent) {
                            break;
                        }
                        // @ts-ignore
                        _parent = _parent.parent;
                    }
                };
            } else {
                return undefined;
            }
        })
        .filter((f) => f) as any[];
}

/**
 *  视频路线切换
 */
export function switchPlayLine(
    setting: ScriptSettings["cx"]["video"],
    videojs: HTMLElement,
    media: HTMLMediaElement,
    line: string
) {
    const { playbackRate = 1 } = setting;

    // @ts-ignore
    if (videojs?.player) {
        // @ts-ignore  播放路线列表
        const playlines = Array.from(videojs.player.controlBar.options_.playerOptions.playlines);
        // 播放菜单元素
        const menus: HTMLElement[] = Array.from(
            // @ts-ignore
            videojs.player.controlBar.videoJsPlayLine.querySelectorAll("ul li")
        );

        setting.playlines = playlines;

        logger("info", "切换路线中： " + line);
        selectLine(line);

        function selectLine(line: string) {
            for (const menu of menus) {
                if (menu.textContent?.includes(line)) {
                    menu.click();
                    setting.line = line;
                    /** 重新选择倍速 */
                    setTimeout(() => (media.playbackRate = playbackRate), 3000);
                    break;
                }
            }
        }
    }
}

/**
 * 播放视频和音频
 */
function mediaTask(setting: ScriptSettings["cx"]["video"], media: HTMLMediaElement, frame: HTMLIFrameElement) {
    const { playbackRate = 1, volume = 0 } = setting;

    // @ts-ignore
    const { videojs } = domSearch({ videojs: "#video" }, frame.contentDocument || document);
    store.videojs = videojs;
    store.currentMedia = media;

    if (videojs) {
        // 切换路线
        setTimeout(() => switchPlayLine(setting, videojs, media, setting.line), 3000);
    }

    /**
     * 视频播放
     */
    return new Promise<void>((resolve) => {
        if (media) {
            media.volume = volume;
            media.play();
            media.playbackRate = playbackRate;

            var playFunction = function () {
                // @ts-ignore
                if (!media.ended && !media.__played__) {
                    setTimeout(() => media.play(), 1000);
                } else {
                    // @ts-ignore
                    media.__played__ = true;
                    logger("info", "视频播放完毕");
                    // @ts-ignore
                    media.removeEventListener("pause", playFunction);
                }
            };

            media.addEventListener("pause", playFunction);

            media.addEventListener("ended", () => resolve());
        }
    });
}

/**
 * 阅读 ppt
 */
async function pptTask(frame?: HTMLIFrameElement) {
    // @ts-ignore
    let finishJob = frame?.contentWindow?.finishJob;
    if (finishJob) finishJob();
    await sleep(3000);
}

/**
 * 章节测验
 */
async function chapterTestTask(setting: ScriptSettings["cx"]["work"], frame: HTMLIFrameElement) {
    const { period, timeout, retry, stopWhenError } = defaults(setting, defaultSetting().work);

    if (store.setting.cx.video.upload === "close") {
        logger("warn", "自动答题已被关闭！");
        return;
    }

    logger("info", "开始自动答题");

    if (store.setting.answererWrappers.length === 0) {
        logger("warn", "题库配置为空，请设置。");
        return;
    }

    // @ts-ignore
    if (!frame.contentWindow) {
        logger("warn", "元素不可访问");
        return;
    }

    const { window } = frame.contentWindow;

    const { TiMu } = domSearchAll({ TiMu: ".TiMu" }, window.document);
    /** 清空答案 */
    store.workResults = [];

    /** 新建答题器 */
    const worker = new OCSWorker({
        root: TiMu,
        elements: {
            title: ".Zy_TItle .clearfix",
            /**
             * 兼容各种选项
             *
             * ul li .after 单选多选
             * ul li label:not(.after) 判断题
             * ul li textarea 填空题
             */
            options: "ul li .after,ul li textarea,ul li label:not(.before)",
            type: 'input[id^="answertype"]',
        },
        /** 默认搜题方法构造器 */
        answerer: (elements, type) => {
            const title = StringUtils.nowrap(elements.title[0].innerText)
                .replace(/(\d+)?【.*?题】/, "")
                .replace(/（\d+.0分）/, "")
                .trim();
            if (title) {
                return defaultAnswerWrapperHandler(store.setting.answererWrappers, type, title);
            } else {
                throw new Error("题目为空，请查看题目是否为空，或者忽略此题");
            }
        },
        /** 处理cx作业判断题选项是图片的问题 */
        onElementSearched(elements) {
            const typeInput = elements.type[0] as HTMLInputElement;
            const type = parseInt(typeInput.value);
            if (type === 3) {
                elements.options.forEach((option) => {
                    const ri = option.querySelector(".ri");
                    const span = document.createElement("span");
                    span.innerText = ri ? "√" : "×";
                    option.appendChild(span);
                });
            }
        },
        work: {
            /**
             * cx 题目类型 ：
             * 0 单选题
             * 1 多选题
             * 2 简答题
             * 3 判断题
             * 4 填空题
             */
            type({ elements }) {
                const typeInput = elements.type[0] as HTMLInputElement;

                const type = parseInt(typeInput.value);
                return type === 0
                    ? "single"
                    : type === 1
                    ? "multiple"
                    : type === 2
                    ? "completion"
                    : type === 3
                    ? "judgement"
                    : elements.options[0].querySelector("textarea")
                    ? "completion"
                    : undefined;
            },
            /** 自定义处理器 */
            handler(type, answer, option) {
                if (type === "judgement" || type === "single" || type === "multiple") {
                    if (!option.parentElement?.querySelector("input")?.checked) {
                        // @ts-ignore
                        option.parentElement?.querySelector("a,label")?.click();
                    }
                } else if (type === "completion" && answer.trim()) {
                    const text = option.parentElement?.querySelector("textarea");
                    const textareaFrame = option.parentElement?.querySelector("iframe");
                    if (text) {
                        text.value = answer;
                    }
                    if (textareaFrame?.contentDocument) {
                        textareaFrame.contentDocument.body.innerHTML = answer;
                    }
                }
            },
        },
        onResult: (res) => {
            if (res.ctx) {
                store.workResults.push(res);
            }

            logger("info", "题目完成结果 : ", res.result?.finish ? "完成" : "未完成");
        },

        /** 其余配置 */
        period: (period || 3) * 1000,
        timeout: (timeout || 30) * 1000,
        retry,
        stopWhenError,
    });

    const results = await worker.doWork();

    logger("info", "做题完毕", results);

    // 处理提交
    await worker.uploadHandler({
        uploadRate: store.setting.cx.video.upload,
        results,
        async callback(finishedRate, uploadable) {
            logger("info", "完成率 : ", finishedRate, " , ", uploadable ? "5秒后将自动提交" : " 5秒后将自动保存");

            await sleep(5000);

            if (uploadable) {
                // @ts-ignore 提交
                window.btnBlueSubmit();

                await sleep(3000);
                /** 确定按钮 */
                // @ts-ignore 确定
                window.submitCheckTimes();
            } else {
                // @ts-ignore 禁止弹窗
                window.alert = () => {};
                // @ts-ignore 暂时保存
                window.noSubmit();
            }
        },
    });
}
