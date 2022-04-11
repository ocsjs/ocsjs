import { logger } from "../../logger";
import { sleep } from "../../core/utils";
import { ScriptSettings } from "../../scripts";
import { store } from "..";

let stop = false;

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

            /**
             * 实时监测，关闭弹窗测验
             */
            setInterval(() => closeTestDialog(), 3000);

            /**
             * 到达学习时间后，自动关闭
             */
            autoClose(watchTime);

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
export async function watch(setting?: Pick<ScriptSettings["zhs"]["video"], "playbackRate" | "mute">) {
    const { mute = true } = setting || {};
    return new Promise<void>((resolve, reject) => {
        try {
            const video = document.querySelector("video") as HTMLVideoElement;
            // 设置当前视频
            store.currentMedia = video;

            video.onpause = function () {
                if (!video.ended) {
                    if (stop) {
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
            video.play();
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * 关闭zhs共享课测验弹窗
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

/** 校内学分课 */
export async function creditStudy(setting?: ScriptSettings["zhs"]["video"]) {
    const { restudy = false } = setting || {};

    /** 查找任务 */
    let list: HTMLLIElement[] = Array.from(document.querySelectorAll(".file-item"));

    /** 如果不是复习模式，则排除掉已经完成的任务 */
    if (!restudy) {
        list = list.filter((el) => el.querySelector(".icon-finish") === null);
    }

    console.log(list);

    const item = list[0];
    if (item) {
        if (item.classList.contains("active")) {
            await watch({
                mute: setting?.mute || true,
                playbackRate: 1,
            });
            /** 下一章 */
            if (list[1]) list[1].click();
        } else {
            item.click();
        }
    }
}

/**
 * 到达学习时间后，自动关闭
 */
export function autoClose(watchTime: number) {
    if (watchTime !== 0) {
        let time = 0;
        // 清空之前的计数器
        clearInterval(store.setting.zhs.video.interval);
        // 开始计时
        store.setting.zhs.video.interval = setInterval(() => {
            if (time >= watchTime * 60 * 60 * 1000) {
                clearInterval(store.setting.zhs.video.interval);
                const video: HTMLVideoElement = document.querySelector("video") as any;
                video.pause();
                stop = true;
            } else {
                time += 1000;
            }
        }, 1000);
    } else {
        // 清空的计数器
        clearInterval(store.setting.zhs.video.interval);
    }
}
