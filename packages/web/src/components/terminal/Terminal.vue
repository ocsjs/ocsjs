<template>
	<div
		ref="terminal"
		class="terminal-container"
	/>
</template>

<script setup lang="ts">
import { onMounted, toRefs, ref } from 'vue';
import 'xterm/css/xterm.css';
import { ITerminal } from '.';
import { Process } from './process';
import { FileData } from '../file/data';

interface TerminalProps {
	file: FileData;
	xterm: ITerminal;
	process: Process;
}
const props = withDefaults(defineProps<TerminalProps>(), {});

const { file, xterm } = toRefs(props);

const terminal = ref();

onMounted(async () => {
	/**
	 * 使用 child_process 运行 ocs 命令
	 */

	if (terminal.value !== null) {
		/** 绑定元素 */
		xterm.value.open(terminal.value as HTMLElement);
		xterm.value.clear();
		xterm.value.write(`ocs@${file.value.file.name}> `);
	}
});
</script>

<style scoped lang="less">
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
