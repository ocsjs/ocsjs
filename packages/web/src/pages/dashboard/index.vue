<template>
	<div class="col-12 p-2 m-auto">
		<div class="d-flex mb-1 align-items-center">
			<a-select
				v-model:value="num"
				size="small"
				style="width: 100px"
				:options="[2, 4, 6, 8].map((i) => ({ value: i, label: `显示${i}列` }))"
			>
			</a-select>
			<a-divider type="vertical" />

			<a-input-search
				v-model:value="search"
				placeholder="输入浏览器名字进行搜索"
				size="small"
				style="width: 200px"
			/>
		</div>

		<template v-if="object.keys(processes).length === 0">
			<a-empty
				class="pt-5"
				description="没有运行中的浏览器"
			></a-empty>
		</template>
		<template v-else>
			<div
				class="dashboard pt-1"
				:style="{
					'grid-template-columns': `repeat(${num}, 1fr)`
				}"
			>
				<template
					v-for="key of object.keys(processes)"
					:key="key"
				>
					<a-tooltip title="点击操控浏览器">
						<div
							class="browser"
							@click="openBrowser(key)"
						>
							<template v-if="processes[key].pageId">
								<div class="browser-title">
									{{ processes[key].pages[processes[key].pageId].title || 'about:blank' }}
								</div>
								<img
									class="browser-img"
									style="width: 100%"
									:src="`data:image/png;base64, ${processes[key].base64}`"
								/>
							</template>

							<a-empty
								v-else
								description="请等待浏览器初始化完毕"
							>
							</a-empty>
						</div>
					</a-tooltip>
				</template>
			</div>
		</template>

		<a-modal
			v-model:visible="visible"
			width="1080px"
			style="top: 10px; text-align: center"
			:title="modelTitle"
			:footer="null"
		>
			<a-tabs
				v-if="!!currentProcess"
				:active-key="currentProcess.pageId"
				type="editable-card"
				@edit="onEdit"
				@change="(key:string) => currentProcess!.pageSwitch(key)"
			>
				<a-tab-pane
					v-for="key in object.keys(currentProcess.pages)"
					:key="key"
					:tab="currentProcess.pages[key].title || 'about:blank'"
					:closable="true"
				>
				</a-tab-pane>
			</a-tabs>
			<div style="overflow: auto; height: calc(100vh - 140px)">
				<img
					v-if="currentProcess"
					style="width: 100%"
					class="browser-img"
					:src="`data:image/png;base64, ${currentProcess.base64}`"
				/>
			</div>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { processes } from '../../utils/process';
const object = Object;
/** 列数控制 */
const num = ref(4);

/** 搜索 */
const search = ref('');
/** 当前的文件 */
const activeKey = ref('');
/** 预览图像弹窗 */
const visible = ref(false);
/** 弹窗标题 */
const modelTitle = ref('');

const currentProcessUid = ref<string>('');
const currentProcess = computed(() => processes[currentProcessUid.value]);
const panes = ref<{ title: string; key: string }[]>([]);

const add = () => {
	activeKey.value = Date.now().toString();
	panes.value.push({ title: 'New Tab', key: activeKey.value });
};

const remove = (targetKey: string) => {
	let lastIndex = 0;
	panes.value.forEach((pane, i) => {
		if (pane.key === targetKey) {
			lastIndex = i - 1;
		}
	});
	panes.value = panes.value.filter((pane) => pane.key !== targetKey);
	if (panes.value.length && activeKey.value === targetKey) {
		if (lastIndex >= 0) {
			activeKey.value = panes.value[lastIndex].key;
		} else {
			activeKey.value = panes.value[0].key;
		}
	}
};

const onEdit = (targetKey: string, action: string) => {
	if (action === 'add') {
		add();
	} else {
		remove(targetKey);
		currentProcess.value?.closePage(targetKey);
	}
};

function openBrowser(uid: string) {
	currentProcessUid.value = uid;
	visible.value = true;
}
</script>

<style scoped lang="less">
.dashboard {
	display: grid;
	gap: 10px;
	grid-template-columns: repeat(6, 1fr);
}

.screenshot-item-title {
	padding: 0px 4px;
	white-space: nowrap;
}

.browser {
	overflow: hidden;
	cursor: pointer;
	border-radius: 4px;
	box-shadow: 0px 2px 8px -2px #b7b7b7;
}

.browser:hover {
	box-shadow: 0px 2px 4px -2px #1890ff;
}
</style>
