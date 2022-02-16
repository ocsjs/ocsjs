import { logger, sleep } from "../util";

export type StudyOptions = VideoOptions & {
    /**
     * 设置观看总时长(分钟)
     *
     * 如果设置为0，将一直观看，不暂停
     *
     * @default 30
     */
    watchTime?: number;

    /**
     * 复习模式：重复观看每个视频
     *
     * @default false
     */
    restudy: boolean;
};

export interface VideoOptions {
    /**
     * 是否禁音
     *
     * @default true
     */
    mute?: boolean;
    /**
     * 视频速度
     *
     * @default 1
     */
    playbackRate?: number;
}

/**
 * zhs 视频学习
 * @param options {@link StudyOptions}
 * @returns
 */
export async function study(options?: StudyOptions) {
    const { watchTime = 30, restudy = false } = options || {};
    logger("info", "zhs 学习任务开始");

    await new Promise<void>(async (resolve, reject) => {
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
                logger("info", "将在", watchTime, "分钟后自动暂停");
                setTimeout(() => {
                    const video: HTMLVideoElement = document.querySelector("video") as any;
                    (video as any).stop = true;
                    video.pause();
                    stop = true;
                    resolve();
                }, watchTime * 60 * 1000);
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
                        await watch(options);
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
 * @param options {@link VideoOptions}
 * @returns
 */
export async function watch(options?: VideoOptions) {
    const { playbackRate = 1, mute = true } = options || {};
    return new Promise<void>((resolve, reject) => {
        try {
            const video = document.querySelector("video") as HTMLVideoElement;
            video.playbackRate = playbackRate;
            video.muted = mute;
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
