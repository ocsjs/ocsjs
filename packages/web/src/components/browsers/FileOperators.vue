<template>
	<a-space>
		<a-dropdown trigger="hover">
			<a-button size="mini">
				<Icon type="more_horiz"> 更多 </Icon>
			</a-button>
			<template #content>
				<a-dsubmenu
					trigger="hover"
					value="option-1"
				>
					批量创建
					<template #content>
						<a-doption @click="state.showPlaywrightScriptSelector = true"> 自动化脚本浏览器 </a-doption>
					</template>
				</a-dsubmenu>
			</template>
		</a-dropdown>

		<a-button
			size="mini"
			type="outline"
			@click="newFolder"
		>
			<Icon type="folder"> 新建文件夹 </Icon>
		</a-button>
		<a-button
			size="mini"
			type="outline"
			@click="newBrowser()"
		>
			<Icon type="web"> 新建浏览器 </Icon>
		</a-button>

		<a-modal
			v-model:visible="state.showPlaywrightScriptSelector"
			:footer="false"
		>
			<template #title> 选择模板进行批量创建 </template>
			<PlaywrightScriptSelector
				v-model:playwright-scripts="state.playwrightScripts"
				style="max-height: 70vh; overflow: overlay"
				:multiple="false"
				@confirm="(state.showPlaywrightScriptSelector = false), showMultipleCreateTable()"
			></PlaywrightScriptSelector>
		</a-modal>

		<a-modal
			v-model:visible="state.showPlaywrightScriptTable"
			:footer="false"
			:closable="true"
			:mask-closable="false"
			:width="900"
		>
			<template #title> 批量创建：{{ state.selectedPS?.name }} </template>
			<PlaywrightScriptTable
				v-if="state.selectedPS"
				:raw-playwright-script="state.selectedPS"
				@cancel="state.showPlaywrightScriptTable = false"
				@confirm="multipleCreate"
			></PlaywrightScriptTable>
			<a-empty
				v-else
				description="请选择模板"
			/>
		</a-modal>
	</a-space>
</template>

<script setup lang="ts">
import { currentFolder } from '../../fs';
import { Browser } from '../../fs/browser';
import { Folder } from '../../fs/folder';
import { store } from '../../store';

import { resetSearch } from '../../utils/entity';
import Icon from '../Icon.vue';
import { inBrowser } from '../../utils/node';
import { Entity } from '../../fs/entity';
import { reactive, onMounted } from 'vue';
import { RawPlaywrightScript } from '../playwright-scripts';
import PlaywrightScriptSelector from '../playwright-scripts/PlaywrightScriptSelector.vue';
import PlaywrightScriptTable from '../playwright-scripts/PlaywrightScriptTable.vue';
import { remote } from '../../utils/remote';

const state = reactive({
	showPlaywrightScriptSelector: false,
	showPlaywrightScriptTable: false,
	playwrightScripts: [] as RawPlaywrightScript[],
	selectedPS: undefined as RawPlaywrightScript | undefined
});

const folder = store.paths.userDataDirsFolder;
let spe = '\\';

onMounted(async () => {
	spe = await remote.path.get('sep');
});

function newFolder() {
	// 关闭搜索模式
	resetSearch();
	const id = Entity.uuid();

	const folder = new Folder({
		uid: id,
		type: 'folder',
		name: '未命名文件夹',
		children: {},
		createTime: Date.now(),
		parent: currentFolder.value.uid,
		renaming: true
	});
	currentFolder.value.children[id] = folder;
}
function newBrowser(opts?: { name: string; playwrightScripts?: RawPlaywrightScript[]; store?: object }) {
	// 关闭搜索模式
	resetSearch();
	const id = Entity.uuid();

	currentFolder.value.children[id] = new Browser({
		type: 'browser',
		uid: id,
		name: opts?.name || '未命名浏览器',
		checked: false,
		createTime: Date.now(),
		notes: '',
		renaming: true,
		parent: currentFolder.value.uid,
		histories: [{ action: '创建', time: Date.now() }],
		cachePath: inBrowser ? '' : folder.endsWith(spe) ? folder + id : folder + spe + id,
		tags: [],
		// 使用拷贝消除对象的响应式特性，防止每个浏览器配置响应式同步。
		store: opts?.store ? JSON.parse(JSON.stringify(opts?.store)) : {},
		playwrightScripts: opts?.playwrightScripts ? JSON.parse(JSON.stringify(opts?.playwrightScripts)) : []
	});
}

function showMultipleCreateTable() {
	state.showPlaywrightScriptTable = true;
	state.selectedPS = state.playwrightScripts[0];
}

async function multipleCreate(
	raw: RawPlaywrightScript,
	configsList: (RawPlaywrightScript['configs'] & { browserName: string })[]
) {
	for (const configs of configsList) {
		newBrowser({
			name: configs.browserName,
			playwrightScripts: [
				{
					name: raw.name,
					configs: configs
				}
			]
		});
	}

	state.showPlaywrightScriptTable = false;
}
</script>

<style scoped lang="less"></style>
