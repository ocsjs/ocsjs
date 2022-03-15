interface BaseSetting {
    token: string;
}

export interface Setting {
    video: {
        [x: string]: any;
        watchTime: number;
        playbackRate: number;
        mute: boolean;
        restudy: boolean;
    };
    work: { [x: string]: any };
    exam: { [x: string]: any };
}

type SupportPlatform = "zhs" | "cx";

export type ScriptSettings = BaseSetting & Record<SupportPlatform, Setting>;

export const scriptOptionTemplates: Record<SupportPlatform, Setting> = {
    zhs: defaultSetting(),
    cx: defaultSetting(),
};

export function defaultSetting(): Setting {
    return {
        video: {
            watchTime: 0,
            playbackRate: 1,
            restudy: false,
            mute: true,
        },
        work: {},
        exam: {},
    };
}
