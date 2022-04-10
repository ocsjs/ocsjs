import { watch } from "vue";
import { defineComponent, onMounted, nextTick } from "vue";
import { domSearch } from "../core/utils";
import { store } from "../script";

export const Terminal = defineComponent({
    setup() {
        onMounted(() => {
            // 控制台元素
            const { terminal } = domSearch({ terminal: ".terminal" });
            // 监听改变，并且滚动到最下方
            watch(
                () => store.localStorage.logs,
                () => nextTick(() => scroll())
            );
            // 滚动到最下方
            nextTick(() => scroll());

            function scroll() {
                if (terminal?.scrollHeight) {
                    terminal?.scrollTo({
                        behavior: "auto",
                        top: terminal.scrollHeight,
                    });
                }
            }
        });
    },
    render() {
        return (
            <div class="terminal">
                {store.localStorage.logs.map((log: any) => (
                    <div>
                        <span style={{ color: "gray" }}>{new Date(log.time).toLocaleTimeString("zh-CN")}</span>
                        <span> </span>
                        <level class={log.level}>{log.extra}</level>
                        <span> </span>
                        <span innerHTML={log.text}></span>
                    </div>
                ))}
            </div>
        );
    },
});
