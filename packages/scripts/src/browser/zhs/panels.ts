import { DefineComponent } from "vue";
import {
    createSettingPanel,
    createWorkerSetting,
    CreateWorkerSettingConfig,
    SettingInput,
    SettingSelect,
} from "../core/create.element";

/**
 * 创建智慧树视频设置面板
 * @param creditStudy 是否为学分课
 */
export function createZHSStudySettingPanel(creditStudy: boolean = false): DefineComponent {
    const settings = OCS.setting.zhs.video;

    const watchTimeSetting = {
        label: "播放时间(小时)",
        ref: "setting.zhs.video.watchTime",
        type: "number",
        attrs: {
            title: "播放时间到后, 将会自动暂停。\n如设置为0, 则不会自动暂停",
            value: settings.watchTime,
            min: 0,
            max: 24,
            step: 0.1,
        },
    };

    const settingInputs = [
        {
            label: "视频倍速",
            ref: "setting.zhs.video.playbackRate",
            type: "number",
            attrs: {
                title: creditStudy ? "学分课不可修改倍速" : "不能大于1.5倍速,否则容易封号",
                value: creditStudy ? 1 : settings.playbackRate,
                min: 1.0,
                max: 1.5,
                step: 0.25,
                disabled: creditStudy,
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
        },
    ] as (SettingSelect | SettingInput)[];

    if (!creditStudy) {
        settingInputs.unshift(watchTimeSetting as SettingInput);
    }

    return createSettingPanel(...settingInputs);
}

/**
 * 创建智慧树 作业/考试 设置面板
 */
export function createZHSWorkSettingPanel(config?: CreateWorkerSettingConfig) {
    const settings = OCS.setting.zhs.work;

    return createSettingPanel(
        /** 作业答题设置 */
        ...createWorkerSetting("作业提交", "setting.zhs.work.upload", {
            defaultUpload: config?.defaultUpload || settings.upload,
            options: config?.options,
        }),
        {
            label: "答题间隔(秒)",
            ref: "setting.zhs.work.period",
            type: "number",
            attrs: {
                value: settings.period,
                min: 0,
                step: 1,
            },
        },
        {
            label: "搜题请求超时时间(秒)",
            ref: "setting.zhs.work.timeout",
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
            ref: "setting.zhs.work.retry",
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
            ref: "setting.zhs.work.stopWhenError",
            type: "checkbox",
            attrs: {
                checked: settings.stopWhenError,
            },
        }
    );
}
