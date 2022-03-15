import { createNote } from "../common/create.element";
import { defineScript } from "../common/define.script";
import { defaultSetting } from "../scripts";
import { createZHSSettingPanel } from "./panels";

import { study } from "./study";

export const ZHSScript = defineScript({
    name: "知道智慧树",
    routes: [
        {
            name: "视频脚本",
            settingPath: "setting.zhs.video",
            url: "**zhihuishu.com/videoStudy.html**",
            async script(setting) {
                // 智慧树视频学习
                await study(setting || defaultSetting().video);
            },
        },
    ],
    panels: [
        {
            url: "https://www.zhihuishu.com/",
            name: "智慧树助手",
            el: () => createNote("提示您:", "点击登录后, 进入个人页面才能使用其他的功能哦。"),
        },
        {
            url: "https://onlineweb.zhihuishu.com/onlinestuh5",
            name: "智慧树助手",
            el: () => createNote("提示您:", "请点击任意的课程进入。"),
        },
        {
            url: "**zhihuishu.com/videoStudy.html**",
            name: "视频助手",
            el: () => createNote("进入设置面板可以调整你的视频设置", "视频即将自动播放..."),
            children: [
                {
                    name: "设置面板",
                    el: () => createZHSSettingPanel(),
                },
            ],
        },
    ],
});
