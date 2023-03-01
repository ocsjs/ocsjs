<template>
	<div class="title ps-2">
		<span>
			<img
				width="18"
				class="me-3"
				src="../../public/favicon.png"
			/>
		</span>
		<a-dropdown
			class="tittle-dropdown"
			position="bl"
			trigger="hover"
			:popup-max-height="false"
		>
			<span class="title-item"> 工具 </span>
			<template #content>
				<a-doption style="width: 200px"> </a-doption>

				<a-doption @click="exportData"> 导出数据 </a-doption>
				<a-doption
					class="border-bottom"
					@click="importData"
				>
					导入数据
				</a-doption>

				<a-doption @click="store.render.state.setup = true"> 初始化设置 </a-doption>
				<a-doption @click="relaunch"> 重启软件 </a-doption>
				<a-doption @click="openLog"> 日志目录 </a-doption>
				<a-doption @click="openDevTools"> 开发者工具 </a-doption>
				<a-doption @click="reset"> 重置软件设置 </a-doption>
			</template>
		</a-dropdown>
		<a-dropdown
			class="tittle-dropdown"
			position="bl"
			trigger="hover"
			:popup-max-height="false"
		>
			<span
				class="title-item"
				@mousedown="mousedown"
			>
				编辑
			</span>
			<template #content>
				<a-doption style="width: 200px"> </a-doption>

				<a-doption
					class="w-100"
					@mousedown="mousedown"
					@click="exec('copy')"
				>
					<a-row>
						<a-col flex="20px"> 复制 </a-col>
						<a-col
							flex="auto"
							class="text-end"
						>
							Ctrl + C
						</a-col>
					</a-row>
				</a-doption>
				<a-doption
					@mousedown="mousedown"
					@click="exec('cut')"
				>
					<a-row>
						<a-col flex="20px"> 剪切 </a-col>
						<a-col
							flex="auto"
							class="text-end"
						>
							Ctrl + X
						</a-col>
					</a-row>
				</a-doption>
				<a-doption
					@mousedown="mousedown"
					@click="exec('paste')"
				>
					<a-row>
						<a-col flex="20px"> 粘贴 </a-col>
						<a-col
							flex="auto"
							class="text-end"
						>
							Ctrl + V
						</a-col>
					</a-row>
				</a-doption>
				<a-doption
					@mousedown="mousedown"
					@click="exec('undo')"
				>
					<a-row>
						<a-col flex="20px"> 上一步 </a-col>
						<a-col
							flex="auto"
							class="text-end"
						>
							Ctrl + Z
						</a-col>
					</a-row>
				</a-doption>
				<a-doption
					@mousedown="mousedown"
					@click="exec('redo')"
				>
					<a-row>
						<a-col flex="20px"> 下一步 </a-col>
						<a-col
							flex="auto"
							class="text-end"
						>
							Ctrl + Y
						</a-col>
					</a-row>
				</a-doption>
			</template>
		</a-dropdown>

		<a-dropdown
			class="tittle-dropdown"
			position="bl"
			trigger="hover"
			:popup-max-height="false"
		>
			<span class="title-item"> 帮助 </span>
			<template #content>
				<a-doption
					style="width: 200px"
					@click="about"
				>
					使用教程
				</a-doption>
				<a-doption @click="allNotify"> 查看通知 </a-doption>

				<TitleLink
					title="软件官网"
					url="https://docs.ocsjs.com/"
				/>
				<TitleLink
					title="其他版本"
					url="https://docs.ocsjs.com/docs/资源下载/app-downloads"
				/>
			</template>
		</a-dropdown>
	</div>
</template>

<script setup lang="ts">
import { fetchRemoteNotify, date, about } from '../utils';
import { remote } from '../utils/remote';
import TitleLink from './TitleLink.vue';
import { Message, Modal } from '@arco-design/web-vue';
import { store } from '../store/index';
import { electron } from '../utils/node';
import { currentBrowser, currentFolder, currentEntities, currentSearchedEntities } from '../fs/index';
import { root } from '../fs/folder';
import { h } from 'vue';

const { shell } = electron;

function exec(id: string) {
	if (typeof window === 'undefined') {
		return remote.webContents.call(id as any);
	} else {
		return document.execCommand(id);
	}
}

// 重启
function relaunch() {
	remote.app.call('relaunch');
	remote.app.call('quit');
}

// 打开日志目录
async function openLog() {
	const path = await remote.path.call('join', await remote.app.call('getPath', 'logs'), date(Date.now()));
	shell.openPath(path);
}

// 显示全部通知
function allNotify() {
	fetchRemoteNotify(true);
}

function importData() {
	remote.dialog
		.call('showOpenDialog', {
			title: '选择导入的数据文件',
			buttonLabel: '导入',
			filters: [{ extensions: ['ocsdata'], name: 'ocsdata' }]
		})
		.then(async ({ canceled, filePaths }) => {
			if (canceled === false && filePaths.length) {
				try {
					const text = await remote.fs.call('readFileSync', filePaths[0], { encoding: 'utf8' });
					JSON.parse(text.toString());
					await remote.fs.call('copyFileSync', filePaths[0], store.paths['config-path']);

					Modal.success({
						title: '导入成功',
						content: () =>
							h('div', [
								'数据重启软件后生效。',
								'如果您是导入其他电脑的OCS数据，请注意导入后重新初始化设置，或者自行重新安装脚本管理器。'
							]),
						okText: '重启软件',
						cancelText: '稍后重启',
						hideCancel: false,
						simple: false,
						onOk() {
							remote.app.call('relaunch');
							remote.app.call('exit', 0);
						}
					});
				} catch (err) {
					Message.error('数据有误! : ' + err);
				}
			}
		});
}
function exportData() {
	remote.dialog
		.call('showSaveDialog', {
			title: '选择导出位置',
			buttonLabel: '导出',
			defaultPath: `config-${date(Date.now())}`
		})
		.then(async ({ canceled, filePath }) => {
			if (canceled === false && filePath) {
				await remote.fs.call('copyFileSync', store.paths['config-path'], filePath + '.ocsdata');
				Message.success('导出成功！');
			}
		});
}

function mousedown(e: MouseEvent) {
	e.preventDefault();
}

function openDevTools() {
	// @ts-ignore
	window.ocs = {
		currentBrowser,
		currentEntities,
		currentFolder,
		currentSearchedEntities,
		root,
		store
	};

	remote.webContents.call('openDevTools');
}

/** 重置设置 */
function reset() {
	// @ts-ignore
	store.version = undefined;
	remote.app.call('relaunch');
	remote.app.call('exit', 0);
}
</script>

<style scoped lang="less">
.title {
	-webkit-app-region: drag;
	width: 100%;
	display: flex;
	align-items: center;
	/** 系统自带控件高度为 32 */
	height: 32px;
	cursor: default;
	border-bottom: 1px solid #f3f3f3;

	z-index: 999999;
	position: relative;
	background-color: white;

	.title-item {
		-webkit-app-region: no-drag;
		padding: 0px 8px;
		font-size: 14px;
		cursor: pointer;

		&:hover {
			background-color: #f0f0f0;
		}
	}
}
:deep(.ant-dropdown-menu-item) {
	font-size: 12px;
	padding: 2px 24px 2px 12px;
}

:deep(.arco-dropdown-option-content) {
	width: 100%;
	display: block;
}

.tutorial-tooltip {
	padding: 8px 12px 0px 12px !important;
}

.logo {
	width: 18px;
}
</style>
