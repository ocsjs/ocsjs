import { Frame } from "puppeteer-core";
import { BaseTask, ScriptSetting } from "../../../../types";

/**
 * PPT播放脚本
 * @param task 任务
 * @param frame 窗体
 * @param setting 设置
 */
 export async function PPTScript(task: BaseTask , frame: Frame, setting: ScriptSetting["script"]["cx"]["ppt"]) {
    const imglook = await frame.$("#img.imglook");
    if (imglook) {
        task.process("正在播放PPT");
        await frame.evaluate((imglook:HTMLDivElement) => {
            window.scrollTo({
                top: imglook.offsetHeight,
                behavior: "smooth",
            });
            const finishJob = (window as any).finishJob;
            if (finishJob) finishJob();
        },imglook);
        await new Promise((r) => setTimeout(r, 3000));
        task.process("PPT播放完毕");
    }
}