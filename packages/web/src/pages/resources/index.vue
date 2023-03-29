<template>
	<div class="p-3">
		<div class="text-secondary markdown mb-2">
			以下是官方提供的资源软件，你可以安装以下使你的浏览器具备更多的功能。<br />
			<code>用户脚本管理器</code> 只能安装一个，否则可能造成脚本之间的冲突。
		</div>

		<div class="mb-2">
			<a-button
				size="mini"
				@click="electron.shell.openPath(store.paths.downloadFolder)"
			>
				打开资源文件夹
			</a-button>
		</div>

		<template v-if="resourceGroups.length === 0">
			<a-empty description="暂无资源" />
		</template>

		<template
			v-for="(group, index) of resourceGroups"
			:key="index"
		>
			<a-card
				:title="group.description"
				class="rounded mb-3"
			>
				<!-- 列出所有资源 -->
				<template
					v-for="(file, i) of group.files"
					:key="i"
				>
					<a-row class="mb-2 align-items-center">
						<a-col flex="48px">
							<template v-if="file.icon">
								<img
									width="32"
									height="32"
									:src="file.icon"
								/>
							</template>
							<template v-else>
								<div class="d-flex align-items-center">
									<Icon
										class="fs-1"
										type="grid_4x4"
									></Icon>
								</div>
							</template>
						</a-col>
						<a-col flex="auto">
							<a-space>
								<!-- 显示名字，主页，描述 -->
								<a
									v-if="file.homepage"
									:href="file.homepage"
									target="_blank"
								>
									{{ file.name }}
								</a>
								<span v-else>
									{{ file.name }}
								</span>

								<span v-if="file.description">
									<!-- 如果超出一行，就显示省略号 -->
									<template v-if="file.description.length > 50">
										<a-tooltip :content="file.description">
											<span>{{ file.description.slice(0, 50) }}...</span>
										</a-tooltip>
									</template>
									<template v-else> {{ file.description }} </template>
								</span>
							</a-space>
						</a-col>
						<a-col
							v-if="fileStatus[file.url]"
							flex="64px"
						>
							<a-space>
								<template v-if="fileStatus[file.url].exists || fileStatus[file.url].downloadRate === 100">
									<a-button
										size="medium"
										type="outline"
										status="danger"
										@click="remove(group.name, file)"
									>
										卸载
									</a-button>
								</template>

								<template v-else>
									<template v-if="fileStatus[file.url].downloadRate !== 0">
										<a-progress
											size="mini"
											status="normal"
											:percent="fileStatus[file.url].downloadRate"
										/>
									</template>
									<template v-else-if="fileStatus[file.url].unzipping">
										<span> 解压中... </span>
									</template>
									<template v-else>
										<a-button
											size="medium"
											type="outline"
											@click="download(group.name, file)"
										>
											安装
										</a-button>
									</template>
								</template>
							</a-space>
						</a-col>
					</a-row>
				</template>
			</a-card>
		</template>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { OCSApi, ResourceFile, ResourceGroup } from '../../utils/apis';
import { resourceLoader } from '../../utils/resources.loader';
import Icon from '../../components/Icon.vue';
import { store } from '../../store/index';
import { Message } from '@arco-design/web-vue';
import { electron } from '../../utils/node';

const { ipcRenderer } = electron;

type FileState = Record<string, { exists: boolean; downloading: boolean; unzipping: boolean; downloadRate: number }>;

const resourceGroups = ref<ResourceGroup[]>([]);
const fileStatus = reactive<FileState>({});

OCSApi.getInfos().then(async (result) => {
	resourceGroups.value = result.resourceGroups.filter((g) => g.showInResourcePage);

	// 加载状态
	for (const group of result.resourceGroups) {
		for (const file of group.files) {
			fileStatus[file.url] = {
				exists: resourceLoader.isZipFile(file)
					? await resourceLoader.isZipFileExists(group.name, file)
					: await resourceLoader.isExists(group.name, file),
				downloading: false,
				unzipping: false,
				downloadRate: 0
			};
		}
	}
});

async function download(group_name: string, file: ResourceFile) {
	// 如果group分组是 extensions 只能安装一个
	if (group_name === 'extensions') {
		const group = resourceGroups.value.filter((g) => g.name === 'extensions');
		if (group[0].files.some((f) => fileStatus[f.url].exists)) {
			Message.warning('脚本管理器只能安装一个。如需切换请把另外的删除后再安装。');
			return;
		}
	}

	const listener = (e: any, channel: string, rate: number) => {
		fileStatus[file.url].downloadRate = rate;
	};

	// 监听下载进度
	ipcRenderer.on('download', listener);
	try {
		fileStatus[file.url].downloading = true;
		await resourceLoader.download(group_name, file);
		fileStatus[file.url].downloading = false;
		fileStatus[file.url].downloadRate = 0;

		if (resourceLoader.isZipFile(file)) {
			fileStatus[file.url].unzipping = true;
			await resourceLoader.unzip(group_name, file);
			fileStatus[file.url].unzipping = false;
		}

		fileStatus[file.url].exists = true;
	} catch (err) {
		// @ts-ignore
		Message.error('下载错误 ' + err.message);
	}
	Message.success(`${file.name} 下载完成`);
	ipcRenderer.removeListener('download', listener);
}

async function remove(group_name: string, file: ResourceFile) {
	try {
		await resourceLoader.remove(group_name, file);
		fileStatus[file.url].exists = false;
	} catch (err) {
		// @ts-ignore
		Message.error('删除错误 ' + err.message);
	}
}
</script>

<style scoped lang="less"></style>
