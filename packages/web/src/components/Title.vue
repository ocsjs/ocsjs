<template>
	<div class="title border-bottom">
		<ul class="w-100 title-items">
			<a-dropdown>
				<li>窗口</li>

				<template #overlay>
					<a-menu class="title-menu">
						<a-menu-item @click="remote.webContents.call('openDevTools')"> 开发者工具 </a-menu-item>
						<a-menu-item @click="openLog"> 打开日志目录 </a-menu-item>

						<a-menu-divider />

						<a-menu-item @click="remote.webContents.call('reload')"> 重新加载 </a-menu-item>
						<a-menu-item @click="relaunch"> 重新启动 </a-menu-item>

						<a-menu-divider />

						<a-menu-item @click="remote.win.call('maximize')"> 最大化 </a-menu-item>
						<a-menu-item @click="remote.win.call('minimize')"> 最小化 </a-menu-item>
						<a-menu-item @click="remote.win.call('restore')"> 还原 </a-menu-item>
						<a-menu-item @click="remote.win.call('close')"> 关闭 </a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>

			<a-dropdown>
				<li>帮助</li>

				<template #overlay>
					<a-menu>
						<a-menu-item @click="about"> 关于软件 </a-menu-item>
						<TitleLink
							title="官网教程"
							url="https://docs.ocsjs.com/"
						/>
						<a-menu-item @click="allNotify"> 全部通知 </a-menu-item>

						<TitleLink
							title="软件更新"
							url="https://docs.ocsjs.com/docs/资源下载/app-downloads"
						/>
					</a-menu>
				</template>
			</a-dropdown>
		</ul>
		<ul
			v-if="NodeJS.os.platform() !== 'darwin'"
			class="traffic-light"
			@mouseenter="initMaximize()"
		>
			<li
				title="最小化"
				@click="remote.win.call('minimize')"
			>
				<Icon type="icon-minus" />
			</li>
			<li
				:title="max ? '还原' : '最大化'"
				@click="max = !max"
			>
				<Icon :type="max ? 'icon-Batchfolding' : 'icon-border'" />
			</li>
			<li
				title="关闭"
				@click="remote.win.call('close')"
			>
				<Icon type="icon-close" />
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { Modal } from 'ant-design-vue';
import { h, nextTick, onMounted, ref, watch } from 'vue';
import { fetchRemoteNotify, date } from '../utils';
import { NodeJS } from '../utils/export';
import { remote } from '../utils/remote';
import TitleLink from './TitleLink.vue';

const { shell } = require('electron');

const max = ref<boolean>(false);

onMounted(() => {
	nextTick(() => initMaximize());
});

watch(max, () => {
	if (max.value) {
		remote.win.call('maximize');
	} else {
		remote.win.call('restore');
	}
});

// 重启
function relaunch() {
	remote.app.call('relaunch');
	remote.app.call('quit');
}

// 打开日志目录
async function openLog() {
	shell.openPath(NodeJS.path.join(await remote.app.call('getPath', 'logs'), date(Date.now())));
}

// 显示全部通知
function allNotify() {
	fetchRemoteNotify(true);
}

// 显示关于面板
async function about() {
	Modal.info({
		title: '关于',
		closable: true,
		maskClosable: true,
		content: h('ul', [
			h('li', '软件版本 : ' + (await remote.app.call('getVersion'))),
			h('li', [
				h('span', '版本详情 : '),
				h(
					'a',
					{
						href: '#',
						onClick: () => shell.openExternal('https://docs.ocsjs.com/docs/资源下载/app-downloads')
					},
					'https://docs.ocsjs.com/docs/资源下载/app-downloads'
				)
			])
		])
	});
}

// 初始化状态
async function initMaximize() {
	max.value = await remote.win.call('isMaximized');
}
</script>

<style scoped lang="less">
.title {
	width: 100%;
	display: flex;
	align-items: center;

	.traffic-light {
		display: flex;
		justify-content: end;
		-webkit-app-region: drag;

		.ocsicon {
			font-size: 14px;
			padding: 0px 4px 0px 4px;
		}
	}

	.title-items {
		display: flex;
		-webkit-app-region: drag;
	}

	ul {
		white-space: nowrap;
		list-style-type: none;
		padding: 0;
		margin: 0;
		height: 100%;

		li {
			display: inline-flex;
			align-items: center;
			font-size: 14px;
			padding: 0px 8px;
			color: gray;
			cursor: pointer;
			border-radius: 2px;
			-webkit-app-region: no-drag;
		}

		li.active {
			font-weight: bold;
		}
	}
}
:deep(.ant-dropdown-menu-item) {
	font-size: 12px;
	padding: 2px 24px 2px 12px;
}

.tutorial-tooltip {
	padding: 8px 12px 0px 12px !important;
}

.logo {
	width: 18px;
}
</style>
