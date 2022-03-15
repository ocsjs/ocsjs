import { DefineComponent } from "vue";
import { getItem } from "../common/store";
import { defaultSetting, ScriptSettings } from "../scripts";
import { createSettingPanel } from "../common/create.element";

/**
 * 创建智慧树设置面板
 */

export function createZHSSettingPanel(): DefineComponent {
    const settings: ScriptSettings["zhs"]["video"] = getItem("setting.zhs.video", defaultSetting().video);

    return createSettingPanel(
        {
            label: "播放时间(小时)",
            ref: "setting.zhs.video.watchTime",
            type: "number",
            attrs: {
                title: "播放时间到后, 将会自动暂停。\n如设置为0, 则不会自动暂停",
                value: settings.watchTime.toString(),
                min: "0",
                max: "24",
                step: "0.5",
            },
        },
        {
            label: "视频倍速",
            ref: "setting.zhs.video.playbackRate",
            type: "number",
            attrs: {
                title: "不能大于1.5倍速,否则容易封号",
                value: settings.playbackRate.toString(),
                min: "1.0",
                max: "1.5",
                step: "0.25",
            },
        },
        {
            label: "静音模式",
            ref: "setting.zhs.video.mute",
            type: "checkbox",
            attrs: {
                checked: settings.mute,
            },
        },
        {
            label: "复习模式",
            ref: "setting.zhs.video.restudy",
            type: "checkbox",
            attrs: {
                title: "将播放过的视频再播放一遍。",
                checked: settings.restudy,
            },
        }
    );
}
