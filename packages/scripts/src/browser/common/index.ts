import { createNote } from "../core/create.element";
import { defineScript } from "../core/define.script";
import { setItem } from "../core/store";
import { urlGlob } from "../core/utils";

const supports = [
    ["**chaoxing.com**", "cx"],
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
