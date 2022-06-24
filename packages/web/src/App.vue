<template>
	<div class="row h-100 w-100 p-0 m-0">
		<div class="col-auto border-end sider h-100">
			<div class="sider-items">
				<template
					v-for="(item, index) in routes"
					:key="index"
				>
					<div
						class="sider-item"
						@click="router.push(item.path)"
					>
						<Tutorial
							:show-help="store.state.tutorial && store.tutorialStep === item.meta.tutorial.step"
							:content="(item.meta.tutorial.tooltip as string)"
							:placement="item.meta.tutorial.placement"
							@click="nextTutorialStep"
						>
							<a-tooltip
								:title="item.meta.title"
								placement="right"
							>
								<Icon
									class="icon"
									:type="(((item.path === currentRoute.path && item.meta.filledIcon) 
							? item.meta.filledIcon : item.meta.icon) as string)"
								/>
							</a-tooltip>
						</Tutorial>
					</div>
				</template>
			</div>

			<div class="text-secondary version">
				{{ store.version }}
			</div>
		</div>
		<div class="col p-0 m-0">
			<div class="row main h-100 w-100 p-0 m-0">
				<div class="col-12 p-0 m-0"><Title id="title" /></div>
				<div class="col-12 p-0 m-0 overflow-auto">
					<Index />
				</div>
			</div>
		</div>

		<div
			v-if="store.state.tutorial"
			class="tutorial"
		></div>
	</div>
</template>

<script
	setup
	lang="ts"
>
import { nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import Title from './components/Title.vue';
import Index from './pages/index.vue';
import { router, routes } from './route';
import {
	initTheme,
	initOpenedFiles,
	handleOpenedFile,
	initStoreData,
	setAlwaysOnTop,
	setAutoLaunch,
	setZoomFactor,
	store,
	nextTutorialStep
} from './store';
import { fetchRemoteNotify } from './utils';
import { notify } from './utils/notify';
import { remote } from './utils/remote';
import Icon from './components/Icon.vue';
import Tutorial from './components/Tutorial.vue';
import { NodeJS } from './utils/export';

const { ipcRenderer } = require('electron');

// 当前路由
const currentRoute = useRouter().currentRoute;

// @ts-ignore
window.electron = require('electron');
// @ts-ignore
window.store = store;
// @ts-ignore
window.remote = remote;
// @ts-ignore
window.NodeJS = NodeJS;

onMounted(() => {
	nextTick(() => {
		/** 获取最新远程通知 */
		fetchRemoteNotify(false);

		/** 如果正在更新的话，获取更新进度 */
		ipcRenderer.on('download', (e, channel, rate, totalLength, chunkLength) => {
			if (channel === 'update') {
				notify(
					'OCS更新程序',
					`更新中: ${(chunkLength / 1024 / 1024).toFixed(2)}MB/${(totalLength / 1024 / 1024).toFixed(2)}MB`,
					'updater',
					{ type: 'info', duration: 5, close: false }
				);
			}
		});

		/** 初始化 store */

		remote.logger.call('info', 'render store init');
		setZoomFactor();
		setAutoLaunch();
		setAlwaysOnTop();
		initOpenedFiles();
		initStoreData();
		initTheme();

		ipcRenderer.on('open-file', (e, file) => {
			handleOpenedFile(file);
		});
	});
});

onUnmounted(() => {
	// 删除监听器
	ipcRenderer.removeAllListeners('download');
});
</script>

<style lang="less">
@import '@/assets/css/bootstrap.min.css';
@import '@/assets/css/common.css';

.main {
	display: grid;
	grid-template-rows: 24px calc(100vh - 24px);
	grid-template-areas:
		'header'
		'main ';
}

.sider {
	-webkit-app-region: no-drag;
	width: 48px;
	padding: 4px;
	text-align: center;
	.sider-items {
		.sider-item {
			margin-top: 8px;
		}

		.icon {
			width: 28px;
			height: 28px;
			font-size: 28px;
		}
	}

	.version {
		font-size: 12px;
		position: absolute;
		bottom: 0px;
	}
}

.ant-modal-confirm .ant-modal-body {
	padding: 12px !important;
}

/* 新手教程遮罩层 */
.tutorial {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: #00000030;
	z-index: 100;
	top: 0;
	left: 0;
}
</style>
