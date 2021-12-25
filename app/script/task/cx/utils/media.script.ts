import { Frame } from "puppeteer-core";
import { BaseTask, ScriptSetting } from "../../../../types";

// 媒体播放脚本
export async function MediaScript(selector: "video" | "audio", task: BaseTask, frame: Frame, setting: ScriptSetting["script"]["cx"]["study"]["media"]) {
    const video = await frame.$(selector);

    if (video) {
        const name = selector === "video" ? "视频" : "音频";
        task.process(`正在播放${name}`);

        await frame.evaluate(
            (video: HTMLVideoElement, playbackRate, mute) => {
                return new Promise<void>((resolve, reject) => {
                    video.playbackRate = playbackRate;
                    video.muted = mute;

                    video.onpause = function () {
                        if (!video.ended && video.paused) {
                            video.play();
                        }
                    };

                    video.onended = function () {
                        resolve();
                    };
                 

                    setTimeout(() => {
                        video.play();
                    }, 1000);
                });
            },
            video,
            setting.playbackRate,
            setting.mute
        );
        task.process(`${name}播放完毕`);
    }
}
