import { defaults } from "lodash";
import { logger } from "../../logger";
import { domSearch, sleep, StringUtils } from "../core/utils";
import { OCSWorker } from "../core/worker";
import { defaultAnswerWrapperHandler } from "../core/worker/answer.wrapper.handler";
import { createSearchResultElement } from "../core/worker/utils";
import { defaultSetting, ScriptSettings } from "../scripts";

export async function workOrExam(
    setting: ScriptSettings["cx"]["work"] | ScriptSettings["cx"]["exam"],
    isExam: boolean
) {
    const { period, timeout, retry, stopWhenError } = defaults(setting, defaultSetting().work);

    if (setting.upload === "close") {
        logger("warn", "章节测试已经关闭");
        return;
    }

    const { search } = domSearch({ search: "#search-results" });
    if (search) search.innerHTML = "";

    /** 新建答题器 */
    const worker = new OCSWorker({
        root: ".questionLi",
        elements: {
            title: "h3",
            options: ".answerBg .answer_p, .textDIV, .eidtDiv",
            type: isExam ? 'input[name^="type"]' : 'input[id^="answertype"]',
        },
        /** 默认搜题方法构造器 */
        answerer: (elements, type) => {
            const title: string = StringUtils.nowrap(elements.title[0].innerText)
                .replace(/\d+\. \(.*?(题|分)\)/, "")
                .trim();
            if (title) {
                return defaultAnswerWrapperHandler(OCS.setting.answererWrappers, type, title);
            } else {
                throw new Error("题目为空，请查看题目是否为空，或者忽略此题");
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
                    : type === 4
                    ? "completion"
                    : undefined;
            },
            /** 自定义处理器 */
            handler(type, answer, option) {
                if (type === "judgement" || type === "single" || type === "multiple") {
                    if (option.parentElement?.querySelector(".check_answer,.check_answer_dx") === null) {
                        option.click();
                    }
                } else if (type === "completion" && answer.trim()) {
                    const text = option.querySelector("textarea");
                    const textareaFrame = option.querySelector("iframe");
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
        uploadRate: setting.upload,
        results,
        async callback(finishedRate, uploadable) {
            if (isExam) {
                logger("info", "为了安全考虑，请自行检查后自行点击提交！");
            } else {
                logger("info", "完成率 : ", finishedRate, " , ", uploadable ? "5秒后将自动提交" : "5秒后将自动保存");
                // @ts-ignore
                console.log("window", unsafeWindow);

                await sleep(5000);
                if (uploadable) {
                    //  提交
                    domSearch({ submit: ".completeBtn" }).submit?.click();
                    await sleep(2000);
                    // @ts-ignore 确定
                    submitWork();
                } else {
                    // @ts-ignore 暂时保存
                    saveWork();
                }
            }
        },
    });
}
