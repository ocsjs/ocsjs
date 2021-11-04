import { Frame } from "puppeteer-core";
import { BaseTask, ScriptSetting } from "../../../../types";

// 媒体播放脚本
export async function MediaScript(selector: "video" | "audio", task: BaseTask, frame: Frame, setting: ScriptSetting["script"]["cx"]["media"]) {
    const video = await frame.$(selector);

    if (video) {
        const name = selector === "video" ? "视频" : "音频";
        task.process(`正在播放${name}`);

        await frame.evaluate(
            (video: HTMLVideoElement, playbackRate, mute) => {
                return new Promise<void>((resolve, reject) => {
                    window.scrollTo({
                        top: video.offsetHeight,
                        behavior: "smooth",
                    });

                    video.playbackRate = playbackRate;
                    video.muted = mute;
                    video.onpause = function () {
                        if (!video.ended) {
                            video.play();
                        }
                    };
                    setTimeout(() => {
                        video.onended = function () {
                            resolve();
                        };
                    }, 3000);

                    video.play();
                });
            },
            video,
            setting.playbackRate,
            setting.mute
        );
        task.process(`${name}播放完毕`);
    }
}
