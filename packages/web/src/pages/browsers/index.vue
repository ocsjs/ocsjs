<template>
	<div
		id="browsers"
		class="h-100"
	>
		<div class="col-12 p-1 ps-2 pe-2">
			<span class="breadcrumb">
				<a-breadcrumb>
					<a-breadcrumb-item
						class="path-item"
						@click="store.browser.currentFolderUid = ''"
						>根目录</a-breadcrumb-item
					>
					<template
						v-for="folder of currentFolder ? flatFolder(currentFolder) : []"
						:key="folder.uid"
					>
						<a-breadcrumb-item
							class="path-item"
							@click="go(folder.uid)"
						>
							{{ folder.name }}
						</a-breadcrumb-item>
					</template>
				</a-breadcrumb>
			</span>
		</div>
		<div class="col-12 p-1 ps-2 pe-2 mb-2 operations">
			<a-button
				size="small"
				ghost
				type="primary"
				shape="round"
			>
				<Icon
					type="icon-folder-fill"
					@click="newFolder"
					>新建文件夹</Icon
				>
			</a-button>
			<a-button
				size="small"
				ghost
				type="primary"
				shape="round"
			>
				<Icon
					type="icon-chrome-fill"
					@click="newBrowser"
					>多开浏览器</Icon
				>
			</a-button>

			<a-divider type="vertical" />
			<a-select
				v-model:value="state.search.tags"
				size="small"
				mode="multiple"
				placeholder="使用标签过滤浏览器"
				style="min-width: 200px"
			>
				<template
					v-for="key in object.keys(store.browser.tags)"
					:key="key"
				>
					<a-select-option
						:value="key"
						:label="key"
					>
						<a-tag :color="store.browser.tags[key].color"> {{ key }} </a-tag>
						<span style="float: right"> {{ store.browser.tags[key].count }} </span>
					</a-select-option>
				</template>
			</a-select>
			<a-input-search
				v-model:value="state.search.name"
				size="small"
				placeholder="输入名字搜索浏览器"
				style="min-width: 200px; border-radius: 12px"
				@search="onSearch"
			/>
		</div>
		<a-divider class="m-0"></a-divider>

		<!-- 显示浏览器以及文件夹列表 -->
		<template v-if="currentBrowsers.length === 0 && currentFolders.length === 0">
			<a-empty
				class="p-3"
				description="暂无任何浏览器"
			></a-empty
		></template>
		<template v-else-if="state.search.results && state.search.results.length === 0">
			<a-empty
				class="p-3"
				description="暂无浏览器搜索结果"
			></a-empty
		></template>
		<div
			v-else
			class="col-12 list-container p-2"
		>
			<!-- 显示当前浏览器的信息 -->
			<a-drawer
				v-if="currentBrowser"
				placement="right"
				:closable="false"
				:visible="!!currentBrowser"
				width="600"
				:get-container="false"
				:style="{ position: 'absolute' }"
				@close="store.browser.currentBrowserUid = ''"
			>
				<a-space class="mb-3 d-flex justify-content-end">
					<template v-if="currentBrowser.running">
						<a-button
							shape="round"
							size="small"
						>
							<Icon
								type="icon-upload"
								@click="bringToFront"
							>
								置顶
							</Icon>
						</a-button>
						<a-button
							shape="round"
							size="small"
						>
							<Icon
								type="icon-sync"
								@click="rerun"
							>
								重启
							</Icon>
						</a-button>
						<a-button
							size="small"
							shape="round"
							danger
						>
							<Icon
								type="icon-close"
								@click="close"
							>
								关闭
							</Icon>
						</a-button>
					</template>
					<template v-else>
						<a-button
							type="primary"
							shape="round"
							size="small"
						>
							<Icon
								type="icon-play-circle"
								@click="run"
							>
								启动
							</Icon>
						</a-button>
					</template>
				</a-space>

				<a-descriptions
					class="profile"
					bordered
					size="small"
				>
					<a-descriptions-item
						label="名字"
						:span="3"
					>
						{{ currentBrowser.name }}
					</a-descriptions-item>
					<a-descriptions-item
						label="位置"
						:span="3"
					>
						根目录 /
						<template v-if="currentBrowser.parent">
							{{
								flatFolder(store.browser.folders.find((f) => f.uid === currentBrowser?.parent)!)
									.map((f) => f.name)
									.join(' / ')
							}}
							<a-button
								type="link"
								@click="go(currentBrowser?.parent!, currentBrowser?.uid)"
							>
								跳转到该目录
							</a-button>
						</template>
					</a-descriptions-item>
					<a-descriptions-item
						label="标签"
						:span="3"
					>
						<Tags
							v-model:tags="currentBrowser.tags"
							@create="createTag"
							@remove="removeTag"
						></Tags>
					</a-descriptions-item>
					<a-descriptions-item
						label="备注"
						:span="3"
					>
						<textarea
							class="notes"
							:value="currentBrowser.notes"
							@blur="changeNotes"
						></textarea>
					</a-descriptions-item>
					<a-descriptions-item
						label="创建于"
						:span="3"
					>
						{{ date(currentBrowser.createTime) }}
					</a-descriptions-item>
					<a-descriptions-item
						label="缓存路径"
						:span="3"
					>
						{{ currentBrowser.cachePath }}
					</a-descriptions-item>

					<a-descriptions-item
						label="操作历史"
						:span="3"
					>
						<a-timeline class="histories">
							<template
								v-for="(history, index) of currentBrowser.histories"
								:key="index"
							>
								<a-timeline-item>
									<p>{{ datetime(history.time) }}</p>
									<p>
										<span>{{ history.action }}</span>
										<span v-if="history.content">: {{ history.content }} </span>
									</p>
								</a-timeline-item>
							</template>
						</a-timeline>
					</a-descriptions-item>
				</a-descriptions>
			</a-drawer>

			<div class="list text-center">
				<!-- 当处于搜素时，隐藏文件夹 -->
				<template v-if="state.search.results === undefined">
					<template
						v-for="(folder, index) of currentFolders"
						:key="index"
					>
						<Entity
							:name="folder.name"
							:uid="folder.uid"
							:renaming="folder.renaming"
							:on-click="(uid) => (store.browser.currentFolderUid = uid)"
							:on-rename="
								(uid, name) => {
									folder.name = name;
									folder.renaming = false;
								}
							"
							:on-remove="removeFolder"
							icon="icon-wenjianjia"
						>
						</Entity>
					</template>
				</template>
				<template
					v-for="(browser, index) of state.search.results ? state.search.results : currentBrowsers"
					:key="index"
				>
					<Entity
						:name="browser.name"
						:uid="browser.uid"
						:renaming="browser.renaming"
						:on-click="() => (store.browser.currentBrowserUid = browser.uid)"
						:on-remove="removeBrowser"
						:on-rename="
							(uid, name) => {
								browser.histories.unshift({ action: '改名', content: `${browser.name} => ${name}`, time: Date.now() });
								browser.name = name;
								browser.renaming = false;
							}
						"
						:icon="currentBrowser?.uid === browser.uid ? 'icon-chrome-fill' : 'icon-chrome'"
					>
					</Entity>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Icon from '../../components/Icon.vue';
import { store } from '../../store';
import { NodeJS } from '../../utils/export';
import { Browser, BrowserFolder, Tag } from '../../types/browser';
import { computed, reactive, nextTick, watch } from 'vue';
import Entity from '../../components/Entity.vue';
import { date, datetime } from '../../utils';
import Tags from '../../components/Tags.vue';

import { Process, processes } from '../../utils/process';
const object = Object;

/** 当前所在的文件夹 */
const currentFolder = computed(() => store.browser.folders.find((f) => f.uid === store.browser.currentFolderUid));
/** 当前编辑的浏览器 */
const currentBrowser = computed(() => store.browser.list.find((f) => f.uid === store.browser.currentBrowserUid));
/** 当前的文件夹列表 */
const currentFolders = computed(() =>
	currentFolder.value
		? store.browser.folders.filter((f) => f.parent === currentFolder.value?.uid)
		: store.browser.folders.filter((f) => f.parent === undefined)
);
/** 当前的浏览器列表 */
const currentBrowsers = computed(() =>
	currentFolder.value
		? store.browser.list.filter((b) => b.parent === currentFolder.value?.uid)
		: store.browser.list.filter((b) => b.parent === undefined)
);

const state = reactive({
	search: {
		name: '',
		tags: [],
		results: undefined as Browser[] | undefined
	}
});

// 浏览器标签过滤搜索
watch(
	() => state.search.tags,
	(tags) => {
		if (tags.length) {
			state.search.results = store.browser.list.filter((b) => tags.some((t) => b.tags.find((bt) => bt.name === t)));
		} else {
			state.search.results = undefined;
		}
	}
);
// 浏览器名字过滤搜索
watch(
	() => state.search.name,
	(name) => {
		if (name) {
			state.search.results = store.browser.list.filter((b) => RegExp(name).test(b.name));
		} else {
			state.search.results = undefined;
		}
	}
);

const uid = () => NodeJS.crypto.randomUUID().replace(/-/g, '');

/** 当前浏览器图像 */
// const base64 = ref('');

function flatFolder(folder: BrowserFolder) {
	const folders: BrowserFolder[] = [folder];

	let f = findFolder(folder.parent);
	while (f) {
		folders.unshift(f);
		f = findFolder(f.parent);
	}

	return folders;
}

function findFolder(uid: string | undefined) {
	return store.browser.folders.find((f) => f.uid === uid);
}

function removeFolder(uid: string) {
	const f = store.browser.folders.findIndex((f) => f.uid === uid);
	if (f !== -1) {
		// 删除所有子文件夹
		for (const folder of store.browser.folders.at(f)?.children || []) {
			removeFolder(folder);
		}
		// 删除所有子浏览器
		store.browser.list = store.browser.list.filter((b) => b.parent !== uid);
		// 删除
		store.browser.folders.splice(f, 1);
	}
}
function removeBrowser(uid: string) {
	const b = store.browser.list.findIndex((b) => b.uid === uid);
	if (b !== -1) {
		store.browser.list.splice(b, 1);
	}
}

function newFolder() {
	// 关闭搜索模式
	state.search.name = '';
	state.search.tags = [];
	state.search.results = undefined;

	// 创建文件夹
	const id = uid();
	currentFolder.value?.children.push(id);
	store.browser.folders.push({
		uid: id,
		name: '未命名文件夹',
		children: [],
		createTime: Date.now(),
		parent: currentFolder.value?.uid,
		renaming: true
	});
}
function newBrowser() {
	// 关闭搜索模式
	state.search.name = '';
	state.search.tags = [];
	state.search.results = undefined;

	// 创建浏览器
	const id = uid();
	store.browser.list.push({
		uid: id,
		name: '未命名浏览器',
		createTime: Date.now(),
		notes: '',
		tags: [],
		parent: currentFolder.value?.uid,
		renaming: true,
		histories: [{ action: '创建', time: Date.now() }],
		cachePath: NodeJS.path.join(store.userDataDirsFolder, id),
		running: false
	});
}

function createTag(tag: Tag) {
	if (store.browser.tags[tag.name]) {
		store.browser.tags[tag.name].count += 1;
	} else {
		store.browser.tags[tag.name] = {
			color: tag.color,
			count: 1
		};
		const browser = getCurrentBrowser();
		browser?.histories.unshift({
			action: '添加标签',
			content: tag.name,
			time: Date.now()
		});
	}
}
function removeTag(tag: Tag) {
	if (store.browser.tags[tag.name] && store.browser.tags[tag.name].count > 1) {
		store.browser.tags[tag.name].count -= 1;
	} else {
		Reflect.deleteProperty(store.browser.tags, tag.name);
	}
	const browser = getCurrentBrowser();
	browser?.histories.unshift({ action: '删除标签', content: tag.name, time: Date.now() });
}

function onSearch() {}

async function run() {
	const browser = getCurrentBrowser();
	if (browser) {
		const process = new Process(browser.cachePath, {
			executablePath: store.setting.launchOptions.executablePath,
			headless: false
		});

		await process.init(console.log);
		process.launch();
		processes[browser.uid] = process;
		browser.running = true;
		browser.histories.unshift({ action: '运行', time: Date.now() });
	}
}
async function rerun() {
	const browser = getCurrentBrowser();
	if (browser) {
		const process = processes[browser.uid];
		browser.running = false;
		process?.close();
		await process?.init();
		process?.launch();
		browser.running = true;
		browser.histories.unshift({ action: '重启', time: Date.now() });
	}
}
function close() {
	const browser = getCurrentBrowser();
	if (browser) {
		const process = processes[browser.uid];
		browser.running = false;
		process?.close();
		Reflect.deleteProperty(processes, browser.uid);

		browser.histories.unshift({ action: '关闭', time: Date.now() });
	}
}

function bringToFront() {
	const browser = getCurrentBrowser();
	if (browser) {
		const process = processes[browser.uid];
		process?.bringToFront();
	}
}

function changeNotes(e: any) {
	const browser = getCurrentBrowser();
	if (browser && e.target.value !== '' && browser.notes !== e.target.value) {
		browser.notes = e.target.value;
		browser?.histories.unshift({ action: '备注', content: browser.notes, time: Date.now() });
	}
}

function getCurrentBrowser() {
	return store.browser.list.find((b) => b.uid === currentBrowser.value?.uid);
}

function go(folderUid: string, browserUid?: string) {
	// 关闭搜索模式
	state.search.name = '';
	state.search.tags = [];
	state.search.results = undefined;

	store.browser.currentFolderUid = folderUid;
	nextTick(() => {
		store.browser.currentBrowserUid = browserUid || '';
	});
}
</script>

<style scoped lang="less">
.operations {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: nowrap;
	overflow-x: auto;
	overflow-y: hidden;
}
.breadcrumb {
	background-color: #f2f2f2;
	padding: 4px 12px;
	border-radius: 4px;
	white-space: nowrap;
	margin-bottom: 0px;
	width: 100%;
}

.path-item {
	cursor: pointer;
}

.list-container {
	height: calc(100% - 94px);
	position: relative;
	overflow: hidden;
}

.list {
	display: grid;
	grid-template-columns: repeat(auto-fill, 100px);
}

.browser-profile {
	display: grid;
	grid-template-columns: repeat(auto-fill, 1fr);
}

.add-folder-or-browser {
	border: 2px dashed #dbdbdb;
	border-radius: 4px;
	display: flex;
	justify-content: center;
	align-items: center;

	&::before {
		color: #ebebeb;
		font-size: 64px;
		content: '+';
	}

	&:hover {
		background-color: #f7f7f7;
	}
}

.active {
	box-shadow: 0px 0px 24px blue;
}

.histories {
	padding: 12px 0px;

	p {
		margin-bottom: 0px;
	}
}
.notes {
	padding: 4px 12px;
	border-radius: 4px;
	border: 1px solid #bababa;
	width: 100%;
	outline: none;
	appearance: none;
}
.profile {
	:deep(.ant-descriptions-item-label) {
		white-space: nowrap;
		vertical-align: top;
	}
	overflow: auto;
	height: calc(100% - 48px);
}
:deep(.ant-drawer-body) {
	padding: 12px;
}
</style>
