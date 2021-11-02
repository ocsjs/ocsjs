import { Frame } from "puppeteer-core";
import { BaseTask, ScriptSetting } from "../../../../types";

/**
 * 阅读书籍
 * @param task 任务
 * @param frame 窗体
 * @param setting 设置
 */
 export async function ReadBookScript(task: BaseTask , frame: Frame, setting: ScriptSetting["script"]["cx"]["book"]) {
    const readWeb = await frame.$("#Readweb");

    if (readWeb) {
        task.process("正在翻阅书本:" + ((await frame.title()) || "未知书名"));
        await readWeb.evaluate((readWeb) => {
            return new Promise(async (resolve, reject) => {
                const imgs = Array.from(document.querySelectorAll("#Readweb .duxiuimg"));
                let count = 0;
                await new Promise((resolve, reject) => {
                    const int = setInterval(() => {
                        if (count > 5) {
                            clearInterval(int);
                            resolve(true);
                            return;
                        }
                        count++;
                        (readWeb as any).scrollTo({ top: (imgs.pop() as any).offsetTop - 100, behavior: "smooth" });
                    }, 5000);
                });
                resolve(true);
            });
        }, readWeb);
        task.process("翻阅书本完成! :" + ((await frame.title()) || "未知书名"));
    }
}
