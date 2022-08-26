<template>
	<div class="col-12 ps-1 pe-1 m-auto">
		<a-tabs
			v-model:activeKey="activeKey"
			class="h-100"
		>
			<a-tab-pane
				key="1"
				tab="本地脚本"
			>
				<div v-if="store.userScripts.length === 0">
					<a-empty description="暂无数据, 搜索喜欢的脚本进行添加哦~" />
				</div>
				<div
					v-else
					class="p-2"
				>
					<p class="text-secondary markdown">
						文件中选择 <code>自动加载脚本</code> ，启动后会自动 <code>安装/更新</code> 以下脚本到浏览器。
					</p>
					<ScriptList :scripts="store.userScripts">
						<template #actions="{ script }">
							<a-tooltip title="移除脚本">
								<a-button
									size="small"
									danger
									type="primary"
									class="user-script-action"
									@click="onRemoveScript(script)"
								>
									<Icon type="icon-delete" />
								</a-button>
							</a-tooltip>

							<a-tooltip :title="script.runAtAll ? '关闭脚本' : '开启脚本'">
								<a-button
									size="small"
									:type="script.runAtAll ? 'primary' : 'default'"
									class="user-script-action"
									@click="script.runAtAll = !script.runAtAll"
								>
									<Icon :type="script.runAtAll ? 'icon-timeout' : 'icon-play-circle'" />
								</a-button>
							</a-tooltip>
						</template>
					</ScriptList>
				</div>
			</a-tab-pane>
			<a-tab-pane
				key="2"
				tab="脚本搜索"
			>
				<div class="user-script-page">
					<div class="col-12 actions d-flex">
						<a-input-search
							v-model:value="searchValue"
							placeholder="输入脚本名进行搜索"
							enter-button
							@search="onSearch"
						/>
					</div>

					<div class="col-12">
						<a-tabs v-model:activeKey="engineKey">
							<a-tab-pane
								v-for="item of engineSearchList"
								:key="item.engine.name"
								:tab="item.engine.name"
							>
								<div v-if="item.loading">
									<a-skeleton active />
								</div>
								<div v-else-if="item.error">
									<a-empty description="请求出错，请重新尝试" />
								</div>
								<div v-else-if="item.list.length === 0">
									<a-empty description="暂无数据" />
								</div>
								<div
									v-else
									class="user-script-list"
								>
									<div class="pb-1">
										数据来源 :
										<a
											:href="item.engine.homepage"
											target="_blank"
											>{{ item.engine.homepage }}</a
										>
									</div>

									<ScriptList :scripts="item.list">
										<template #actions="{ script, alreadyInstalled }">
											<a-button
												size="small"
												class="user-script-action"
												:disabled="alreadyInstalled"
												:type="alreadyInstalled ? 'default' : 'primary'"
												@click="onAddScript(script)"
											>
												<Icon type="icon-plus" /> {{ alreadyInstalled ? '已添加' : '添加' }}
											</a-button>
										</template>
									</ScriptList>
								</div>
							</a-tab-pane>
						</a-tabs>
					</div>
				</div>
			</a-tab-pane>
		</a-tabs>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { config } from '../../config';
import { store, StoreUserScript } from '../../store';
import { ScriptSearchEngine } from '../../types/search';
import ScriptList from './ScriptList.vue';

/** 搜索列表 */
const engineSearchList = ref<
	{
		engine: ScriptSearchEngine;
		loading?: boolean;
		error?: boolean;
		list: StoreUserScript[];
	}[]
>(config.scriptSearchEngines.map((engine) => ({ engine, list: [] })));

/** 标签页 */
const activeKey = ref('1');
/** 搜索引擎标签 */
const engineKey = ref(config.scriptSearchEngines[0].name);
/** 搜索值 */
const searchValue = ref('');

function onSearch(value: string) {
	// 清空列表

	engineSearchList.value.forEach(async (item) => {
		item.loading = true;
		item.error = false;
		try {
			const commonScripts = await item.engine.search(value, 1, 10);
			console.log('commonScripts', commonScripts);

			item.list = commonScripts.map((s) => ({
				id: s.id,
				url: s.code_url,
				runAtAll: true,
				runAtFiles: [],
				info: s
			}));
		} catch (err) {
			console.log(err);
			item.error = true;
		}
		item.loading = false;
	});
}

function onAddScript(script: StoreUserScript) {
	store.userScripts.push(script);
}

function onRemoveScript(script: StoreUserScript) {
	store.userScripts.splice(store.userScripts.indexOf(script), 1);
}
</script>

<style scoped lang="less">
.actions {
	div + div {
		margin-left: 4px;
	}
}

.user-script-action {
	box-shadow: 0px 2px 4px rgb(203, 203, 203);
}

.user-script-action + .user-script-action {
	margin-top: 4px;
}
</style>
