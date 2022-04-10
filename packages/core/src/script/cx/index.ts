import { logger } from "../../logger";
import { createNote, createSearchResultPanel, createTerminalPanel } from "../../components";
import { defineScript } from "../../core/define.script";
import { sleep } from "../../core/utils";
import { StudySettingPanel } from "../../components/cx/StudySettingPanel";
import { study } from "./study";
import { rateHack } from "./utils";
import { workOrExam } from "./work";
import { store } from "..";
import { WorkSettingPanel } from "../../components/cx/WorkSettingPanel";
import { ExamSettingPanel } from "../../components/cx/ExamSettingPanel";

/** 需切换版本的 url 页面 */
const updateURLs = [
    `**mooc2=0**`,
    `**/mycourse/studentcourse**`,
    `**/work/getAllWork**`,
    `**/work/doHomeWorkNew**`,
    `**/exam/test?courseId**`,
];

export const CXScript = defineScript({
    name: "超星学习通",
    routes: [
        {
            name: "版本切换脚本",
            url: updateURLs,
            async onload() {
                if (top === window) {
                    alert("即将自动切换到新版超星。。。");
                    // 跳转到最新版本的超星
                    await sleep(2000);
                    const experience = document.querySelector(".experience") as HTMLElement;
                    if (experience) {
                        experience.click();
                    } else {
                        const params = new URLSearchParams(window.location.href);
                        params.set("mooc2", "1");
                        window.location.replace(decodeURIComponent(params.toString()));
                    }
                }
            },
        },
        {
            name: "屏蔽倍速限制",
            url: "**/ananas/modules/video/**",
            start() {
                console.log("屏蔽倍速限制启动");
                rateHack();
            },
        },
        {
            name: "任务切换脚本",
            url: "**/mycourse/studentstudy**",
            onload() {
                const { restudy } = store.setting.cx.video;

                const params = new URLSearchParams(window.location.href);
                const mooc = params.get("mooc2");
                /** 切换新版 */
                if (mooc === null) {
                    params.set("mooc2", "1");
                    window.location.replace(decodeURIComponent(params.toString()));
                    return;
                }

                let chapters = Array.from(document.querySelectorAll('[onclick^="getTeacherAjax"]')).map((el) => {
                    return {
                        chapterId: el.getAttribute("onclick")?.match(/\('(.*)','(.*)','(.*)'\)/)?.[3],
                        // @ts-ignore
                        unFinishCount: parseInt(el.parentElement.querySelector(".jobUnfinishCount")?.value || "0"),
                    };
                });

                console.log("chapters", chapters);

                // 如果不是复习模式，则寻找需要运行的任务
                if (!restudy) {
                    chapters = chapters.filter((chapter) => chapter.unFinishCount !== 0);
                }

                if (chapters.length === 0) {
                    logger("warn", "页面任务点数量为空! 请刷新重试!");
                } else {
                    const params = new URLSearchParams(window.location.href);
                    const courseId = params.get("courseId");
                    const classId = params.get("clazzid");

                    setTimeout(() => {
                        // @ts-ignore 进入需要进行的章节
                        getTeacherAjax(courseId, classId, chapters[0].chapterId);
                    }, 1000);
                }
            },
        },
        {
            name: "学习脚本",
            url: "**/knowledge/cards**",
            async onload(setting = store.setting.cx.video) {
                await sleep(5000);
                await study(setting);
            },
        },
        {
            /** iframe 跨域问题， 必须在 iframe 中执行 ， 所以脱离学习脚本运行。 */
            name: "阅读脚本",
            url: "**/readsvr/book/mooc**",
            onload() {
                setTimeout(() => {
                    // @ts-ignore
                    console.log("阅读脚本启动");
                    // @ts-ignore
                    readweb.goto(epage);
                }, 5000);
            },
        },
        {
            name: "作业脚本",
            url: "**/mooc2/work/dowork**",
            async onload(setting = store.setting.cx.work) {
                await sleep(5000);
                await workOrExam(setting, false);
            },
        },
        {
            name: "整卷预览脚本",
            url: "**/exam/test/reVersionTestStartNew**",
            async onload() {
                alert("即将自动切换到整卷预览。。。");
                await sleep(3000);
                // @ts-ignore
                topreview();
            },
        },
        {
            name: "考试脚本",
            url: "**/mooc2/exam/preview**",
            async onload(setting = store.setting.cx.exam) {
                await sleep(5000);
                await workOrExam(setting, true);
            },
        },
    ],
    panels: [
        {
            name: "版本切换助手",
            url: updateURLs,
            el: () => createNote(`必须切换到最新版本才能使用此脚本`, "3秒后将自动切换..."),
        },
        {
            name: "超星助手",
            url: "**/space/index**",

            el: () => createNote("提示您:", "请点击任意的课程进入。"),
        },
        {
            name: "学习助手",
            url: "**/mycourse/**pageHeader=1**",
            el: () => createNote("提示您:", "请点击任意的章节进入学习。"),
        },
        {
            name: "作业助手",
            url: "**/mycourse/**pageHeader=8**",
            el: () => createNote("提示您:", "请点击任意的作业进入。"),
        },
        {
            name: "考试助手",
            url: "**/mycourse/**pageHeader=9**",
            el: () => createNote("提示您:", "请点击任意的考试进入。"),
        },
        {
            name: "学习助手",
            url: "**/mycourse/studentstudy**",

            el: () =>
                createNote("进入设置面板可以调整学习设置", "章节栏你随便点, 脚本卡了算我输。", "5秒后将自动开始..."),
            children: [
                {
                    name: "学习设置",
                    el: () => StudySettingPanel,
                },
                createTerminalPanel(),
                createSearchResultPanel(),
            ],
        },
        {
            name: "作业助手",
            url: "**/mooc2/work/dowork**",
            el: () => createNote("进入设置面板可以调整作业设置", "5秒后将自动开始..."),
            children: [
                {
                    name: "作业设置",
                    el: () => WorkSettingPanel,
                },
                createTerminalPanel(),
                createSearchResultPanel(),
            ],
        },
        {
            name: "考试助手",
            url: "**/mooc2/exam/preview**",
            el: () => createNote("进入设置面板可以调整考试设置", "5秒后将自动开始..."),
            children: [
                {
                    name: "考试设置",
                    el: () => ExamSettingPanel,
                },
                createTerminalPanel(),
                createSearchResultPanel(),
            ],
        },
        {
            name: "考试助手",
            url: "**/exam/test/reVersionTestStartNew**",
            el: () => createNote("注意！ 即将切换到整卷预览页面， 然后才可以自动考试！"),
        },
    ],
});
