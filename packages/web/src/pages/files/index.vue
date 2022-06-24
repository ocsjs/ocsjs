<template>
	<div
		id="workspace"
		class="h-100 d-flex"
	>
		<div class="files resizable overflow-auto col-4 p-1">
			<!-- 搜索文件夹-->
			<a-input-search
				v-model:value="searchValue"
				size="small"
				placeholder="输入文件名搜索"
			/>
			<template v-if="files.length">
				<FilesTree
					v-model:expandedKeys="store.expandedKeys"
					v-model:selectedKeys="store.selectedKeys"
					:files="searchValue === '' ? files : searchedFiles"
					:multiple="true"
					:draggable="true"
					:show-menu="true"
					@open="onOpen"
				></FilesTree
			></template>
			<template v-else>
				<a-skeleton active />
			</template>
		</div>
		<div class="w-100 h-100 overflow-auto border-start">
			<template v-if="openedFiles.size === 0">
				<!-- 显示帮助页面 -->
				<Help class="help" />
			</template>
			<template v-else>
				<template
					v-for="(items, index) of openedFiles"
					:key="index"
				>
					<div
						v-show="items[0] === store.currentKey"
						class="h-100"
					>
						<FilePanel
							:file="items[1]"
							@close="onClose"
						/>
					</div>
				</template>
			</template>
		</div>
	</div>
</template>

<script
	setup
	lang="ts"
>
import interact from 'interactjs';
import { nextTick, onMounted, ref, watch } from 'vue';
import Help from '../../components/Help.vue';
import { openedFiles, store, files } from '../../store/index';
import FilesTree from '../../components/file/FilesTree.vue';
import { File } from '../../core/File';
import FilePanel from '../../components/file/FilePanel.vue';
import { closeFile, showFile } from '../../components/file/File';
import cloneDeep from 'lodash/cloneDeep';

const searchValue = ref('');
const searchedFiles = ref<File[]>([]);

watch(searchValue, () => {
	searchedFiles.value = files
		.map((f) => f.flat())
		.flat()
		.filter((f) => f.basename.includes(searchValue.value))
		.map((f) => {
			const temp = cloneDeep(f);
			temp.children = [];
			return temp;
		});
});

function onOpen(file: File) {
	if (file.stats.isFile()) {
		showFile(file);
	}
}

function onClose(file: File) {
	closeFile(file);
}

onMounted(() => {
	nextTick(() => {
		/** 边框拖拽，改变目录大小 */
		interact('.resizable').resizable({
			edges: { top: false, left: false, bottom: false, right: true },
			margin: 20,
			listeners: {
				move: function (event: any) {
					let { x, y } = event.target.dataset;

					x = (parseFloat(x) || 0) + event.deltaRect.left;
					y = (parseFloat(y) || 0) + event.deltaRect.top;

					Object.assign(event.target.style, {
						width: `${event.rect.width}px`,
						height: `${event.rect.height}px`,
						transform: `translate(${x}px, ${y}px)`
					});

					Object.assign(event.target.dataset, { x, y });
				}
			}
		});
	});
});
</script>

<style
	scoped
	lang="less"
>
#workspace {
	padding: 0;

	.files {
		max-width: 50vw;
		min-width: 180px;
		height: 100% !important;
		border-right: 10px solid inherit;
	}

	.help {
		top: 30%;
		position: relative;
	}
}

#nav {
	position: sticky;
	top: 48px;
	z-index: 99;
}

#breadcrumb {
	white-space: nowrap;
	overflow: auto;
}

#actions {
	display: inline-flex;
	flex-wrap: nowrap;
	button {
		margin: 0 4px;
	}
}

.dirs {
	display: grid;
	grid-template-columns: repeat(auto-fill, 120px);
	grid-template-rows: auto;
}

.dir {
	border-radius: 4px;
	width: 100%;

	.dir-name {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	svg {
		width: 48px;
		height: 48px;
	}

	&.select {
		box-shadow: 0px 0px 4px #40a9ff7b;
	}
}

.dir:first-child {
	margin: 0;
}

[role='menuitem'],
[role='menu'] {
	width: 180px;
}
</style>
