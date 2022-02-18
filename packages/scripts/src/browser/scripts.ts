 
 
import { ZHS } from ".";
import { logger, urlGlob } from "./util";

interface Settings {
    智慧树: {
        视频: {
            "观看时间(分钟)": number;
            "播放速度(倍速)": number;
            视频静音: boolean;
            复习模式: boolean;
        };
        作业: {};
        考试: {};
    };
    超星: {
        视频: {};
        作业: {};
        考试: {};
    };
}

const supportURL = {
    智慧树: "zhihuishu.com",
    超星: "chaoxing.com",
};

export async function start(settings: Partial<Settings>) {
    if (urlGlob(supportURL.智慧树)) {
        await (settings.智慧树 ? zhs(settings.智慧树) : logger("error", "未指定 智慧树脚本 的运行参数"));
    } else if (urlGlob(supportURL.超星)) {
        await (settings.超星 ? cx(settings.超星) : logger("error", "未指定 超星脚本 的运行参数"));
    } else {
        logger("error", "当前页面 "+window.location.host+" 不在指定的范围内, 支持的范围如下 : ");
        for (const url of Reflect.ownKeys(supportURL)) {
            logger("debug", url, Reflect.get(supportURL, url));
        }
    }
}

// 智慧树脚本
async function zhs(settings: Settings["智慧树"]) {
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
async function cx(settings: Settings["超星"]) {
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
