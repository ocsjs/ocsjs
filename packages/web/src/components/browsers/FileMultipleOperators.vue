<template>
	<a-row class="col-12 p-1 ps-2 pe-2">
		<a-col flex="auto">
			<a-space :size="0">
				<template #split>
					<a-divider direction="vertical" />
				</template>

				<a-button
					size="mini"
					@click="selectAllBrowserOfCurrentFolder"
				>
					全选
				</a-button>

				<template v-if="currentCheckedBrowsers.length">
					<span
						class="text-secondary"
						style="font-size: 12px"
					>
						当前共选中 {{ currentCheckedBrowsers.length }} 个文件

						<a-button
							size="mini"
							type="text"
							@click="state.showChecked = true"
						>
							查看
						</a-button>
					</span>

					<a-dropdown>
						<a-button size="mini"> 选择批量操作 <icon-down /> </a-button>
						<template #content>
							<a-doption
								style="width: 100px"
								@click="copy"
							>
								复制
							</a-doption>
							<a-doption @click="cut"> 剪切 </a-doption>
							<a-doption
								class="border-bottom"
								:disabled="state.selectBrowsers.length === 0"
								@click="paste"
							>
								粘贴
							</a-doption>

							<a-doption @click="launchAll"> 批量运行 </a-doption>
							<a-doption @click="closeAll"> 批量关闭 </a-doption>
							<a-doption @click="deleteAll"> 批量删除 </a-doption>
						</template>
					</a-dropdown>

					<a-button
						size="mini"
						@click="cancelAllBrowserCheck"
					>
						取消
					</a-button>
				</template>
			</a-space>
		</a-col>

		<!-- 文件操作 -->
		<FileOperators v-if="currentSearchedEntities === undefined"></FileOperators>

		<a-drawer
			v-model:visible="state.showChecked"
			:title="`已选中 ${currentCheckedBrowsers.length} 个文件`"
			:width="740"
			:footer="false"
		>
			<div>
				<FileHeader :columns="['checkbox', 'name', 'extra']"></FileHeader>
				<template
					v-for="browser of currentCheckedBrowsers"
					:key="browser.uid"
				>
					<EntityVue :entity="browser">
						<template #prefix>
							<!-- 单选框 -->
							<a-col
								flex="32px"
								class="d-flex"
							>
								<a-checkbox v-model="browser.checked"></a-checkbox>
							</a-col>
						</template>

						<template #extra>
							<!-- 备注 -->
							<a-col
								flex="250px"
								class="text-secondary notes"
							>
								<a-tooltip
									content="备注描述"
									position="tl"
								>
									<span> {{ browser.notes }} </span>
								</a-tooltip>
							</a-col>

							<!-- 标签 -->
							<a-col flex="250px">
								<Tags
									:tags="browser.tags"
									:read-only="true"
									size="small"
								></Tags>
							</a-col>
						</template>
					</EntityVue>
				</template>
			</div>
		</a-drawer>
	</a-row>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { currentFolder, currentSearchedEntities } from '../../fs';
import { Browser } from '../../fs/browser';
import { root } from '../../fs/folder';
import FileHeader from './FileHeader.vue';
import FileOperators from './FileOperators.vue';
import { BrowserOptions } from '../../fs/interface';
import { inBrowser } from '../../utils/node';
import { store } from '../../store';
import { remote } from '../../utils/remote';
import { Entity } from '../../fs/entity';
import EntityVue from '../Entity.vue';
import Tags from '../Tags.vue';

const state = reactive({
	showChecked: false,
	selectBrowsers: [] as Browser[],
	pasteType: 'copy' as 'copy' | 'cut'
});

/** 当前文件夹的浏览器 */
const currentSources = computed(
	() =>
		Object.keys(currentFolder.value.children)
			.map((key) => currentFolder.value.children[key])
			.filter((e) => e.type === 'browser') as Browser[]
);

/** 所有浏览器 */
const allSources = computed(() =>
	currentSearchedEntities.value
		? (currentSearchedEntities.value.filter((e) => e.type === 'browser') as Browser[])
		: (root().findAll((e) => e.type === 'browser') as Browser[])
);

/** 当前选中的浏览器 */
const currentCheckedBrowsers = computed(() => allSources.value.filter((e) => e.checked));

function selectAllBrowserOfCurrentFolder() {
	for (const child of currentSources.value) {
		if (child.type === 'browser') {
			child.checked = true;
		}
	}
}

function cancelAllBrowserCheck() {
	for (const child of root().findAll((e) => e.type === 'browser' && e.checked === true)) {
		if (child.type === 'browser') {
			child.checked = false;
		}
	}
}

async function launchAll() {
	for (const browser of currentCheckedBrowsers.value) {
		await Browser.from(browser.uid)?.launch();
	}
}

async function closeAll() {
	for (const browser of currentCheckedBrowsers.value) {
		await Browser.from(browser.uid)?.close();
	}
}

async function deleteAll() {
	for (const browser of currentCheckedBrowsers.value) {
		await Browser.from(browser.uid)?.remove();
	}
}

function copy() {
	state.selectBrowsers = currentCheckedBrowsers.value;
	state.pasteType = 'copy';
}

function cut() {
	state.selectBrowsers = currentCheckedBrowsers.value;
	state.pasteType = 'cut';
}

async function paste() {
	const browsers: BrowserOptions[] = JSON.parse(JSON.stringify(state.selectBrowsers));
	state.selectBrowsers = [];

	for (const browser of browsers) {
		const id = await Entity.uuid();
		browser.uid = id;
		browser.cachePath = inBrowser ? '' : await remote.path.call('join', store.paths.userDataDirsFolder, id);
		browser.parent = currentFolder.value.uid;
		browser.checked = false;

		currentFolder.value.children[id] = new Browser(browser);
	}

	if (state.pasteType === 'cut') {
		for (const source of allSources.value) {
			if (source.type === 'browser' && source.checked) {
				await source.remove();
			}
		}
	}

	cancelAllBrowserCheck();
}
</script>

<style scoped lang="less">
.entity {
	padding: 4px 0px;
}

.notes {
	font-size: 12px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
</style>
