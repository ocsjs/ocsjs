<template>
	<div class="col-12 p-2 m-auto">
		<div class="text-secondary markdown mb-2">
			启动浏览器后将会自动 <code>加载/更新</code> 以下脚本到浏览器，如果不想开启自动加载/更新，可以关闭。
		</div>

		<div class="mb-2">
			<a-space>
				<div>
					<label for="local-file">
						<a-button
							size="mini"
							@click="selectScriptFile"
						>
							+ 添加本地脚本
						</a-button>
					</label>
					<input
						id="local-file"
						style="display: none"
						name="local-file"
						type="file"
						accept=".js"
						@change="addScriptFromFile"
					/>
				</div>
				<a-button
					size="mini"
					@click="enableAll"
				>
					全部开启加载
				</a-button>
				<a-button
					size="mini"
					@click="closeAll"
				>
					全部关闭加载
				</a-button>
			</a-space>
		</div>

		<a-tabs
			v-model:activeKey="activeKey"
			class="h-100"
		>
			<a-tab-pane
				key="web"
				title="脚本列表"
			>
				<div v-if="store.render.scripts.length === 0">
					<a-empty description="暂无数据, 请在上方“搜索脚本”中选择喜欢的脚本进行添加哦~" />
				</div>
				<div
					v-else
					class="p-2"
				>
					<ScriptList :scripts="store.render.scripts">
						<template #infos="{ script }">
							<a-tooltip>
								<template #content>
									<a-descriptions
										size="mini"
										:label-style="{ color: 'white', verticalAlign: 'top' }"
										:value-style="{ color: 'white' }"
										:column="1"
									>
										<a-descriptions-item label="脚本名"> {{ script.info?.name || '' }} </a-descriptions-item>
										<a-descriptions-item label="脚本简介"> {{ script.info?.description || '' }}</a-descriptions-item>
										<a-descriptions-item
											v-if="script.info?.url"
											label="脚本主页"
										>
											<template v-if="script.info.url.startsWith('http')">
												<a :href="script.info?.url || ''"> {{ script.info?.url || '' }} </a>
											</template>
											<template v-else>
												<div
													style="text-decoration: underline; cursor: pointer"
													@click="shell.showItemInFolder(script.info!.url)"
												>
													{{ script.info?.url }}
												</div>
											</template>
										</a-descriptions-item>
										<a-descriptions-item label="脚本地址"> {{ script.url || '' }}</a-descriptions-item>
										<a-descriptions-item label="id"> {{ script.id || '' }} </a-descriptions-item>
									</a-descriptions>
								</template>
								<a-tag>
									<Icon type="info" />
								</a-tag>
							</a-tooltip>

							<a-tooltip
								v-if="script.isLocalScript"
								content="当前脚本处于您计算机本地，因此不能实时获取网络数据进行更新，但软件依然会尝试重复加载以保证您的文件修改后的代码仍能同步到浏览器中。"
							>
								<a-tag> 本地脚本 </a-tag>
							</a-tooltip>

							<a-tooltip content="来源网站">
								<a-tag>
									{{ getSearchEngine(script.url)?.name || '未知来源' }}
								</a-tag>
							</a-tooltip>
						</template>

						<template #actions="{ script }">
							<a-tooltip content="移除脚本">
								<a-popconfirm @ok="onRemoveScript(script)">
									<template #content>
										<div>删除后将不能恢复数据！</div>
										<div>请您记住此脚本名，方便后续查找。</div>
									</template>
									<a-button
										size="small"
										status="danger"
										class="user-script-action"
									>
										<Icon type="delete" />
									</a-button>
								</a-popconfirm>
							</a-tooltip>

							<a-tooltip :content="script.enable ? '关闭脚本自动加载' : '开启脚本自动加载'">
								<a-button
									size="small"
									:type="script.enable ? 'outline' : undefined"
									class="user-script-action"
									style="background: white"
									@click="script.enable = !script.enable"
								>
									<Icon :type="script.enable ? 'pause' : 'play_circle_outline'" />
								</a-button>
							</a-tooltip>
						</template>
					</ScriptList>
				</div>
			</a-tab-pane>
			<a-tab-pane
				key="search"
				title="脚本搜索"
			>
				<div class="user-script-page">
					<div class="col-12 actions d-flex">
						<a-input-search
							v-model:value="searchValue"
							placeholder="输入脚本名进行搜索"
							search-button
							@change="onSearch"
						/>
					</div>

					<div class="col-12">
						<a-tabs v-model:activeKey="engineKey">
							<a-tab-pane
								v-for="item of engineSearchList"
								:key="item.engine.name"
								:title="item.engine.name"
							>
								<div v-if="item.loading">
									<a-skeleton animation>
										<a-skeleton-line :rows="3" />
									</a-skeleton>
								</div>
								<div v-else-if="item.error">
									<a-empty description="请求出错，可能是服务器问题，或者网络问题，请重新尝试。" />
								</div>
								<div v-else-if="item.list.length === 0">
									<a-empty description="暂无数据" />
								</div>
								<div
									v-else
									class="user-script-list p-2"
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
										<template #actions="data">
											<a-button
												size="small"
												class="user-script-action"
												:disabled="data.alreadyInstalled"
												:type="data.alreadyInstalled ? undefined : 'outline'"
												@click="onAddScript(data.script)"
											>
												<Icon type="add" /> {{ data.alreadyInstalled ? '已添加' : '添加' }}
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
import Icon from '../../components/Icon.vue';
import { addScriptFromFile } from '../../utils/user-scripts';
import { electron } from '../../utils/node';

const { shell } = electron;

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
const activeKey = ref('web');
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

			item.list = commonScripts.map((s) => ({
				id: s.id,
				url: s.code_url,
				enable: true,
				info: s,
				isLocalScript: false
			}));
		} catch (err) {
			console.log(err);
			item.list = [];
			item.error = true;
		}
		item.loading = false;
	});
}

function onAddScript(script: StoreUserScript) {
	store.render.scripts.push(script);
}

function onRemoveScript(script: StoreUserScript) {
	store.render.scripts.splice(store.render.scripts.indexOf(script), 1);
}

function selectScriptFile() {
	// @ts-ignore
	document.querySelector('#local-file').click();
}

function enableAll() {
	store.render.scripts.forEach((val) => {
		val.enable = true;
	});
}
function closeAll() {
	store.render.scripts.forEach((val) => {
		val.enable = false;
	});
}

/** 判断脚本来源 */
function getSearchEngine(url: string) {
	return config.scriptSearchEngines.find((e) => new URL(e.homepage).host === new URL(url).host);
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

.dis {
	color: white !important;
}
</style>
