<template>
	<div class="file-tree">
		<a-collapse
			v-model:activeKey="activeKey"
			:bordered="false"
			class="text-start"
		>
			<template #expandIcon="{ isActive }">
				<Icon
					type="icon-caret-right"
					:rotate="isActive ? 90 : 0"
				/>
			</template>
			<a-collapse-panel
				:key="title"
				:disabled="openSearch"
			>
				<!-- 项目列表头部 -->
				<template #header="{ isActive }">
					<ProjectHeader
						v-model:open-search="openSearch"
						v-model:search-value="searchValue"
						:title="title"
						:root-path="rootPath"
						:expend="isActive"
					/>
				</template>
				<!-- 项目文件列表 -->
				<template v-if="files?.length === 0">
					<div
						style="font-size: 11px"
						class="text-center p-1 text-secondary"
					>
						没有任何文件
					</div>
				</template>
				<template v-else>
					<template v-if="resultList.length !== 0">
						<!-- 搜索结果列表 -->
						<FileTree
							v-model:checked-keys="checkedKeys"
							class="search-result-list"
							:files="resultList"
							:draggable="false"
							:multiple="multiple"
							:checkable="checkable"
							:selectable="checkedKeys.length === 0"
						/>
					</template>
					<template v-else>
						<!--
                - 可以通过 node.children 或者 files 指定文件
                - 如果 rootNode 为空，则此项目为虚拟路径项目，不存在实体父文件夹
            -->
						<FileTree
							v-model:expandedKeys="expandedKeys"
							v-model:checked-keys="checkedKeys"
							:draggable="rootPath !== undefined"
							:files="files"
							:multiple="multiple"
							:checkable="checkable"
							:selectable="checkedKeys.length === 0"
							@expand="onExpand"
							@select="onSelect"
							@update:files="onFilesUpdate"
						/>
					</template>
				</template>
			</a-collapse-panel>
		</a-collapse>
	</div>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { store } from '../../store';
import { FileNode, flatFiles } from '../File/File';
import FileTree from '../file/FileTree.vue';
import Icon from '../Icon.vue';
import ProjectHeader from './ProjectHeader.vue';

interface FileTreeProps {
	/** 项目标题 */
	title: string;
	/**
	 * 指定 files 则此项目为虚拟路径项目，不存在实体父文件夹
	 */
	files: FileNode[];
	/** 根路径 */
	rootPath?: string;
	/** 文件多选 */
	multiple: boolean;
	/** 选择框 */
	checkable: boolean;
}
const props = withDefaults(defineProps<FileTreeProps>(), {
	files: undefined,
	rootPath: undefined,
	multiple: false,
	checkable: false
});
const emits = defineEmits<{
	(e: 'update:files', files: FileNode[]): void;
	(e: 'select', files: FileNode[]): void;
}>();

const { files, title, checkable, multiple } = toRefs(props);

const activeKey = ref([title.value]);

// 打开文件搜索
const openSearch = ref(false);
// 搜索结果
const resultList = ref<FileNode[]>([]);
// 搜索值
const searchValue = ref('');
// 展开的节点
const expandedKeys = ref<string[]>(store.expandedKeys);
// 选中的节点
const checkedKeys = ref<string[]>([]);

watch(checkedKeys, () => {
	emits(
		'select',
		flatFiles(files.value).filter((f) => checkedKeys.value.includes(f.path))
	);
});

// 文件改变监听
function onFilesUpdate(files: FileNode[]) {
	emits('update:files', files);
}

/** 节点伸缩 */
function onExpand(keys: string[], { node }: { expanded: boolean; node: any }) {
	const file: FileNode | undefined = flatFiles(files.value).find((f) => f.path === node.dataRef.path);

	if (file) {
		/**
		 *  当父文件夹收回时，其所有的子文件夹也应该收回
		 */
		expandedKeys.value = expandedKeys.value.filter((key) => key.length <= file.path.length);
		/** 保存 */
		store.expandedKeys = expandedKeys.value;
	}
}

/** 节点选中 */
function onSelect(keys: string[], e: { selected: boolean; selectedNodes: any[]; node: any; event: any }) {
	// 扁平化文件列表
	const _flatFiles = flatFiles(files.value);
	// 当前选中文件
	const currentFile: FileNode | undefined = _flatFiles.find((f) => f.path === e.node.dataRef.path);
	// 选中的文件
	const selectedFiles: FileNode[] = _flatFiles.filter((f) => keys.includes(f.path));

	/** 选中文件夹，则展开 */
	if (currentFile) {
		if (currentFile.stat.isDirectory) {
			if (e.selected) {
				expandedKeys.value = expandedKeys.value.filter((path) => path !== (e.node.dataRef as FileNode).path);
			} else {
				expandedKeys.value.push((e.node.dataRef as FileNode).path);
			}
		}
	}

	emits('select', selectedFiles);
}

/**
 * 文件搜索
 */
watch(searchValue, (value) => {
	resultList.value = [];
	if (value) {
		let _files: FileNode[] = JSON.parse(JSON.stringify(files.value));
		while (_files.length !== 0) {
			const item = _files.shift();

			if (item && item.title?.toLocaleLowerCase().includes(value.toLocaleLowerCase())) {
				/**
				 * 显示搜索的字符串,忽略大小写
				 */

				item.title = item.title.replace(RegExp(`(${value})`, 'ig'), '<em>$1</em>');
				resultList.value.push(item);
			}
			if (item?.children) {
				_files = _files.concat(item.children);
			}
		}
	}
	console.log('搜索结果', resultList.value);
});

/** 如果搜索关闭，则清空搜索框 */
watch(openSearch, () => {
	if (openSearch.value === false) {
		searchValue.value = '';
	}
});
</script>

<style scoped lang="less">
body .file-tree {
	:deep(.ant-tree li) {
		padding: 0;
	}

	:deep(.ant-tree-title) {
		font-size: 11px;
	}
	:deep(.ant-collapse-arrow) {
		left: 8px !important;
	}

	:deep(.ant-tree-icon__customize) {
		line-height: 18px;
	}

	:deep(.ant-tree-node-content-wrapper) {
		padding: 0px;
	}

	:deep(.ant-tree-switcher) {
		width: 12px;
	}
	:deep(.ant-collapse-header) {
		display: flex;
		background-color: #f7f7f7;
		align-items: center;
		padding: 0;
	}
	:deep(.ant-collapse-content-box) {
		padding: 0;
	}
	:deep(.ant-collapse-borderless) {
		background-color: white;
	}
	:deep(.ant-collapse-item) {
		border: none;
	}

	:deep(ul.ant-tree-child-tree) {
		list-style-type: none;
		padding-left: 12px;
	}
}
</style>
