import { createNote, createSearchResultPanel, createTerminalPanel } from "../../components";
import { defineScript } from "../../core/define.script";
import { defaultSetting } from "../../scripts";
import { creditStudy, study } from "./study";
import { domSearch, sleep } from "../../core/utils";
import { work } from "./work";
import { logger } from "../../logger";
import { store } from "..";
import { StudySettingPanel } from "../../components/zhs/StudySettingPanel";
import { WorkSettingPanel } from "../../components/zhs/WorkSettingPanel";

export const ZHSScript = defineScript({
    name: "知道智慧树",
    routes: [
        {
            name: "共享课视频脚本",
            url: "**zhihuishu.com/videoStudy.html**",
            async onload(setting = store.setting.zhs.video) {
                await sleep(5000);
                setting.creditStudy = false;
                // 智慧树视频学习
                logger("info", "开始智慧树共享课视频学习");
                await study(setting || defaultSetting().video);
            },
        },
        {
            name: "学分课视频脚本",
            /** 学分共享课（翻转课） */
            url: "**zhihuishu.com/aidedteaching/sourceLearning/**",
            async onload(setting = store.setting.zhs.video) {
                await sleep(5000);
                setting.creditStudy = true;
                // 智慧树视频学习
                logger("info", "开始智慧树学分课视频学习");
                await creditStudy(setting || defaultSetting().video);
            },
        },
        {
            name: "作业脚本",
            url: "**zhihuishu.com/stuExamWeb.html#/webExamList/dohomework**",
            async onload(setting = store.setting.zhs.work) {
                await sleep(5000);
                if (store.setting.answererWrappers.length === 0) {
                    logger("error", "未设置题库配置！");
                    confirm("未设置题库配置！请在设置面板设置后刷新重试！");
                } else {
                    /** 运行作业脚本 */
                    await work(setting);
                }
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
            name: "共享课视频助手",
            /** 共享课 */
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
                    name: "学习设置",
                    el: () => StudySettingPanel,
                },
                createTerminalPanel(),
            ],
        },
        {
            name: "学分课视频助手",
            /** 学分共享课（翻转课） */
            url: "**zhihuishu.com/aidedteaching/sourceLearning/**",
            el: () =>
                createNote(
                    "进入 视频设置面板 可以调整视频设置",
                    "学分课默认1倍速, 不可修改",
                    "5秒后自动开始播放视频..."
                ),
            children: [
                {
                    name: "学习设置",
                    el: () => StudySettingPanel,
                },
                createTerminalPanel(),
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
                    name: "作业设置",
                    el: () => WorkSettingPanel,
                },
                createTerminalPanel(),
                createSearchResultPanel(),
            ],
        },
    ],
});
