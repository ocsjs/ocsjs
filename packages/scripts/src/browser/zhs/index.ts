import { Worker } from "./../common/worker/worker";
import { logger } from "../../logger";
import { createNote } from "../common/create.element";
import { defineScript } from "../common/define.script";
import { AnswererWrapper, WorkOptions } from "../common/worker/interface";
import { defaultSetting } from "../scripts";
import { createZHSVideoSettingPanel, createZHSWorkSettingPanel } from "./panels";

import { study } from "./study";
import { defaultAnswerWrapperHandler } from "../common/worker/question.resolver";
import { sleep } from "../common/utils";
import { getItem } from "../common/store";

export const ZHSScript = defineScript({
    name: "知道智慧树",
    routes: [
        {
            name: "视频脚本",
            settingPath: "setting.zhs.video",
            url: "**zhihuishu.com/videoStudy.html**",
            async script(setting) {
                await sleep(5000);
                // 智慧树视频学习
                await study(setting || defaultSetting().video);
            },
        },
        {
            name: "作业脚本",
            settingPath: "setting.zhs.work",
            url: "**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**",
            async script(setting: Required<Pick<WorkOptions, "period" | "retry" | "timeout" | "stopWhenError">>) {
                await sleep(5000);
                const { period, timeout, retry, stopWhenError } = setting || defaultSetting().work;

                /** 新建答题器 */
                const worker = new Worker({
                    root: ".examPaper_subject",
                    elements: {
                        title: ".subject_describe",
                        options: ".subject_node .nodeLab",
                    },
                    /** 默认搜题方法构造器 */
                    answerer: (elements) => {
                        return defaultAnswerWrapperHandler(
                            elements,
                            JSON.parse(getItem("setting.answererWrappers")) as AnswererWrapper[]
                        );
                    },
                    work: {
                        /** 自定义处理器 */
                        handler(type, answer, element) {
                            if (type === "judgement" || type === "single" || type === "multiple") {
                                if (!element.querySelector("input")?.checked) {
                                    element.click();
                                }
                            } else if (type === "completion" && element.querySelector("textarea")?.innerText === "") {
                                const text = element.querySelector("textarea");
                                if (text) {
                                    text.value = answer;
                                }
                            }
                        },
                    },
                    onResult: (res) => logger("info", "题目完成结果 : ", res),

                    /** 其余配置 */

                    period: period * 1000,
                    timeout: timeout * 1000,
                    retry,
                    stopWhenError,
                });

                await worker.doWork();
            },
        },
    ],
    panels: [
        {
            name: "智慧树助手",
            url: "https://www.zhihuishu.com/",
            el: () => createNote("提示您:", "点击登录后, 进入个人页面才能使用其他的功能哦。"),
        },
        {
            name: "智慧树助手",
            url: "https://onlineweb.zhihuishu.com/onlinestuh5",
            el: () => createNote("提示您:", "请点击任意的课程进入。"),
        },
        {
            name: "视频助手",
            url: "**zhihuishu.com/videoStudy.html**",

            el: () =>
                createNote(
                    "进入 视频设置面板 可以调整视频设置",
                    "点击右侧 作业考试 可以使用作业功能",
                    "注意: 考试功能暂未开放",
                    "5秒后自动开始播放视频..."
                ),
            children: [
                {
                    name: "视频设置面板",
                    el: () => createZHSVideoSettingPanel(),
                },
            ],
        },
        {
            name: "作业考试助手",
            url: "**zhihuishu.com/stuExamWeb.html#/webExamList?**",
            el: () => createNote("点击任意作业可以使用作业功能", "注意: 考试功能暂未开放"),
        },
        {
            name: "作业助手",
            url: "**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**",
            el: () => createNote("进入 作业设置面板 可以调整作业设置", "5秒后自动开始作业..."),
            children: [
                {
                    name: "作业设置面板",
                    el: () => createZHSWorkSettingPanel(),
                },
            ],
        },
    ],
});
