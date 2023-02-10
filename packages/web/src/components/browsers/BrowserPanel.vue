<template>
	<div
		ref="profileElement"
		class="overflow-auto profile pt-2"
	>
		<a-descriptions :column="1">
			<a-descriptions-item label="文件名">
				{{ browser.name }}
			</a-descriptions-item>
			<a-descriptions-item label="创建时间">
				{{ datetime(browser.createTime) }}
			</a-descriptions-item>
			<a-descriptions-item label="文件位置">
				{{
					Folder.from(browser.parent)
						?.flatParents()
						.map((f) => f.name)
						.join(' / ')
				}}
				<a-button
					type="text"
					@click="instance?.location()"
				>
					跳转到该目录
				</a-button>
			</a-descriptions-item>
			<a-descriptions-item label="缓存路径">
				{{ browser.cachePath }}
			</a-descriptions-item>
		</a-descriptions>

		<a-divider />

		<a-descriptions
			v-if="instance"
			:column="1"
			size="large"
		>
			<a-descriptions-item label="标签分类">
				<div
					id="bp-tags"
					data-label="标签分类"
				>
					<Tags
						v-model:tags="instance.tags"
						size="small"
						@create="createTag"
						@remove="removeTag"
					></Tags>
				</div>
			</a-descriptions-item>
			<a-descriptions-item label="备注描述">
				<a-textarea
					id="bp-notes"
					v-model="instance.notes"
					data-label="备注描述"
					placeholder="备注为空~"
					:auto-size="{
						minRows: 2,
						maxRows: 10
					}"
					allow-clear
				/>
			</a-descriptions-item>

			<a-descriptions-item label="OCS配置">
				<div
					id="bp-ocs-config"
					data-label="OCS配置"
				>
					<OCSPanel v-model:store="instance.store"></OCSPanel>
				</div>
			</a-descriptions-item>

			<a-descriptions-item label="文件数据">
				<a-button
					id="bp-file-data"
					data-label="文件数据"
					size="mini"
					@click="state.showCode = true"
				>
					点击查看
				</a-button>
				<a-modal
					v-model:visible="state.showCode"
					:footer="false"
					:simple="true"
					:width="600"
					modal-class="p-0 m-0"
				>
					<div
						class="m-3"
						style="height: 70vh; overflow: overlay"
					>
						<a-textarea
							:auto-size="true"
							:disabled="true"
							:model-value="JSON.stringify(instance, null, 4)"
						></a-textarea>
					</div>
				</a-modal>
			</a-descriptions-item>

			<a-descriptions-item label="操作历史">
				<div
					id="bp-file-history"
					data-label="操作历史"
					class="histories"
				>
					<template v-if="browser.histories.length">
						<a-button
							size="mini"
							class="mb-2"
						>
							<Icon
								type="delete"
								@click="clearHistory"
							>
								清空
							</Icon>
						</a-button>

						<a-timeline>
							<template
								v-for="(history, index) of browser.histories"
								:key="index"
							>
								<a-timeline-item>
									<p
										class="text-secondary"
										style="font-size: 12px"
									>
										{{ datetime(history.time) }}
									</p>
									<p>
										<span>{{ history.action }}</span>
										<span v-if="history.content">: {{ history.content }} </span>
									</p>
								</a-timeline-item>
							</template>
						</a-timeline>
					</template>

					<a-empty v-else />
				</div>
			</a-descriptions-item>
		</a-descriptions>
	</div>
</template>

<script setup lang="ts">
import { store } from '../../store';
import { Browser } from '../../fs/browser';
import { datetime } from '../../utils';

import Tags from '../Tags.vue';
import Icon from '../Icon.vue';
import OCSPanel from '../OCSPanel.vue';
import { BrowserOptions, Tag } from '../../fs/interface';
import { Folder } from '../../fs/folder';
import { currentBrowser } from '../../fs/index';
import { reactive, onMounted, nextTick, ref } from 'vue';

const props = defineProps<{
	browser: BrowserOptions;
}>();

const instance = Browser.from(props.browser.uid);
const profileElement = ref<HTMLElement>();

const state = reactive({
	showCode: false
});

function createTag(tag: Tag) {
	if (store.render.browser.tags[tag.name]) {
		store.render.browser.tags[tag.name].count += 1;
	} else {
		store.render.browser.tags[tag.name] = {
			color: tag.color,
			count: 1
		};

		currentBrowser.value?.histories.unshift({
			action: '添加标签',
			content: tag.name,
			time: Date.now()
		});
	}
}
function removeTag(tag: Tag) {
	if (store.render.browser.tags[tag.name] && store.render.browser.tags[tag.name].count > 1) {
		store.render.browser.tags[tag.name].count -= 1;
	} else {
		Reflect.deleteProperty(store.render.browser.tags, tag.name);
	}

	currentBrowser.value?.histories.unshift({ action: '删除标签', content: tag.name, time: Date.now() });
}

function clearHistory() {
	if (currentBrowser.value) {
		currentBrowser.value.histories = [];
	}
}

/** 渲染侧边toc跳转栏 */
onMounted(() => {
	nextTick(() => {
		const configs = Array.from(document.querySelectorAll('[id^=bp-]')) as HTMLElement[];
		console.log(configs);
		const toc = document.createElement('div');
		toc.classList.add('bp-toc');
		const bp = document.querySelector('#browser-panel');
		const drawer = document.querySelector('#browser-panel .arco-drawer');
		if (bp && drawer) {
			bp.prepend(toc);
			toc.style.right = drawer.clientWidth + 'px';
			for (const el of configs) {
				const div = document.createElement('div');
				div.textContent = el.dataset.label || '';
				div.addEventListener('click', () => {
					el.scrollIntoView();
				});
				toc.append(div);
			}
		}
	});
});
</script>

<style scoped lang="less">
.histories {
	max-height: 500px;
	height: 500px;
	overflow: overlay;
	p {
		margin-bottom: 0px;
	}
}

.profile {
	height: 100%;
	:deep(.arco-descriptions-item-label) {
		white-space: nowrap;
		vertical-align: top;
	}
}
</style>
