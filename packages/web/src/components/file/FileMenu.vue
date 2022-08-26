<template>
	<Menus
		:data="menus"
		:target="file"
		@error="onError"
	/>
</template>

<script setup lang="ts">
import { ref, Ref, toRefs } from 'vue';
import { notify } from '../../utils/notify';
import { remote } from '../../utils/remote';
import { MenuItem } from '../menus';
import Menus from '../menus/Menus.vue';
import { FileNode } from './File';
import { createFileMenus } from './FileMenu';

interface FileMenuProps {
	file: FileNode;
}
const props = defineProps<FileMenuProps>();
const emits = defineEmits<{
	(e: 'update:file', file: FileNode): void;
}>();

const { file } = toRefs(props);

/** 创建右键菜单 */
const { baseMenus, dirMenus } = createFileMenus(file.value, (fileNode) => {
	emits('update:file', fileNode);
});

const menus: Ref<MenuItem[]> = ref(baseMenus);

if (file.value.stat?.isDirectory) {
	const mes = menus.value;
	mes[0].divide = true;
	menus.value = dirMenus.concat(...mes);
}

function onError(e: Error) {
	notify('操作时发生错误', e, 'file-menu', { type: 'error', copy: true });
	remote.logger.call('error', '操作时发生错误 : ' + (e as Error).message + '\n' + (e as Error).stack);
}
</script>

<style scoped lang="less"></style>
