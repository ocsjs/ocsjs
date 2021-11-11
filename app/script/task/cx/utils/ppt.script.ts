import { Frame } from "puppeteer-core";
import { BaseTask, ScriptSetting } from "../../../../types";

/**
 * PPT播放脚本
 * @param task 任务
 * @param frame 窗体
 * @param setting 设置
 */
export async function PPTScript(task: BaseTask, frame: Frame, setting: ScriptSetting["script"]["cx"]['study']["ppt"]) {
    const imglook = await frame.$("#img.imglook");
    if (imglook) {
        task.process("正在播放PPT");
        await frame.evaluate((imglook: HTMLDivElement) => {
            const finishJob = (window as any).finishJob;
            if (finishJob) finishJob();
        }, imglook);
        await new Promise((r) => setTimeout(r, 5000));
        task.process("PPT播放完毕");
    }
}
