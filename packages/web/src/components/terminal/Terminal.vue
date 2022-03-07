<template>
    <div class="terminal-container" ref="terminal"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, toRefs, watch, ref } from "vue";

import { FileNode } from "../file/File";
import { Instance as Chalk } from "chalk";
import "xterm/css/xterm.css";
import { ChildProcess } from "child_process";
import { store } from "../../store";
import { ITerminal } from ".";

const child_process = require("child_process") as typeof import("child_process");
const chalk = new Chalk({ level: 2 });

interface TerminalProps {
    file: FileNode;
    running: boolean;
}
const props = withDefaults(defineProps<TerminalProps>(), {});
const { file, running } = toRefs(props);

const emits = defineEmits<{
    (e: "ready"): void;
}>();

let shell: ChildProcess;
const terminal = ref();

watch(running, () => {
    if (running.value) {
        send("open", file.value.content);
    } else {
        send("close", "");
    }
});

function send(action: string, data: string = "") {
    shell.send(
        JSON.stringify({
            action,
            data,
            uid: file.value.uid,
            logsPath: store["logs-path"],
        })
    );
}

onMounted(async () => {
    const term = new ITerminal();
    /**
     * 使用 child_process 运行 ocs 命令
     */
    shell = child_process.fork("./script.js", { stdio: ["ipc"] });

    shell.stdout?.on("data", (data: any) => term.write(data));
    shell.stderr?.on("data", (data: any) => term.write(chalk.redBright(data)));

    /** 显示 */
    emits("ready");

    if (terminal.value !== null) {
        /** 绑定元素 */
        term.open(terminal.value as HTMLElement);

        term.write(`ocs@${file.value.uid}> `);
    }
});

onUnmounted(() => {
    send("close", "");
});
</script>

<style scope lang="less">
.xterm .xterm-viewport {
    overflow-y: auto;
}
.xterm {
    height: 100%;
}
.terminal-container {
    /* fix : https://github.com/xtermjs/xterm.js/issues/3564#issue-1062239799 */
    overflow: hidden;
}
.xterm .xterm-viewport {
    /* see : https://github.com/xtermjs/xterm.js/issues/3564#issuecomment-1004417440 */
    width: initial !important;

    /* 滚动条滑块 */
    &::-webkit-scrollbar-thumb {
        background: #ffffff7b;
    }
}
</style>
