<template>
	<a-modal
		title="批量运行"
		ok-text="运行"
		:ok-button-props="{
			disabled: checkedFiles.length === 0
		}"
		cancel-text="取消"
		:body-style="{
			padding: '12px'
		}"
		style="top: 50px"
		@ok="handleOk"
	>
		<p class="text-secondary">批量运行前先检查文件的启动设置是否填写完整。</p>
		启动间隔(秒): <span class="text-secondary">(避免一次性启动过多导致卡死)</span>
		<a-input
			v-model:value="period"
			type="number"
			min="1"
			max="999"
			size="small"
		></a-input>
		文件选择:
		<div style="max-height: calc(50vh); overflow: auto">
			<FilesTree
				:files="files"
				:multiple="false"
				:draggable="false"
				:checkable="true"
				:selectable="false"
				:show-menu="false"
				@check="(files) => (checkedFiles = files)"
			></FilesTree>
		</div>
	</a-modal>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { File } from '../core/File';
import { startup } from './file/File';
import { createFileData } from '../components/file/data';
import FilesTree from './file/FilesTree.vue';

const props = defineProps<{
	files: File[];
}>();

const { files } = toRefs(props);
const checkedFiles = ref<File[]>([]);
const period = ref(3);

function handleOk() {
	startup(
		checkedFiles.value.map((file) => createFileData(file)),
		period.value * 1000
	);
}
</script>

<style scoped lang="less"></style>
