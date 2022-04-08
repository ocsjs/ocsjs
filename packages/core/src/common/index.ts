import { createNote } from "../core/create.element";
import { defineScript } from "../core/define.script";
import { setItem } from "../core/store";
import { urlGlob } from "../core/utils";
import { logger } from "../logger";

const supports = [
    ["**chaoxing.com**", "cx"],
    ["**edu.cn**", "cx"],
    ["**zhihuishu.com**", "zhs"],
];

export const CommonScript = defineScript({
    name: "默认脚本",
    routes: [
        {
            name: "网课类型标记",
            url: supports.map((arr) => arr[0]),
            start() {
                for (const arr of supports) {
                    if (urlGlob(arr[0])) {
                        setItem("platform", arr[1]);
                    }
                }
            },
        },
        {
            name: "禁止弹窗脚本",
            url: supports.map((arr) => arr[0]),
            start() {
                try {
                    console.log("禁止弹窗脚本启动");
                    // @ts-ignore
                    window.alert = unsafeWindow.alert = self.alert = console.log;
                } catch (e) {
                    // @ts-ignore
                    console.error("禁止弹窗脚本错误", e.message);
                }
            },
        },
        {
            name: "开启页面右键复制粘贴功能",
            url: supports.map((arr) => arr[0]),
            onload() {
                setTimeout(() => {
                    console.log("开启页面右键复制粘贴功能");
                    const d = document;
                    const b = document.body;
                    d.onselectstart = d.oncopy = d.onpaste = d.onkeydown = d.oncontextmenu = () => true;
                    b.oncopy = b.onpaste = b.onkeydown = b.oncontextmenu = () => true;
                }, 3000);
            },
        },
        {
            name: "OCS居中脚本",
            url: supports.map((arr) => arr[0]),
            onload() {
                const target = ["o", "c", "s"];
                let stack: string[] = [];
                window.onkeydown = (e) => {
                    if (target.includes(e.key)) {
                        stack.push(e.key);
                        const contains = stack.join("").includes(target.join(""));
                        if (contains) {
                            // @ts-ignore
                            const panel: HTMLElement = OCS?.panel || top?.OCS.panel || unsafeWindow?.OCS.panel;
                            console.log("panel", panel);
                            if (panel) {
                                if (panel.classList.contains("hide")) {
                                    panel.style.top = "unset";
                                    panel.style.bottom = "10%";
                                    panel.style.left = "5%";
                                } else {
                                    panel.style.top = "20%";
                                    panel.style.bottom = "unset";
                                    panel.style.left = "50%";
                                }
                            }
                            stack = [];
                        }
                    } else {
                        stack = [];
                    }
                };
            },
        },
    ],
    panels: [
        {
            name: "OCS助手",
            priority: 100,
            default: true,
            url: supports.map((arr) => arr[0]),
            el: () =>
                createNote(
                    "提示： 手动点击进入视频，作业，考试页面，即可自动运行",
                    "注意！ 请将浏览器页面保持最大化，或者缩小，但是不能最小化，可能导致视频播放错误！",
                    "拖动上方标题栏可以进行拖拽"
                ),
        },
    ],
});
