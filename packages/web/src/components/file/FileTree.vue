<template>
	<!-- eslint-disable vue/no-v-html -->
	<ATree
		class="tree"
		:tree-data="files"
		show-icon
		:draggable="draggable && fileRenaming"
		:auto-expand-parent="false"
		:replace-fields="{ children: 'children', title: 'title', key: 'path' }"
		:multiple="multiple"
		@drop="onDrop"
		@select="onSelect"
	>
		<template #switcherIcon>
			<Icon type="icon-down" />
		</template>
		<template #file>
			<Icon type="icon-file-text" />
		</template>
		<template #dir>
			<Icon type="icon-wenjianjia" />
		</template>
		<template #title="file">
			<template v-if="file.stat">
				<a-dropdown :trigger="['contextmenu']">
					<!-- 重命名文件 -->
					<template v-if="file.stat.renaming">
						<span>
							<a-input
								v-focus
								size="small"
								class="rename-input"
								:default-value="file.title"
								@blur="rename($event, file)"
								@click="$event.stopPropagation(), $event.preventDefault()"
							/>
						</span>
					</template>
					<!--
                        显示标题
                        使用 v-html 是因为需要搭配 <em> 标签，在搜索文件的时候，提供字体高亮
                     -->
					<template v-else>
						<div
							class="d-inline-flex align-items-center"
							style="gap: 8px"
						>
							<span
								class="file-title"
								:title="file.path"
								v-html="StringUtils.max(file.title, 40)"
							/>

							<Icon
								v-if="file.stat.running"
								type="icon-play-circle"
							/>
						</div>
					</template>

					<template #overlay>
						<FileMenu
							:file="file"
							@update:file="onUpdate"
						/>
					</template>
				</a-dropdown>
			</template>
			<template v-else>
				<span
					class="file-title"
					:title="file.path"
					v-html="StringUtils.max(file.title, 40)"
				/>
			</template>
		</template>
	</ATree>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import ATree from 'ant-design-vue/lib/tree';
import { TreeDataItem } from 'ant-design-vue/lib/tree/Tree';
import { computed, toRefs } from 'vue';

import { NodeJS } from '../../utils/export';
import { notify } from '../../utils/notify';
import { remote } from '../../utils/remote';

import Icon from '../Icon.vue';
import { FileNode, loopFiles } from './File';
import FileMenu from './FileMenu.vue';

interface FileTreeProps {
	files: FileNode[];
	draggable: boolean;
	multiple: boolean;
}
const { StringUtils } = require('@ocsjs/common');
const props = withDefaults(defineProps<FileTreeProps>(), {
	multiple: false
});
const emits = defineEmits<{
	(e: 'select', ...args: any): void;
	(e: 'update:files', files: FileNode[]): void;
}>();
const { files, draggable, multiple } = toRefs(props);
// 是否有文件正在重命名
const fileRenaming = computed(() => files.value.every((f) => f.stat.renaming === false));

function onSelect(...args: any) {
	emits('select', ...args);
}

function onUpdate(fileNode: FileNode) {
	const newFiles = loopFiles(files.value, (children) => {
		const index = children.findIndex((f) => f.path === fileNode.path);
		if (index !== -1) {
			children[index] = fileNode;
		}
		return children;
	});
	emits('update:files', newFiles);
}

/**
 * 拖动文件
 */
function onDrop(info: any) {
	try {
		const destFile: FileNode = info.node.dataRef;
		const dragFile: FileNode = info.dragNode.dataRef;

		// 如果移到元素上，并且该元素不是文件夹，则不做反应
		if (info.dropToGap === false && !destFile.stat?.isDirectory) {
			return;
		}

		/** 放置后的文件夹路径 */
		const destPath = NodeJS.path.join(info.dropToGap === false ? destFile.path : destFile.parent, dragFile.title);
		/** 路径相同，则不做处理 */
		if (dragFile.path === destPath) {
			return;
		}
		if (NodeJS.fs.existsSync(destPath)) {
			message.error('路径下存在相同名字的文件(夹)！');
			return;
		}

		/** 移动文件(夹) */
		NodeJS.fs.renameSync(dragFile.path, destPath);

		/** 改变文件目录 */
		dragFile.parent = destPath;
		dragFile.path = destPath;

		// code original : https://2x.antdv.com/components/tree-cn#components-tree-demo-draggable
		const dropKey = info.node.eventKey;
		const dragKey = info.dragNode.eventKey;
		const dropPos = info.node.pos.split('-');
		const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

		const loop = (data: TreeDataItem[], key: string, callback: any) => {
			data.forEach((item, index, arr) => {
				if (item.key === key) {
					return callback(item, index, arr);
				}
				if (item.children) {
					return loop(item.children, key, callback);
				}
			});
		};
		const data = [...(files.value || [])].map((i) => ({ key: i.path, ...i }));

		// Find dragObject
		let dragObj: TreeDataItem = {} as any;
		loop(data, dragKey, (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
			arr.splice(index, 1);
			dragObj = item;
		});
		if (!info.dropToGap) {
			// Drop on the content
			loop(data, dropKey, (item: TreeDataItem) => {
				item.children = item.children || [];
				// where to insert 示例添加到尾部，可以是随意位置
				item.children.push(dragObj);
			});
		} else if (
			(info.node.children || []).length > 0 && // Has children
			info.node.expanded && // Is expanded
			dropPosition === 1 // On the bottom gap
		) {
			loop(data, dropKey, (item: TreeDataItem) => {
				item.children = item.children || [];
				// where to insert 示例添加到尾部，可以是随意位置
				item.children.unshift(dragObj);
			});
		} else {
			let ar: TreeDataItem[] = [];
			let i = 0;
			loop(data, dropKey, (item: TreeDataItem, index: number, arr: TreeDataItem[]) => {
				ar = arr;
				i = index;
			});
			if (dropPosition === -1) {
				ar.splice(i, 0, dragObj);
			} else {
				ar.splice(i + 1, 0, dragObj);
			}
		}

		files.value = data;
	} catch (e) {
		notify('移动文件时出错', e, 'file-move', { copy: true, type: 'error' });
		remote.logger.call('error', '移动文件时出错 : ' + (e as Error).message + '\n' + (e as Error).stack);
	}
}

/**
 * 重命名文件
 */
function rename(e: Event, file: FileNode) {
	const name = (e.target as HTMLInputElement).value;
	const dest = NodeJS.path.join(file.parent, name);

	if (file.path !== dest) {
		if (!NodeJS.fs.existsSync(dest)) {
			if (file.stat.isDirectory) {
				renameDir(file.path, dest);
				NodeJS.fs.rmSync(file.path, { recursive: true });
			} else {
				NodeJS.fs.renameSync(file.path, dest);
				// 更新已打开的文件名
				// const openedFile = workspace.opened.find((f) => f.uid === file.uid);

				// if (openedFile) {
				// 	openedFile.path = dest;
				// 	openedFile.title = name;
				// }
			}
		} else {
			message.error('路径下存在相同名字的文件(夹)！');
		}
	}
	file.stat.renaming = false;
}

/**
 * 递归重命名文件夹
 */
function renameDir(dir: string, dest: string) {
	console.log({ dir, dest });

	NodeJS.fsExtra.ensureDirSync(dest);

	NodeJS.fsExtra.readdirSync(dir).forEach((file) => {
		const filePath = NodeJS.path.resolve(dir, file);
		const destPath = NodeJS.path.resolve(dest, file);
		const fileStat = NodeJS.fs.statSync(filePath);

		if (fileStat.isDirectory()) {
			NodeJS.fs.mkdirSync(destPath);
			renameDir(filePath, destPath);
		} else {
			NodeJS.fsExtra.moveSync(filePath, destPath);
		}
	});
}
</script>

<style scoped lang="less">
#app .file-tree {
	.file-title {
		font-size: 12px;
	}

	ul {
		text-align: left;
		padding: 0px 0px 12px 0px;
	}

	.ant-tree-title,
	.rename-input {
		font-size: 11px;
	}
}
</style>
