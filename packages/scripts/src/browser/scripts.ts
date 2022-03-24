import { AnswererWrapper } from "./core/worker/answer.wrapper.handler";
import { WorkOptions } from "./core/worker/interface";

export interface Setting {
    video: {
        [x: string]: any;
        watchTime: number;
        playbackRate: number;
        mute: boolean;
        restudy: boolean;
    };
    work: Record<string, any> &
        Pick<WorkOptions<any>, "period" | "timeout" | "retry" | "stopWhenError"> & { upload: string };
    exam: Record<string, any> &
        Pick<WorkOptions<any>, "period" | "timeout" | "retry" | "stopWhenError"> & { upload: string };
}

type SupportPlatform = "zhs" | "cx";

export type ScriptSettings = Record<SupportPlatform, Setting>;

export const defaultOCSSetting = {
    zhs: defaultSetting(),
    cx: defaultSetting(),
    answererWrappers: [] as AnswererWrapper[],
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
            upload: "save",
        },
        exam: {
            period: 3,
            timeout: 30,
            retry: 1,
            stopWhenError: false,
            upload: "save",
        },
    };
}
