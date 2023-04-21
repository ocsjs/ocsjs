<template>
	<div
		ref="profileElement"
		class="overflow-auto profile"
	>
		<div class="float-end ps-3 pe-3">
			<BrowserOperators
				:browser="instance"
				tooltip-position="br"
				icon-class="fs-4"
			>
				<template #split>
					<a-divider direction="vertical" />
				</template>

				<template #extra>
					<a-tooltip position="br">
						<template #content>
							仅打开浏览器，不执行其他操作。<br />
							此方法可以防止各种浏览器环境问题：<br />
							- 无法打开特殊的超星网页<br />
							- 弹窗自动被关闭等等问题 <br />
							如果你并没有遇到这些问题，可以不使用此方法，可以直接使用蓝色的启动按钮。
						</template>

						<a-button
							size="mini"
							@click="instance.onlyLaunch()"
						>
							<Icon type="web" />
						</a-button>
					</a-tooltip>
				</template>
			</BrowserOperators>
		</div>

		<a-divider class="mt-1 mb-1" />

		<a-descriptions :column="1">
			<a-descriptions-item label="文件名">
				{{ instance.name }}
			</a-descriptions-item>
			<a-descriptions-item label="创建时间">
				{{ datetime(instance.createTime) }}
			</a-descriptions-item>
			<a-descriptions-item label="文件位置">
				{{
					Folder.from(instance.parent)
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
				{{ instance.cachePath }}
			</a-descriptions-item>
		</a-descriptions>

		<a-divider class="mt-1 mb-1" />

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

			<a-descriptions-item label="自动化脚本">
				<div
					id="bp-playwright-scripts"
					data-label="自动化脚本"
				>
					<a-tooltip>
						<template #content>
							启动浏览器后会运行 “自动化脚本”。每个自动化脚本会开启一个新的页面。 选择并确定后,
							需要在浏览器设置里修改配置。
							<a-divider class="mt-1 mb-1" />
							提示1：自动化脚本拥有操控页面的所有权限，与用户脚本不同的是，用户脚本是运行在页面中，权限比较少。<br />
							提示2：通常用来辅助用户脚本一起配合运行。
						</template>

						<a-button
							size="mini"
							@click="state.showPlaywrightScriptSelector = true"
						>
							设置 <icon-settings />
						</a-button>
					</a-tooltip>
					<div class="mt-2">
						<PlaywrightScripts v-model:playwright-scripts="instance.playwrightScripts"></PlaywrightScripts>
					</div>
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

			<a-descriptions-item label="日志输出">
				<div
					id="bp-xterm"
					data-label="日志输出"
				>
					<XTerm :uid="instance.uid"></XTerm>
				</div>
			</a-descriptions-item>

			<a-descriptions-item label="操作历史">
				<div
					id="bp-file-history"
					data-label="操作历史"
					class="histories"
				>
					<template v-if="instance.histories.length">
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
								v-for="(history, index) of instance.histories"
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

		<a-modal
			v-model:visible="state.showPlaywrightScriptSelector"
			:footer="false"
		>
			<template #title> 选择自动化脚本 </template>
			<PlaywrightScriptSelector
				v-model:playwright-scripts="instance.playwrightScripts"
				style="max-height: 70vh; overflow: overlay"
				@confirm="state.showPlaywrightScriptSelector = false"
			></PlaywrightScriptSelector>
		</a-modal>
	</div>
</template>

<script setup lang="ts">
import { store } from '../../store';
import { Browser } from '../../fs/browser';
import { datetime } from '../../utils';
import Tags from '../Tags.vue';
import Icon from '../Icon.vue';
import { BrowserOptions, Tag } from '../../fs/interface';
import { Folder } from '../../fs/folder';
import { currentBrowser } from '../../fs/index';
import { reactive, onMounted, nextTick, ref } from 'vue';
import PlaywrightScriptSelector from '../playwright-scripts/PlaywrightScriptSelector.vue';
import PlaywrightScripts from '../playwright-scripts/PlaywrightScriptList.vue';
import XTerm from '../XTerm.vue';
import BrowserOperators from './BrowserOperators.vue';

const props = defineProps<{
	browser: BrowserOptions;
}>();

// 这里因为 BrowserPanel 使用的是侧边栏，侧边栏关闭时会自动销毁对象，所以不用做 compute 计算处理
const instance = Browser.from(props.browser.uid);
const profileElement = ref<HTMLElement>();

const state = reactive({
	showCode: false,
	showPlaywrightScriptSelector: false
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
