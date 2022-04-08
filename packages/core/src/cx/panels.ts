import { DefineComponent, h } from "vue";
import { createSettingPanel, createWorkerSetting, CreateWorkerSettingConfig } from "../core/create.element";

/**
 * 创建超星学习设置面板
 */

export function createCXStudySettingPanel(): DefineComponent {
    const settings = OCS.setting.cx.video;

    return createSettingPanel(
        /** 视频章节测试答题设置 */

        {
            label: "视频倍速",
            ref: "setting.cx.video.playbackRate",
            type: "number",
            attrs: {
                title: "高倍速可能导致封号或者频繁验证码\n超星后台可以看到学习时长\n请谨慎设置。",
                value: settings.playbackRate.toString(),
                min: "1",
                max: "16",
                step: "1",
            },

            icons: [
                {
                    type: "bi bi-info-circle",
                    attrs: {
                        title: "高倍速可能导致封号或者频繁验证码\n超星后台可以看到学习时长\n请谨慎设置。",
                    },
                },
            ],
        },
        {
            label: "播放路线",
            ref: "setting.cx.video.line",
            type: "select",
            attrs: { id: "video-line", value: settings.line || "" },
            options: (
                [
                    settings.line ? { label: "指定-" + settings.line, value: settings.line } : [],
                    {
                        label: "请指定路线(播放视频后才可选择, 无需保存)",
                        value: "",
                    },
                ] as any[]
            ).flat(),
        },
        {
            label: "静音模式",
            ref: "setting.cx.video.mute",
            type: "checkbox",
            attrs: {
                checked: settings.mute,
            },
        },
        {
            label: "复习模式",
            ref: "setting.cx.video.restudy",
            type: "checkbox",
            attrs: {
                title: "将播放过的视频再播放一遍。",
                checked: settings.restudy,
            },
        },
        h("hr"),
        h("hr"),
        ...createWorkerSetting("章节测试", "setting.cx.video.upload", {
            defaultUpload: settings.upload,
        }),
        {
            label: "答题间隔(秒)",
            ref: "setting.cx.work.period",
            type: "number",
            attrs: {
                value: OCS.setting.cx.work.period,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求超时时间(秒)",
            ref: "setting.cx.work.timeout",
            type: "number",
            attrs: {
                title: "每道题最多做n秒, 超过则跳过此题。",
                value: OCS.setting.cx.work.timeout,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求重试次数",
            ref: "setting.cx.work.retry",
            type: "number",
            attrs: {
                value: OCS.setting.cx.work.retry,
                min: 0,
                max: 2,
                step: 1,
            },
        },
        {
            label: "发生错误时暂停答题",
            ref: "setting.cx.work.stopWhenError",
            type: "checkbox",
            attrs: {
                checked: OCS.setting.cx.work.stopWhenError,
            },
        }
    );
}

export function createCXWorkSettingPanel(isExam: boolean, config?: CreateWorkerSettingConfig) {
    const settings = OCS.setting.cx.work;

    return createSettingPanel(
        /** 作业答题设置 */
        ...createWorkerSetting(isExam ? "考试提交" : "作业提交", "setting.cx.work.upload", {
            defaultUpload: config?.defaultUpload || settings.upload,
            options: config?.options,
        }),
        {
            label: "答题间隔(秒)",
            ref: "setting.cx.work.period",
            type: "number",
            attrs: {
                value: settings.period,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求超时时间(秒)",
            ref: "setting.cx.work.timeout",
            type: "number",
            attrs: {
                title: "每道题最多做n秒, 超过则跳过此题。",
                value: settings.timeout,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求重试次数",
            ref: "setting.cx.work.retry",
            type: "number",
            attrs: {
                value: settings.retry,
                min: 0,
                max: 2,
                step: 1,
            },
        },
        {
            label: "发生错误时暂停答题",
            ref: "setting.cx.work.stopWhenError",
            type: "checkbox",
            attrs: {
                checked: settings.stopWhenError,
            },
        }
    );
}
