import { Frame, JSHandle, SerializableOrJSHandle } from "puppeteer-core";
import { AxiosPost } from "../../../../electron/axios";
import { BaseTask, ScriptSetting } from "../../../../types";
import { StoreGet } from "../../../../types/setting";
import https from "https";
import similarity from "string-similarity";

// 题目类型
interface Question {
    // 头部
    head: SerializableOrJSHandle;
    // 题目
    title: string;
    // 选择题
    choice: SerializableOrJSHandle;
    // 判断题
    judgment: SerializableOrJSHandle;
    // 填空题
    completion: SerializableOrJSHandle;
}
/**
 * 自动答题脚本
 * @param task 任务
 * @param frame 窗体
 * @param setting 设置
 */
export async function QAScript(task: BaseTask, frame: Frame, setting: ScriptSetting["script"]["cx"]["qa"]) {
    const TiMus = await frame.$$(".TiMu");
    if (TiMus.length !== 0) {
        task.process(`正在自动答题,一共${TiMus.length}个题目`);
    }
    // 完成的题目数量
    let finishCount = 0;

    for (const TiMu of TiMus) {
        // 获取题目
        const infos: JSHandle<Question> = await TiMu.evaluateHandle((timu) => {
            window.scrollTo({
                top: timu.offsetHeight,
                behavior: "smooth",
            });

            return {
                head: timu.querySelector(".Zy_TItle"),
                title: (timu.querySelector(".Zy_TItle span") as any).innerText,
                choice: timu.querySelector(".Zy_ulTop"),
                judgment: timu.querySelector(".Zy_ulBottom"),
                completion: timu.querySelector(".Zy_ulTk"),
            } as Question;
        }, TiMu);

        // 查题
        const agent = new https.Agent({
            rejectUnauthorized: false,
        });
        const { data: res } = await AxiosPost({
            url: "https://wk.enncy.cn/chati",
            httpsAgent: agent,
            data: {
                chatiId: StoreGet("setting").script.account.queryToken,
                question: (await infos.jsonValue<Question>()).title,
            },
        });
        // 匹配答案
        if (res.success) {
            const { question, answer } = res;
            const que = await infos.jsonValue<Question>();
            if (que.choice) {
                // 获取选项
                const options = await frame.evaluate((timu: HTMLDivElement) => {
                    return Array.from(timu.querySelectorAll("li")).map((li) => li.innerText);
                }, TiMu);
                // 查找答案
                const index = similarity.findBestMatch(answer, options).bestMatchIndex;
                if (index) {
                    finishCount++;
                    (await TiMu.$$("input"))[index]?.click();
                }
                console.log("选择题:" + question + "的答案为:" + options[index]);
            } else if (que.judgment) {
                // 查找答案
                const rightWord = "是|对|正确|√|对的|是的|正确的";
                const wrongWord = "否|错|错误|×|错的|不正确的|不正确|不是|不是的";
                const { target } = similarity.findBestMatch(answer, rightWord.split("|").concat(wrongWord.split("|"))).bestMatch;
                if (RegExp(rightWord).test(target) || RegExp(wrongWord).test(target)) {
                    finishCount++;
                }
                // 开始选择
                if (RegExp(rightWord).test(target)) {
                    await frame.evaluate((timu) => {
                        timu.querySelectorAll("input")[0]?.click();
                    }, TiMu);
                } else if (RegExp(wrongWord).test(target)) {
                    await frame.evaluate((timu) => {
                        timu.querySelectorAll("input")[1]?.click();
                    }, TiMu);
                }
                console.log("判断题:" + question + "的答案为:", target);
            } else if (que.completion) {
                // 找到填空串
                function findCompletion(str: string) {
                    let spl = str.split(/ |\s|=|#|&|;/).filter((s) => !!s);
                    if (spl.length > 4) {
                        return [];
                    } else {
                        return spl;
                    }
                }
                // 自动填空
                const ans = findCompletion(answer);
                const textareas = await frame.evaluateHandle((timu: HTMLDivElement) => timu.querySelectorAll("textarea"), TiMu);

                const finish = await frame.evaluate(
                    (textareas: HTMLTextAreaElement[], answers) => {
                        if (textareas.length === answers.length) {
                            for (let i = 0; i < textareas.length; i++) {
                                textareas[i].value = answers[i] || "";
                            }
                            return true;
                        }
                        return false;
                    },
                    textareas,
                    ans
                );
                if (finish) {
                    finishCount++;
                }
                console.log("填空题:" + question + "的答案为:", ans);
            } else {
                console.log("不支持的题目类型");
            }
        }
    }

    // 如果超过通过率，则自动提交，否则暂时保存
    if (TiMus.length !== 0 && setting.autoReport) {
        if ((TiMus.length / finishCount) * 100 >= setting.passRate) {
            await frame.evaluate(() => {
                return new Promise<void>((resolve, reject) => {
                    let w = window as any;
                    if (w.btnBlueSubmit) w.btnBlueSubmit();
                    setTimeout(() => {
                        if (w.form1submit) w.form1submit();
                        resolve();
                    }, 3000);
                });
            });
        } else {
            await frame.evaluate("if(window.noSubmit)window.noSubmit()");
        }
    }
}
