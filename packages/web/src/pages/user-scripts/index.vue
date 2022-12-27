<template>
	<div class="col-12 ps-3 pe-3 m-auto">
		<a-tabs
			v-model:activeKey="activeKey"
			class="h-100"
		>
			<a-tab-pane
				key="web"
				tab="脚本列表"
			>
				<div v-if="store.scripts.length === 0">
					<a-empty description="暂无数据, 请在上方“搜索脚本”中选择喜欢的脚本进行添加哦~" />
				</div>
				<div
					v-else
					class="p-2"
				>
					<p class="text-secondary markdown">
						启动浏览器后将会自动 <code>安装/更新</code> 以下脚本到浏览器。
						<label for="local-file">
							<span style="color: #1890ff; cursor: pointer"> + 添加本地脚本</span>
						</label>
						<input
							style="display: none"
							id="local-file"
							name="local-file"
							type="file"
							accept=".js"
							@change="addLocalScript"
						/>
					</p>

					<ScriptList :scripts="store.scripts">
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

							<a-tooltip :title="script.enable ? '关闭脚本自动安装' : '开启脚本自动安装'">
								<a-button
									size="small"
									:type="script.enable ? 'primary' : 'default'"
									class="user-script-action"
									@click="script.enable = !script.enable"
								>
									<Icon :type="script.enable ? 'icon-timeout' : 'icon-play-circle'" />
								</a-button>
							</a-tooltip>
						</template>
					</ScriptList>
				</div>
			</a-tab-pane>
			<a-tab-pane
				key="search"
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
import { message } from 'ant-design-vue';
import { ref } from 'vue';

import { config } from '../../config';
import { store, StoreUserScript } from '../../store';
import { ScriptSearchEngine } from '../../types/search';
import { NodeJS } from '../../utils/export';
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
			console.log('commonScripts', commonScripts);

			item.list = commonScripts.map((s) => ({
				id: s.id,
				url: s.code_url,
				enable: true,
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
	store.scripts.push(script);
}

function onRemoveScript(script: StoreUserScript) {
	store.scripts.splice(store.scripts.indexOf(script), 1);
}

/**
 * 添加并且解析本地脚本
 */
function addLocalScript(e: any) {
	const file = e.target.files[0] as File;
	if (file.path.endsWith('.user.js')) {
		NodeJS.fs.stat(file.path, (err, stat) => {
			if (err === null) {
				NodeJS.fs.readFile(file.path, (err, buffer) => {
					if (err === null) {
						const metadata =
							buffer.toString().match(/\/\/\s+==UserScript==([\s\S]+)\/\/\s+==\/UserScript==/)?.[1] || '';
						// 解析函数
						const getMetadata = (key: string) => {
							const reg = `//\\s+\\@${key}\\s+(.*?)\\n`;
							return (
								metadata
									.match(RegExp(reg, 'g'))
									?.map((line) => line.match(RegExp(reg))?.[1] || '')
									.filter((line) => !!line) || []
							);
						};

						if (metadata === '') {
							message.error('脚本格式不正确，请选择能够解析的用户脚本。');
						} else {
							const id = Date.now();
							store.scripts.push({
								id,
								url: file.path,
								enable: true,
								info: {
									id,
									url: file.path,
									authors: getMetadata('author').map((a) => ({ name: a, url: '' })) || [],
									description: getMetadata('description')[0],
									license: getMetadata('license')[0],
									name: '【本地脚本】' + getMetadata('name')[0],
									version: getMetadata('version')[0],
									code_url: file.path,
									ratings: 0,
									total_installs: 0,
									daily_installs: 0,
									createTime: stat.ctime.getTime(),
									updateTime: stat.mtime.getTime()
								}
							});
						}
					} else {
						message.error('文件读取失败 : ' + err.message);
					}
				});
			} else {
				message.error('文件读取失败 : ' + err.message);
			}
		});
	} else {
		message.error('用户脚本必须以 .user.js 作为文件后缀');
	}
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
