import { debounce, defaults } from "lodash";
import { logger } from "../logger";
import { clearSearchResult, domSearch, domSearchAll, getNumber, sleep, StringUtils } from "../core/utils";
import { defaultAnswerWrapperHandler } from "../core/worker/answer.wrapper.handler";
import { OCSWorker } from "../core/worker";
import { defaultSetting, ScriptSettings } from "../scripts";
import { createSearchResultElement } from "../core/worker/utils";
import { setItem } from "../core/store";

/**
 * cx 任务学习
 */
export async function study(setting: ScriptSettings["cx"]["video"]) {
    logger("info", "开始");

    for (const task of searchTask(setting)) {
        await sleep(3000);
        try {
            await task();
        } catch (e) {
            // @ts-ignore
            logger("error", e.message);
        }
        await sleep(3000);
    }

    logger("info", "完成");

    const { next } = domSearch({ next: ".next" }, top?.document);
    if (next && next.style.display === "block") {
        next.click();
    } else {
        alert("OCS助手： 全部任务点已完成！");
    }
}

/**
 * 搜索任务点
 */
function searchTask(setting: ScriptSettings["cx"]["video"]): Array<() => Promise<number>> {
    return searchIFrame()
        .map((frame) => () => {
            const { media, ppt, chapterTest } = domSearch(
                {
                    media: "video,audio",
                    chapterTest: ".TiMu",
                    ppt: "#img.imglook",
                },
                frame.contentDocument || document
            );

            if (media || ppt || chapterTest) {
                // @ts-ignore
                let _parent = frame.contentWindow.parent;
                // @ts-ignore
                let jobIndex = getNumber(frame.contentWindow?._jobindex, _parent._jobindex);
                while (_parent) {
                    // @ts-ignore
                    jobIndex = getNumber(jobIndex, frame.contentWindow?._jobindex, _parent._jobindex);
                    // @ts-ignore
                    let attachments = _parent?.JC?.attachments || _parent.attachments;

                    if (attachments && typeof jobIndex == "number") {
                        const { name, title, bookname, author } = attachments[jobIndex]?.property || {};
                        const jobName = name || title || (bookname ? bookname + author : undefined) || "未知任务";

                        if (attachments[jobIndex]?.job === true) {
                            logger("debug", jobName, "即将开始。");
                            return media
                                ? mediaTask(setting, media as any, frame)
                                : ppt
                                ? pptTask(frame)
                                : chapterTest
                                ? chapterTestTask(OCS.setting.cx.work, frame)
                                : undefined;
                        } else if (setting.restudy && media) {
                            logger("debug", jobName, "即将重新学习。");
                            return mediaTask(setting, media as any, frame);
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
            }
        })
        .filter((t) => t !== undefined) as any;
}

/**
 *  递归寻找 iframe
 */
function searchIFrame() {
    let list = Array.from(document.querySelectorAll("iframe"));
    let result: HTMLIFrameElement[] = [];
    while (list.length) {
        const frame = list.shift();

        try {
            if (frame && frame?.contentWindow?.document) {
                result.push(frame);
                let frames = frame?.contentWindow?.document.querySelectorAll("iframe");
                list = list.concat(Array.from(frames || []));
            }
        } catch (e) {
            // @ts-ignore
            console.log(e.message);
            console.log({ frame });
        }
    }
    return result;
}

/**
 * 播放视频和音频
 */
function mediaTask(setting: ScriptSettings["cx"]["video"], media: HTMLMediaElement, frame: HTMLIFrameElement) {
    const { playbackRate = 1, mute = true } = setting;
    /**
     *  视频路线选择器
     */
    // @ts-ignore
    const { videojs } = domSearch({ videojs: "#video" }, frame.contentDocument || document);
    const { lineSelect } = domSearch({ lineSelect: "#video-line" }, top?.document);
    console.log({ lineSelect, videojs });

    // @ts-ignore
    if (videojs?.player) {
        // @ts-ignore  播放路线列表
        const playlines = Array.from(videojs.player.controlBar.options_.playerOptions.playlines);
        // 播放菜单元素
        const menus: HTMLElement[] = Array.from(
            // @ts-ignore
            videojs.player.controlBar.videoJsPlayLine.querySelectorAll("ul li")
        );
        const currentLine = setting.line;
        if (currentLine) {
            setTimeout(() => {
                logger("info", "切换路线： " + currentLine);
                selectLine(currentLine);
            }, 3000);
        }

        /** 添加选项 */
        if (lineSelect) {
            for (const line of playlines) {
                // @ts-ignore
                createOption(line.label);
            }

            lineSelect.onchange = function () {
                const select = lineSelect as HTMLSelectElement;
                selectLine(select.value);
            };

            function createOption(label: string) {
                const option = document.createElement("option");
                option.text = label;
                option.value = label;
                // @ts-ignore
                lineSelect.appendChild(option);
            }
        }

        function selectLine(value: string) {
            for (const menu of menus) {
                if (menu.textContent?.includes(value)) {
                    menu.click();
                    OCS.setting.cx.video.line = value;
                    setItem("setting.cx.video.line", value);
                    break;
                }
            }
        }
    }

    /**
     * 视频播放
     */
    return new Promise<void>((resolve) => {
        if (media) {
            media.muted = mute;
            media.play();
            media.playbackRate = playbackRate;

            var playFunction = function () {
                // @ts-ignore
                if (!media.ended && !media.__played__) {
                    media.play();
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
    logger("info", "开始自动答题");

    const { period, timeout, retry, stopWhenError } = defaults(setting, defaultSetting().work);

    if (OCS.setting.cx.video.upload === "close") {
        logger("warn", "章节测试已经关闭");
        return;
    }

    if (OCS.setting.answererWrappers.length === 0) {
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
    const { search } = domSearch({ search: "#search-results" }, top?.document);
    clearSearchResult(search);

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
                return defaultAnswerWrapperHandler(OCS.setting.answererWrappers, type, title);
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
                const result = createSearchResultElement(res);
                if (search && result) {
                    search.appendChild(result);
                }
            }

            logger("info", "题目完成结果 : ", res);
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
        uploadRate: OCS.setting.cx.video.upload,
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
