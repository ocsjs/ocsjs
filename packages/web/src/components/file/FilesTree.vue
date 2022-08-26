<template>
	<a-directory-tree
		class="tree"
		:tree-data="files"
		:draggable="draggable && renaming === ''"
		:auto-expand-parent="false"
		:replace-fields="{ children: 'children', title: 'name', key: 'path' }"
		:multiple="multiple"
		@drop="onDrop"
		@check="onCheck"
		@select="onSelect"
	>
		<template #dir="{ expanded }">
			<Icon :type="expanded ? 'icon-folder-open-fill' : 'icon-folder-fill'" />
		</template>
		<template #file>
			<Icon type="icon-file" />
		</template>
		<template #running>
			<Icon type="icon-play-circle" />
		</template>

		<template #title="{ dataRef: item }">
			<a-dropdown :trigger="['contextmenu']">
				<span>
					<a-input
						v-if="renaming === item.path"
						v-focus
						size="small"
						class="rename-input"
						:default-value="item.basename"
						@blur="rename($event, item)"
						@dragstart="$event.stopPropagation()"
						@drag="$event.stopPropagation(), $event.preventDefault()"
						@click="$event.stopPropagation(), $event.preventDefault()"
					/>
					<span
						v-else
						class="file-basename"
						:title="item.basename"
					>
						{{ item.basename }}
					</span>
					<span class="file-extname">
						{{ item.extname }}
					</span>
				</span>

				<template #overlay>
					<Menus
						v-if="showMenu"
						:data="createMenus(item)"
						:target="item"
					></Menus>
				</template>
			</a-dropdown>
		</template>
	</a-directory-tree>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { config } from '../../config';
import { MenuItem } from '../../components/menus';
import Menus from '../../components/menus/Menus.vue';
import { File } from '../../core/File';
import { message } from 'ant-design-vue';

const { shell, clipboard } = require('electron');

interface FileTreeProps {
	files: File[];
	draggable: boolean;
	multiple: boolean;
	showMenu: boolean;
}

const props = withDefaults(defineProps<FileTreeProps>(), {
	multiple: false,
	showMenu: true
});
const emits = defineEmits<{
	(e: 'select', files: File[]): void;
	(e: 'check', files: File[]): void;
	(e: 'open', file: File): void;
}>();
const { files, draggable, multiple } = toRefs(props);

// 当前重命名的文件
const renaming = ref('');

function createMenus(file: File) {
	const dirMenus: MenuItem[] = [
		{
			title: '新建文件夹',
			icon: 'icon-wenjianjia',
			onClick(file: File) {
				file.mkdir('新建文件夹');
			}
		},
		{
			title: '新建OCS文件',
			icon: 'icon-file-text',
			onClick(file: File) {
				file.create('新建OCS文件', '.ocs', config.ocsFileTemplate());
			}
		}
	];

	const baseMenus: MenuItem[] = [
		{
			title: '打开文件位置',
			icon: 'icon-location',
			onClick(file: File) {
				console.log('file', file);
				shell.showItemInFolder(file.path);
			}
		},
		{
			title: '复制文件路径',
			icon: 'icon-file-copy',
			onClick(file: File) {
				clipboard.writeText(file.path);
			}
		},
		{
			title: '删除',
			icon: 'icon-delete',
			onClick(file: File) {
				file.remove();
			}
		},
		{
			title: '重命名',
			icon: 'icon-redo',
			onClick(file: File) {
				renaming.value = file.path;
			}
		},
		{
			title: '属性',
			icon: 'icon-unorderedlist',
			onClick(file: File) {}
		}
	];

	let menus = baseMenus;

	if (file.stats.isDirectory()) {
		const mes = menus;
		mes[0].divide = true;
		menus = dirMenus.concat(...mes);
	}

	return menus;
}

function onSelect(keys: string[], data: any) {
	const event: PointerEvent = data.nativeEvent;
	// 区分多选和点击事件
	if (event.ctrlKey) {
		emits(
			'select',
			data.checkedNodes.map((node: any) => node.props.dataRef)
		);
	} else {
		emits('open', data.node.dataRef);
	}
}

function onCheck(keys: string[], data: any) {
	emits(
		'check',
		data.checkedNodes.map((node: any) => node.props.dataRef)
	);
}

function rename(e: any, file: File) {
	const name = (e.target as HTMLInputElement).value;
	file.rename(name, file.extname);
	renaming.value = '';
}

/**
 * 拖动文件
 */
function onDrop(info: any) {
	const destFile: File = info.node.dataRef;
	const dragFile: File = info.dragNode.dataRef;
	// 如果移到元素上，并且该元素不是文件夹，则不做反应
	if (info.dropToGap === false && destFile.stats.isFile()) {
		return;
	}
	// 路径相同，则不做处理
	if (dragFile.dirname === destFile.path) {
		return;
	}
	// 移动
	try {
		dragFile.move(destFile);
	} catch (err: any) {
		message.error(err.message);
	}
}
</script>

<style scoped lang="less">
.rename-input {
	width: min-content;
	-webkit-user-select: none !important;
	-moz-user-select: none !important;
	-ms-user-select: none !important;
	user-select: none !important;
	-khtml-user-drag: none !important;
	-webkit-user-drag: none !important;
}
</style>
