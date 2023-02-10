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
				type="settings"
				@click.stop="change(name)"
			/>
		</Description>
	</div>
</template>

<script setup lang="ts">
import { ref, toRefs, onMounted } from 'vue';
import Description from './Description.vue';
import { remote } from '../utils/remote';
import { store } from '../store';
import Icon from './Icon.vue';
import { electron } from '../utils/node';

interface PathProps {
	name: keyof typeof store.paths;
	label: string;
	setting?: boolean;
}

const props = withDefaults(defineProps<PathProps>(), {
	setting: false
});

const { label, name, setting } = toRefs(props);
const { shell } = electron;

const realPath = ref('');

onMounted(async () => {
	realPath.value = store.paths[name.value] ? await remote.path.call('resolve', store.paths[name.value]) : '无';
});

async function change(name: keyof typeof store.paths) {
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
