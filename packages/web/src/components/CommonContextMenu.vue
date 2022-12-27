<template>
	<a-dropdown :trigger="['contextmenu']">
		<slot />
		<template #overlay>
			<a-menu style="width: 150px">
				<a-menu-item
					key="copy"
					@click="copy"
				>
					复制
				</a-menu-item>
				<a-menu-item
					key="paste"
					@click="paste"
				>
					粘贴
				</a-menu-item>
			</a-menu>
		</template>
	</a-dropdown>
</template>
<script setup lang="ts">
import { ref } from 'vue';

const { clipboard } = require('electron');

const selection = ref<HTMLElement>();

document.onselectstart = (e) => {
	selection.value = document.getSelection()?.focusNode as HTMLElement;
};

function copy() {
	if (selection.value?.textContent) {
		clipboard.writeText(selection.value.textContent);
	}
}

function paste() {
	if (selection?.value) {
		const el = selection.value.querySelector('input,textarea');
		if (el) {
			// @ts-ignore
			el.value = clipboard.readText();
		}
	}
}
</script>
<style scoped lang="less"></style>
