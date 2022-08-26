<template>
	<div>
		<Description
			:label="label"
			:desc="realPath"
			:text-class="'pointer'"
			@click="shell.showItemInFolder(realPath)"
		>
			<Icon
				v-if="setting"
				class="ms-3"
				type="icon-setting"
				@click.stop="change(name)"
			/>
		</Description>
	</div>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import Description from './Description.vue';
import { remote } from '../utils/remote';
import { store } from '../store';
const path = require('path');

interface PathProps {
	name: string;
	label: string;
	setting?: boolean;
}

const props = withDefaults(defineProps<PathProps>(), {
	setting: false
});

const { label, name, setting } = toRefs(props);
const { shell } = require('electron');

const realPath = ref(store[name.value] ? path.resolve(store[name.value]) : '无');

async function change(name: string) {
	if (setting.value) {
		const res = await remote.dialog.call('showOpenDialogSync', {
			properties: ['openDirectory'],
			defaultPath: realPath.value
		});
		if (res) {
			realPath.value = res[0];
			store[name] = res[0];
		}
	}
}
</script>

<style scoped lang="less"></style>
