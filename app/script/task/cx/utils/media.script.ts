import { Frame } from "puppeteer-core";
import { BaseTask, ScriptSetting } from "../../../../types";

// 媒体播放脚本
export async function MediaScript(selector: "video" | "audio", task: BaseTask, frame: Frame, setting: ScriptSetting["script"]["cx"]["media"]) {
    const video = await frame.$(selector);

    if (video) {
        const name = selector === "video" ? "视频" : "音频";
        task.process(`正在播放${name}`);
        await frame.evaluate(
            (video: HTMLVideoElement, playbackRate) => {
                return new Promise<void>((resolve, reject) => {
                    video.playbackRate = playbackRate;
                    video.onended = function () {
                        resolve();
                    };

                    video.play();
                });
            },
            video,
            setting.playbackRate
        );
        task.process(`${name}播放完毕`);
    }
}
