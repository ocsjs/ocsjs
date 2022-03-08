import { ZHS } from ".";
import { logger, urlGlob } from "./util";

interface BaseSetting {
    查题码: string;
    图鉴账号: string;
    图鉴密码: string;
}

interface Setting {
    视频: {
        "观看时间(分钟)": number;
        "播放速度(倍速)": number;
        视频静音: boolean;
        复习模式: boolean;
    };
    作业: {};
    考试: {};
}

type supportPlatform = "智慧树" | "超星";

type ScriptSettings = { 基础设置: BaseSetting } & Record<supportPlatform, Setting>;

const supportURL: Record<supportPlatform, string> = {
    智慧树: "zhihuishu.com",
    超星: "chaoxing.com",
};

export const scriptOptionTemplates: Record<supportPlatform, Setting> = {
    智慧树: defaultSetting(),
    超星: defaultSetting(),
};

export function defaultSetting(): Setting {
    return {
        视频: {
            "观看时间(分钟)": 0,
            "播放速度(倍速)": 1,
            复习模式: false,
            视频静音: true,
        },
        作业: {},
        考试: {},
    };
}

export async function start(settings: Partial<ScriptSettings>) {
    if (urlGlob(supportURL.智慧树)) {
        await (settings.智慧树 ? zhs(settings.智慧树) : logger("error", "未指定 智慧树脚本 的运行参数"));
    } else if (urlGlob(supportURL.超星)) {
        await (settings.超星 ? cx(settings.超星) : logger("error", "未指定 超星脚本 的运行参数"));
    } else {
        logger("error", "当前页面 " + window.location.host + " 不在指定的范围内, 支持的范围如下 : ");
        for (const url of Reflect.ownKeys(supportURL)) {
            logger("debug", url, Reflect.get(supportURL, url));
        }
    }
}

// 智慧树脚本
async function zhs(settings: ScriptSettings["智慧树"]) {
    if (urlGlob("**videoStudy.html**")) {
        const setting = settings["视频"];
        // 智慧树视频学习
        await ZHS.study({
            watchTime: setting["观看时间(分钟)"],
            playbackRate: setting["播放速度(倍速)"],
            mute: setting["视频静音"],
            restudy: setting["复习模式"],
        });
    }
}

// 超星脚本
async function cx(settings: ScriptSettings["超星"]) {
    if (urlGlob("**mycourse/studentstudy**")) {
        if (urlGlob("**/mycourse/studentstudy**mooc2=1**")) {
            // chaoxing code here...
        } else {
            // 跳转到最新版本的超星
            const params = new URLSearchParams(window.location.href);
            if (!params.get("mooc2")) {
                params.set("mooc2", "1");
            }
            window.location.href = params.toString();
        }
    }
}
