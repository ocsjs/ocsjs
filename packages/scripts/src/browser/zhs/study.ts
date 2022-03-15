import { logger } from "../../logger";
import { sleep } from "../common/util";
import { ScriptSettings } from "../scripts";

/**
 * zhs 视频学习
 */
export async function study(setting?: ScriptSettings["zhs"]["video"]) {
    const { watchTime = 30, restudy = false } = setting || {};
    logger("info", "zhs 学习任务开始");

    await new Promise<void>(async (resolve) => {
        /** 查找任务 */
        let list: HTMLLIElement[] = Array.from(document.querySelectorAll("li.clearfix.video"));

        /** 如果不是复习模式，则排除掉已经完成的任务 */
        if (!restudy) {
            list = list.filter((el) => el.querySelector(".time_icofinish") === null);
        }

        if (list.length === 0) {
            logger("warn", "视频任务数量为 0 !");
        } else {
            logger("info", "视频任务数量", list.length);

            let stop = false;

            /**
             * 实时监测，关闭弹窗测验
             */
            setInterval(() => {
                closeTestDialog();
            }, 3000);

            /**
             * 到达学习时间后，自动关闭
             */
            if (watchTime !== 0) {
                logger("info", "将在", watchTime, "小时后自动暂停");
                setTimeout(() => {
                    const video: HTMLVideoElement = document.querySelector("video") as any;
                    (video as any).stop = true;
                    video.pause();
                    stop = true;
                    resolve();
                }, watchTime * 60 * 60 * 1000);
            }

            /** 遍历任务进行学习 */
            for (const item of list) {
                try {
                    if (stop) {
                        break;
                    } else {
                        logger(
                            "debug",
                            `即将播放 -- ${item.querySelector('[class="catalogue_title"]')?.getAttribute("title")} : ${
                                item.querySelector(".time")?.textContent
                            }`
                        );
                        item.click();
                        await sleep(5000);
                        await watch(setting);
                    }
                } catch (e) {
                    logger("error", e);
                }
            }
        }

        resolve();
    });
    logger("info", "zhs 学习任务结束");
}

/**
 * 观看视频
 * @param setting
 * @returns
 */
export async function watch(setting?: ScriptSettings["zhs"]["video"]) {
    const { playbackRate = 1, mute = true } = setting || {};
    return new Promise<void>((resolve, reject) => {
        try {
            const video = document.querySelector("video") as HTMLVideoElement;

            video.onpause = function () {
                if (!video.ended) {
                    if ((video as any).stop) {
                        resolve();
                    } else {
                        video.play();
                    }
                }
            };
            video.onended = function () {
                resolve();
            };
            // 静音
            video.muted = mute;
            // 改变速率
            video.playbackRate = parseFloat(playbackRate.toString());
            const playbackRateText = document.querySelector("div.speedBox > span") as HTMLVideoElement;
            playbackRateText.textContent = "X " + video.playbackRate;

            video.play();
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * 关闭zhs测验弹窗
 */
export async function closeTestDialog() {
    if (document.querySelectorAll(".topic-item").length != 0) {
        //选择A
        (document.querySelector(".topic-item") as HTMLElement).click();
        await sleep(500);
        //关闭
        (document.querySelector(`[aria-label="弹题测验"] .btn`) as HTMLElement).click();
        await sleep(500);
    }
}
