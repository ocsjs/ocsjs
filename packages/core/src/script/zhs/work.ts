import defaults from "lodash/defaults";
import { logger } from "../../logger";
import { domSearch, sleep } from "../../core/utils";
import { defaultAnswerWrapperHandler } from "../../core/worker/answer.wrapper.handler";
import { OCSWorker } from "../../core/worker";
import { defaultSetting, ScriptSettings } from "../../scripts";

import { store } from "..";

export async function work(setting: ScriptSettings["zhs"]["work"]) {
    const { period, timeout, retry, stopWhenError } = defaults(setting, defaultSetting().work);

    if (setting.upload === "close") {
        logger("warn", "自动答题已被关闭！");
        return;
    }

    if (store.setting.answererWrappers.length === 0) {
        logger("warn", "题库配置为空，请设置。");
        return;
    }

    /** 清空答案 */
    store.workResults = [];

    /** 新建答题器 */
    const worker = new OCSWorker({
        root: ".examPaper_subject",
        elements: {
            title: ".subject_describe",
            options: ".subject_node .nodeLab",
        },
        /** 默认搜题方法构造器 */
        answerer: (elements, type) =>
            defaultAnswerWrapperHandler(store.setting.answererWrappers, type, elements.title[0].innerText),
        work: {
            /** 自定义处理器 */
            handler(type, answer, option) {
                if (type === "judgement" || type === "single" || type === "multiple") {
                    if (!option.querySelector("input")?.checked) {
                        option.click();
                    }
                } else if (type === "completion" && answer.trim()) {
                    const text = option.querySelector("textarea");
                    if (text) {
                        text.value = answer;
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
        uploadRate: setting.upload,
        results,
        async callback(finishedRate, uploadable) {
            logger("info", "完成率 : ", finishedRate, " , ", uploadable ? "5秒后将自动提交" : "5秒后将自动保存");

            await sleep(5000);

            // 保存按钮， 提交按钮
            const { saveBtn, uploadBtn } = domSearch({
                saveBtn: ".btnStyleX:not(.btnStyleXSumit)",
                uploadBtn: ".btnStyleXSumit",
            });

            if (uploadable) {
                uploadBtn?.click();
            } else {
                saveBtn?.click();
            }

            await sleep(2000);
            /** 确定按钮 */
            const { confirmBtn } = domSearch({
                confirmBtn: "[role='dialog'] .el-button--primary",
            });

            confirmBtn?.click();
        },
    });
}
