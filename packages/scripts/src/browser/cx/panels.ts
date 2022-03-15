import { DefineComponent, h } from "vue";
import { getItem } from "../common/store";
import { defaultSetting, ScriptSettings } from "../scripts";
import { createSettingPanel, SettingSelect } from "../common/create.element";

/**
 * 创建超星设置面板
 */

export function createCXSettingPanel(): DefineComponent {
    const settings: ScriptSettings["cx"]["video"] = getItem("setting.cx.video", defaultSetting().video);

    return createSettingPanel(
        {
            label: "查题码",
            ref: "setting.token",
            type: "password",
            attrs: {
                required: true,
                title: "搜索题目答案使用的一串密码。",
                value: getItem("setting.token", ""),
                minLength: 16,
            },
            icons: [
                {
                    type: "bi-eye",
                    attrs: { title: "隐藏/显示 此字段" },
                    onClick(el) {
                        el.getAttribute("type") === "text"
                            ? el.setAttribute("type", "password")
                            : el.setAttribute("type", "text");
                    },
                },
                {
                    type: "bi-question-circle",
                    attrs: { title: "点击查看详情", style: { fontSize: "13px" } },
                    onClick() {
                        window.open("https://ocs.enncy.cn/token");
                    },
                },
            ],
        },
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
            label: "答题设置",
            ref: "setting.cx.video.chapterTest",
            type: "select",
            attrs: {
                title: "查题之后不管是否提交, 都会自动将选项进行保存。",
            },
            options: (
                [
                    {
                        label: "关闭自动答题",
                        value: "close",
                    },
                    ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((rate) => ({
                        label: `查到大于${rate}%的题目则自动提交`,
                        value: rate,
                        attrs: {
                            title: `例如: 100题, 搜索到大于 ${rate} 的题, 则会自动提交答案。`,
                        },
                    })),
                    {
                        label: "每个题目都查到答案才自动提交",
                        value: "100",
                    },
                ] as SettingSelect["options"]
            )?.map((option) => {
                if (option.value === settings.chapterTest) {
                    option.attrs = option.attrs || {};
                    option.attrs.selected = true;
                }
                return option;
            }),
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
