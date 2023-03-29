<template>
	<template v-if="state.finish">
		<a-result
			status="success"
			title="初始化完成"
		>
			<template #subtitle> 软件初始化已完成，您可以点击右上方的新建浏览器，进行浏览器多开（分身）体验。 </template>
			<template #extra>
				<a-button
					type="primary"
					@click="confirm"
				>
					确定
				</a-button>
			</template>
		</a-result>
	</template>

	<a-row
		v-else
		:gutter="[24, 24]"
	>
		<a-col
			class="text-secondary"
			style="font-size: 12px"
		>
			<div>
				初始化您的软件设置，如果不满意官方提供的设置，可稍后自行在软件左侧的各栏中手动设置，设置完成后即可创建浏览器进行网课学习。
			</div>
			<div>如果想重新打开此窗口： 左上角 -> 工具 -> 初始化设置</div>
		</a-col>

		<template v-if="state.loading">
			<a-col class="text-center">
				<icon-loading />
			</a-col>
		</template>
		<template v-else-if="state.error">
			<a-empty description="资源请求错误，请稍后重试。" />
		</template>
		<template v-else-if="state.downloading">
			<a-col class="text-center"> <icon-loading /> {{ state.downloading }} </a-col>
		</template>
		<template v-else>
			<a-col>
				<a-row class="flex-nowrap align-items-center">
					<a-col flex="100px">
						<a-tooltip>
							<template #content>
								<div>OCS软件需要使用浏览器进行操作，系统会自动检测您电脑上存在的浏览器</div>
								<div>如果没有，请稍后在软件左侧的设置中，设置具体路径。</div>
							</template>
							<Icon type="help_outline" />
						</a-tooltip>
						<span> 浏览器 </span>
					</a-col>
					<a-col flex="auto">
						<a-row :gutter="[0, 12]">
							<a-col>
								<a-select
									v-model="state.browser"
									placeholder="未检测到可用浏览器，请稍后在左侧软件设置中设置。"
									:disabled="state.resource.browsers.length === 0"
								>
									<a-option
										v-for="browser of state.resource.browsers"
										:key="browser.name"
										:value="browser.name"
										:label="browser.name"
									></a-option>
								</a-select>
							</a-col>
						</a-row>
					</a-col>
				</a-row>
			</a-col>
			<a-col>
				<a-row class="flex-nowrap align-items-center">
					<a-col flex="100px">
						<a-tooltip content="浏览器打开后可用使用脚本管理器进行脚本的：安装，运行，删除 等操作">
							<Icon type="help_outline" />
						</a-tooltip>
						<span> 脚本管理器 </span>
					</a-col>
					<a-col flex="auto">
						<a-select v-model="state.selectedExtension">
							<a-option
								v-for="extension of state.resource.extensions"
								:key="extension.name"
								:label="extension.name"
							></a-option>
						</a-select>
					</a-col>
				</a-row>
			</a-col>
			<a-col>
				<a-row class="flex-nowrap align-items-center">
					<a-col flex="100px">
						<a-tooltip content="安装网课脚本进行课程的观看和学习">
							<Icon type="help_outline" />
						</a-tooltip>
						<span> 网课脚本 </span>
					</a-col>
					<a-col flex="auto">
						<a-select v-model="state.selectedUserScript">
							<a-option
								v-for="userScript of state.resource.userScripts"
								:key="userScript.name"
								:label="userScript.name"
							></a-option>
						</a-select>
					</a-col>
				</a-row>
			</a-col>
		</template>

		<a-col class="text-center mt-5">
			<a-space :size="24">
				<a-button
					size="small"
					:disabled="!!state.downloading"
					@click="notNow"
				>
					稍等手动设置
				</a-button>
				<a-button
					type="primary"
					size="small"
					:disabled="state.error || !!state.downloading"
					@click="setup"
				>
					一键初始化
				</a-button>
			</a-space>
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
import { store } from '../store';
import { getRemoteInfos } from '../utils';
import { remote } from '../utils/remote';
import { onMounted, reactive } from 'vue';
import Icon from './Icon.vue';
import { Message } from '@arco-design/web-vue';
import { installExtensions } from '../utils/extension';
import { addScriptFromUrl } from '../utils/user-scripts';
import { ValidBrowser } from '@ocsjs/common/lib/src/interface';
import { ResourceLoader } from '../utils/resources.loader';
import { ResourceFile } from '../utils/apis';

type Extension = ResourceFile & { installed?: boolean };

const state = reactive({
	resource: {
		browsers: [] as ValidBrowser[],
		extensions: [] as Extension[],
		userScripts: [] as ResourceFile[]
	},
	browser: '',
	downloadPath: '',
	// 选中的拓展
	selectedExtension: '',
	// 选中的脚本
	selectedUserScript: '',
	loading: false,
	error: false,
	downloading: '',
	// 初始化完成
	finish: false
});

/** 资源加载器 */
const resourceLoader = new ResourceLoader({
	resourceRootPath: store.paths.downloadFolder
});

onMounted(async () => {
	state.loading = true;
	try {
		const infos = await getRemoteInfos();

		state.downloadPath = await remote.path.call('join', store.paths.downloadFolder);

		// 检测有效的浏览器路径
		state.resource.browsers = await remote.methods.call('getValidBrowsers');
		if (state.resource.browsers.length) {
			state.browser = state.resource.browsers[0].name;
		}

		// 获取最新的拓展和用户脚本信息
		state.resource.extensions = infos.resourceGroups.find((group) => group.name === 'extensions')?.files || [];
		state.resource.userScripts = infos.resourceGroups.find((group) => group.name === 'userjs')?.files || [];

		for (const extension of state.resource.extensions) {
			extension.installed = await resourceLoader.isZipFileExists('extensions', extension);
		}
		// 初始选中的信息
		state.selectedExtension = state.resource.extensions[0].name;
		state.selectedUserScript = state.resource.userScripts[0].name;
	} catch (err) {
		state.error = true;
		console.error(err);
		Message.error(String(err));
	} finally {
		state.loading = false;
	}
});

async function downloadExtension(extension: Extension) {
	state.downloading = `正在下载脚本管理器 : ${extension.name} ...`;
	await installExtensions(state.resource.extensions, extension);
}

async function downloadScript(userScript: ResourceFile) {
	state.downloading = `正在下载脚本 : ${userScript.name} ...`;
	await addScriptFromUrl(userScript.url);
}

function notNow() {
	store.render.state.setup = false;
}

async function setup() {
	const browser = state.resource.browsers.find((e) => e.name === state.browser);
	const extension = state.resource.extensions.find((e) => e.name === state.selectedExtension);
	const userScript = state.resource.userScripts.find((e) => e.name === state.selectedUserScript);

	if (browser && extension && userScript) {
		try {
			store.render.setting.launchOptions.executablePath = browser.path;
			await downloadScript(userScript);
			await downloadExtension(extension);
			state.finish = true;
		} catch (err) {
			Message.error('安装失败，请稍后重试，或者手动设置 : ' + err);
		}
	} else {
		Message.error('参数错误');
	}

	store.render.state.setup = false;

	setTimeout(() => {
		confirm();
	}, 10 * 1000);
}

function confirm() {
	state.downloading = '';
}
</script>

<style scoped lang="less"></style>
