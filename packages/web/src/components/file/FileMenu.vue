<template>
  <Menus
    :data="menus"
    @error="onError"
  />
</template>

<script setup lang="ts">
import { ref, toRefs, Ref } from 'vue';
import { MenuItem } from '../menus';

import { FileNode } from './File';
import Menus from '../menus/Menus.vue';
import { notify } from '../../utils/notify';
import { createFileMenus } from './FileMenu';
import { remote } from '../../utils/remote';

interface FileMenuProps {
  file: FileNode
}
const props = defineProps<FileMenuProps>();

const { file } = toRefs(props);

/** 创建右键菜单 */
const { baseMenus, dirMenus } = createFileMenus(file);

const menus: Ref<MenuItem[]> = ref(baseMenus);

if (file.value.stat?.isDirectory) {
  const mes = menus.value;
  mes[0].divide = true;
  menus.value = dirMenus.concat(...mes);
}

function onError (e: Error) {
  notify('操作时发生错误', e, 'file-menu', { type: 'error', copy: true });
  remote.logger.call('error', '操作时发生错误 : ' + (e as Error).message + '\n' + (e as Error).stack);
}
</script>

<style scope lang="less"></style>
