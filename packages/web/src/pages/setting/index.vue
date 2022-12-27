<template>
	<div class="w-100">
		<div class="setting text-center p-2 col-12 col-md-10 col-lg-8">
			<Card title="基本设置">
				<Description label="开机自启">
					<a-switch
						v-model:checked="store['auto-launch']"
						size="small"
					/>
				</Description>

				<Description label="窗口置顶">
					<a-switch
						v-model:checked="store.setting.window.alwaysOnTop"
						size="small"
					/>
				</Description>
				<Description label="主题">
					<a-select
						v-model:value="themeName"
						size="small"
					>
						<a-select-option
							v-for="(theme, index) of config.themes"
							:key="index"
							:value="theme.name"
						>
							{{ theme.name }}
						</a-select-option>
					</a-select>
				</Description>

				<Description label="窗口大小">
					<a-input-number
						v-model:value="store.setting.window.zoom"
						size="small"
						:step="0.1"
						:min="0"
						:max="10"
					/>
				</Description>
			</Card>

			<Card title="默认设置">
				<Description label="指定浏览器">
					<a-select
						v-model:value="selectedPath"
						:title="launchOptions.executablePath"
						size="small"
						class="w-100"
					>
						<template
							v-for="(browser, index) in store.validBrowsers"
							:key="index"
						>
							<a-select-option :value="browser.path">
								{{ browser.name }}
							</a-select-option>
						</template>
						<a-select-option
							key="diy"
							value="diy"
						>
							自定义浏览器
						</a-select-option>
					</a-select>
				</Description>
				<Description
					v-if="selectedPath === 'diy'"
					label="自定义浏览器路径"
				>
					<a-input
						v-model:value="launchOptions.executablePath"
						size="small"
						class="w-100"
						@blur="onDiy"
					>
						<template #suffix>
							<a-popover>
								<template #title>
									<b>浏览器路径获取方式</b>
								</template>
								<template #content>
									<div>
										<b>谷歌浏览器</b> : 打开谷歌浏览器 <br />
										访问
										<b>chrome://version</b> 找到 <b>可执行文件路径</b> 复制粘贴即可
									</div>
									<div>
										<b>Edge浏览器</b> : 打开Edge浏览器<br />
										访问
										<b>edge://version</b> 找到 <b>可执行文件路径</b> 复制粘贴即可
									</div>
								</template>

								<Icon type="icon-question-circle" />
							</a-popover>
						</template>
					</a-input>
				</Description>
			</Card>

			<Card title="路径设置">
				<Path
					label="浏览器缓存"
					name="userDataDirsFolder"
					:setting="true"
				/>
				<Path
					label="浏览器拓展"
					name="extensionsPath"
					:setting="true"
				/>
				<Path
					label="配置文件"
					name="config-path"
				/>
			</Card>

			<div class="mt-4">
				<a-popconfirm
					title="确认重置您的设置，并重新启动软件吗？"
					ok-text="确认"
					cancel-text="取消"
					@confirm="reset"
				>
					<a-button
						shape="round"
						size="small"
						danger
					>
						重置设置
					</a-button>
				</a-popconfirm>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue';
import { nextTick, onMounted, ref, watch } from 'vue';
import Card from '../../components/Card.vue';
import Description from '../../components/Description.vue';
import Path from '../../components/Path.vue';
import { store } from '../../store';
import { remote } from '../../utils/remote';
import { NodeJS } from '../../utils/export';
import { config } from '../../config';

/** 主题名字 */
const themeName = ref(store.setting.theme.name);
/** 更新主题 */
watch(themeName, () => {
	const theme = config.themes.find((t) => t.name === themeName.value);
	if (theme) {
		store.setting.theme = theme;
	}
});

/** 选择的浏览器路径 */
const selectedPath = ref('diy');
const launchOptions = store.setting.launchOptions;

/**
 * 监听浏览器类型变化
 */
watch(selectedPath, () => {
	launchOptions.executablePath = selectedPath.value === 'diy' ? '' : selectedPath.value;
});

/**
 * 监听自定义浏览器编辑
 */
function onDiy() {
	if (launchOptions.executablePath && !NodeJS.fs.existsSync(launchOptions.executablePath)) {
		message.error('自定义的浏览器路径不存在, 请点击右侧按钮查看教程。');
	}
}

/** 如果尚未选择，并且没有自定义路径的话，自动选择第一个 */
onMounted(() => {
	nextTick(() => {
		console.log('可用浏览器', store.validBrowsers);

		if (store.validBrowsers.length !== 0 && launchOptions.executablePath === '') {
			if (store.validBrowsers[0].path) {
				launchOptions.executablePath = store.validBrowsers[0].path;
			}
		}

		selectedPath.value =
			store.validBrowsers.find((browser) => browser.path === launchOptions.executablePath)?.path || 'diy';
	});
});

/** 重置设置 */
function reset() {
	// @ts-ignore
	store.version = undefined;
	remote.app.call('relaunch');
	remote.app.call('exit', 0);
}
</script>

<style scoped lang="less">
.setting {
	margin: 0 auto;
	min-height: 500px;
}
</style>
