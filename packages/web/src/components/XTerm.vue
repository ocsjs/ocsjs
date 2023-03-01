<template>
	<div
		ref="xtermRef"
		class="xterm-container"
	/>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import 'xterm/css/xterm.css';

import { XTerm } from '../utils/xterm';
import { Process } from '../utils/process';

const props = defineProps<{
	uid: string;
}>();

const xterm = new XTerm();
const xtermRef = ref();

onMounted(() => {
	openXTerm();
});

function openXTerm() {
	const process = Process.from(props.uid);

	/** 绑定元素 */
	xterm.open(xtermRef.value as HTMLElement);
	xterm.clear();

	/** 显示日志输出 */
	for (const log of process?.logs || []) {
		xterm.write(log);
	}

	if (process?.shell) {
		process.shell.stdout?.on('data', (data) => xterm.write(data));
		process.shell.stderr?.on('data', (data) => xterm.write(`[错误] : ${data}`));
	}

	xterm.fit();
}
</script>

<style scoped lang="less">
.xterm-container {
	/* fix : https://github.com/xtermjs/xterm.js/issues/3564#issue-1062239799 */
	overflow: hidden;
	width: 420px;
	height: 200px;
	border-radius: 4px;
	padding: 12px;
	background-color: #32302f;
}
</style>
