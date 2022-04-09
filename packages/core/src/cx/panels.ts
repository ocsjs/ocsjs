import { DefineComponent, h } from "vue";
import { createSettingPanel, createWorkerSetting, CreateWorkerSettingConfig } from "../core/create.element";
import { domSearch } from "../core/utils";
import { switchPlayLine } from "./study";

/**
 * 创建超星学习设置面板
 */

export function createCXStudySettingPanel(): DefineComponent {
    const settings = OCS.setting.cx.video;

    return createSettingPanel(
        /** 视频章节测试答题设置 */

        {
            label: "视频倍速",
            type: "number",
            attrs: {
                title: "高倍速可能导致封号或者频繁验证码\n超星后台可以看到学习时长\n请谨慎设置。",
                value: settings.playbackRate,
                min: "1",
                max: "16",
                step: "1",
                onchange: (e: any) => {
                    settings.playbackRate = e.target.valueAsNumber;
                },
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
            type: "select",
            attrs: {
                id: "video-line",
                value: settings.line || "",
                onchange: (e: any) => {
                    settings.line = e.target.value;
                    const { iframe } = domSearch({ iframe: "iframe" });
                    const win = (iframe as HTMLIFrameElement).contentWindow;
                    win?.location.reload();
                },
            },
            options: (
                [
                    settings.line ? { label: "指定-" + settings.line, value: settings.line } : [],
                    ...[
                        Array.from(settings.playlines || [{ label: "公网1" }, { label: "公网2" }]).map((line: any) => ({
                            label: line.label,
                            value: line.label,
                        })),
                    ],
                    {
                        label: "请指定路线(播放视频后才可选择, 无需保存)",
                        value: "",
                    },
                ] as any[]
            ).flat(),
        },
        {
            label: "静音模式",
            type: "checkbox",
            attrs: {
                onchange: (e: any) => (settings.mute = e.target.checked),
                checked: settings.mute,
            },
        },
        {
            label: "复习模式",
            type: "checkbox",
            attrs: {
                onchange: (e: any) => (settings.restudy = e.target.checked),
                title: "将播放过的视频再播放一遍。",
                checked: settings.restudy,
            },
        },
        h("hr"),
        h("hr"),
        ...createWorkerSetting(
            "章节测试",
            {
                defaultUpload: settings.upload,
            },
            (e: any) => (settings.upload = e.target.value)
        ),
        {
            label: "答题间隔(秒)",
            type: "number",
            attrs: {
                onchange: (e: any) => (OCS.setting.cx.work.period = e.target.valueAsNumber),
                value: OCS.setting.cx.work.period,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求超时时间(秒)",
            type: "number",
            attrs: {
                onchange: (e: any) => (OCS.setting.cx.work.timeout = e.target.valueAsNumber),
                title: "每道题最多做n秒, 超过则跳过此题。",
                value: OCS.setting.cx.work.timeout,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求重试次数",
            type: "number",
            attrs: {
                onchange: (e: any) => (OCS.setting.cx.work.retry = e.target.valueAsNumber),
                value: OCS.setting.cx.work.retry,
                min: 0,
                max: 2,
                step: 1,
            },
        },
        {
            label: "发生错误时暂停答题",
            type: "checkbox",
            attrs: {
                onchange: (e: any) => (OCS.setting.cx.work.retry = e.target.checked),
                checked: OCS.setting.cx.work.stopWhenError,
            },
        }
    );
}

export function createCXWorkSettingPanel(isExam: boolean, config?: CreateWorkerSettingConfig) {
    const settings = OCS.setting.cx.work;

    return createSettingPanel(
        /** 作业答题设置 */
        ...createWorkerSetting(
            isExam ? "考试提交" : "作业提交",
            {
                defaultUpload: config?.defaultUpload || settings.upload,
                options: config?.options,
            },
            (e: any) => (settings.upload = e.target.value)
        ),
        {
            label: "答题间隔(秒)",
            type: "number",
            attrs: {
                onchange: (e: any) => (settings.period = e.target.valueAsNumber),
                value: settings.period,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求超时时间(秒)",
            type: "number",
            attrs: {
                title: "每道题最多做n秒, 超过则跳过此题。",
                onchange: (e: any) => (settings.timeout = e.target.valueAsNumber),
                value: settings.timeout,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求重试次数",

            type: "number",
            attrs: {
                onchange: (e: any) => (settings.retry = e.target.valueAsNumber),
                value: settings.retry,
                min: 0,
                max: 2,
                step: 1,
            },
        },
        {
            label: "发生错误时暂停答题",
            type: "checkbox",
            attrs: {
                onchange: (e: any) => (settings.stopWhenError = e.target.valueAsNumber),
                checked: settings.stopWhenError,
            },
        }
    );
}
