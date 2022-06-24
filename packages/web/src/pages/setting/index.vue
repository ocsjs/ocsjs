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
						v-model:checked="store.win.alwaysOnTop"
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
						v-model:value="store.win.size"
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

				<Description label="默认题库设置">
					<a-input
						size="small"
						class="w-100"
						type="text"
						placeholder="请直接ctrl+cv快捷键复制粘贴, 不要一个个字输入。 教程请看右侧问号"
						:value="answererWrappers"
						@paste="onAWChange($event)"
					>
						<template #suffix>
							<a-popover>
								<template #content>
									<div><b>请直接ctrl+cv快捷键复制粘贴, 不要一个个字输入。</b></div>
									<div>
										<b>题库配置教程</b> :
										<a
											href="#"
											@click="link('https://docs.ocsjs.com/docs/work')"
											>https://docs.ocsjs.com/docs/work</a
										>
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
					label="workspace"
					name="workspace"
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
				<Path
					label="数据文件"
					name="user-data-path"
				/>
				<Path
					label="日志文件"
					name="logs-path"
				/>
				<Path
					label="可执行文件"
					name="exe-path"
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

<script
	setup
	lang="ts"
>
import { LaunchOptions } from '@ocsjs/scripts';
import { message } from 'ant-design-vue';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import Card from '../../components/Card.vue';
import Description from '../../components/Description.vue';
import Path from '../../components/Path.vue';
import { store } from '../../store';
import { remote } from '../../utils/remote';
import { NodeJS } from '../../utils/export';
import { config } from '../../config';
const { shell } = require('electron');

/** 主题名字 */
const themeName = ref(store.theme.name);
/** 更新主题 */
watch(themeName, () => {
	store.theme = config.themes.find((t) => t.name === themeName.value);
});

const launchOptions = store.script.launchOptions as LaunchOptions;

// 题库配置
const answererWrappers = computed(() =>
	store.setting.answererWrappers && store.setting.answererWrappers.length
		? JSON.stringify(store.setting.answererWrappers)
		: ''
);
/** 选择的浏览器路径 */
const selectedPath = ref('diy');

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

/**
 * 监听题库配置的变化
 */
async function onAWChange(e: ClipboardEvent) {
	// @ts-ignore
	const val = e.clipboardData.getData('text') || (await navigator.clipboard.readText());
	try {
		const aw = JSON.parse(val);
		if (typeof aw === 'object' || Array.isArray(aw)) {
			store.setting.answererWrappers = aw;
			message.success('题库配置保存成功');
		} else {
			message.error('题库配置格式错误');
			store.setting.answererWrappers = [];
		}
	} catch {
		message.error('题库配置格式错误');
		store.setting.answererWrappers = [];
	}
}

/** 如果尚未选择，并且没有自定义路径的话，自动选择第一个 */
onMounted(() => {
	nextTick(() => {
		console.log('可用浏览器', store.validBrowsers);

		if (store.validBrowsers.length !== 0 && launchOptions.executablePath === '') {
			launchOptions.executablePath = store.validBrowsers[0].path;
		}

		selectedPath.value =
			store.validBrowsers.find((browser) => browser.path === launchOptions.executablePath)?.path || 'diy';
	});
});

function link(url: string) {
	shell.openExternal(url);
}

/** 重置设置 */
function reset() {
	store.version = undefined;
	remote.app.call('relaunch');
	remote.app.call('exit', 0);
}
</script>

<style
	scoped
	lang="less"
>
.setting {
	margin: 0 auto;
	min-height: 500px;
}
</style>
