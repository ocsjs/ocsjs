import { createNote } from "../common/create.element";
import { defineScript } from "../common/define.script";
import { createCXSettingPanel } from "./panels";
import { study } from "./study";

/** 需切换版本的 url 页面 */
const updateURLs = [
    "**chaoxing.com**mooc2=0**",
    "**chaoxing.com/mycourse/studentcourse**",
    "**chaoxing.com/work/getAllWork**",
    "**chaoxing.com/work/getAllWork**",
];

export const CXScript = defineScript({
    name: "超星学习通",
    routes: [
        {
            name: "版本切换脚本",
            url: updateURLs,
            script() {
                // 跳转到最新版本的超星
                setTimeout(() => {
                    const experience = document.querySelector(".experience") as HTMLElement;
                    if (experience) {
                        experience.click();
                    } else {
                        const params = new URLSearchParams(window.location.href);
                        params.set("mooc2", "1");
                        window.location.replace(decodeURIComponent(params.toString()));
                    }
                }, 3000);
            },
        },
        {
            name: "视频脚本",
            settingPath: "setting.cx.video",
            url: "**chaoxing.com/mycourse/studentstudy**",
            async script(setting) {
                await study(setting);
            },
        },
    ],
    panels: [
        {
            url: updateURLs,
            name: "版本切换助手",
            el: () => createNote(`必须切换到最新版本才能使用此脚本`, "3秒后将自动切换..."),
        },
        {
            url: "**chaoxing.com/space/index**",
            name: "超星助手",
            el: () => createNote("提示您:", "请点击任意的课程进入。"),
        },
        {
            url: "**chaoxing.com/mycourse/**pageHeader=1**",
            name: "学习助手",
            el: () => createNote("提示您:", "请点击任意的章节进入学习。"),
        },
        {
            url: "**chaoxing.com/mycourse/**pageHeader=8**",
            name: "作业助手",
            el: () => createNote("提示您:", "请点击任意的作业进入。"),
        },
        {
            url: "**chaoxing.com/mycourse/**pageHeader=9**",
            name: "考试助手",
            el: () => createNote("提示您:", "请点击任意的考试进入。"),
        },
        {
            url: "**chaoxing.com/mycourse/studentstudy**",
            name: "学习助手",
            el: () => createNote("进入设置面板可以调整设置", "任务即将自动开始..."),
            children: [
                {
                    name: "设置面板",
                    el: () => createCXSettingPanel(),
                },
            ],
        },
    ],
});
