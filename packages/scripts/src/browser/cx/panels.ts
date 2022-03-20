import { DefineComponent, h } from "vue";
import { getItem } from "../common/store";
import { defaultSetting, ScriptSettings } from "../scripts";
import { createSettingPanel, createWorkerSetting } from "../common/create.element";

/**
 * 创建超星设置面板
 */

export function createCXSettingPanel(): DefineComponent {
    const settings: ScriptSettings["cx"]["video"] = getItem("setting.cx.video", defaultSetting().video);

    return createSettingPanel(
        /** 视频章节测试答题设置 */
        ...createWorkerSetting("章节测试", "setting.cx.video.upload", {
            upload: settings.upload,
            answererWrappers: getItem("setting.answererWrappers"),
        }),
        {
            label: "视频倍速",
            ref: "setting.cx.video.playbackRate",
            type: "number",
            attrs: {
                title: "高倍速可能导致封号或者频繁验证码，请谨慎设置。",
                value: settings.playbackRate.toString(),
                min: "1",
                max: "16",
                step: "1",
            },
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
        }
    );
}
