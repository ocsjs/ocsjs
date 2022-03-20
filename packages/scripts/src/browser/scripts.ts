import { WorkOptions } from "./common/worker/interface";

export interface Setting {
    video: {
        [x: string]: any;
        watchTime: number;
        playbackRate: number;
        mute: boolean;
        restudy: boolean;
    };
    work: Record<string, any> & Pick<WorkOptions, "period" | "timeout" | "retry" | "stopWhenError">;
    exam: Record<string, any> & Pick<WorkOptions, "period" | "timeout" | "retry" | "stopWhenError">;
}

type SupportPlatform = "zhs" | "cx";

export type ScriptSettings = Record<SupportPlatform, Setting>;

export const scriptOptionTemplates: Record<SupportPlatform, Setting> = {
    zhs: defaultSetting(),
    cx: defaultSetting(),
};

/**
 * 默认设置
 */
export function defaultSetting(): Setting {
    return {
        video: {
            watchTime: 0,
            playbackRate: 1,
            restudy: false,
            mute: true,
        },
        work: {
            period: 3,
            timeout: 30,
            retry: 1,
            stopWhenError: false,
        },
        exam: {
            period: 3,
            timeout: 30,
            retry: 1,
            stopWhenError: false,
        },
    };
}
