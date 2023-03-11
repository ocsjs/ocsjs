<template>
	<a-config-provider :locale="zhCN">
		<div class="row h-100 w-100 p-0 m-0">
			<div class="col p-0 m-0">
				<div class="row main h-100 w-100 p-0 m-0">
					<div class="col-12 p-0 m-0"><Title id="title" /></div>
					<div class="col-12 p-0 m-0 overflow-auto d-flex">
						<div
							style="width: 48px"
							class="h-100"
						>
							<div class="col-auto sider h-100">
								<div class="sider-items">
									<template
										v-for="(item, index) in 
									((routes.find((r) => r.name === 'index')?.children || []) as CustomRouteType[])"
										:key="index"
									>
										<div
											class="sider-item"
											@click="clickMenu(item)"
										>
											<a-tooltip
												:content="item.meta.title"
												position="right"
											>
												<Icon
													class="icon"
													:type="item.meta.icon"
													:theme="item.name === currentRoute.name ? 'filled' : 'outlined'"
												/>
											</a-tooltip>
										</div>
									</template>
								</div>

								<div class="text-secondary version mb-1">
									{{ version }}
								</div>
							</div>
						</div>
						<div style="width: calc(100% - 48px)">
							<router-view v-slot="{ Component }">
								<keep-alive>
									<component :is="Component" />
								</keep-alive>
							</router-view>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 显示当前浏览器的操作面板 -->
		<a-drawer
			v-if="currentBrowser"
			id="browser-panel"
			popup-container="#component"
			:closable="false"
			:visible="!!currentBrowser"
			:width="600"
			:footer="false"
			:header="false"
			@cancel="store.render.browser.currentBrowserUid = ''"
		>
			<BrowserPanel :browser="currentBrowser"></BrowserPanel>
		</a-drawer>

		<!-- 显示一键安装 -->
		<a-modal
			v-if="store.render.state.setup"
			:visible="true"
			:footer="false"
			:closable="false"
			:mask-closable="false"
		>
			<template #title> 初始化软件设置 </template>
			<Setup></Setup>
		</a-modal>
	</a-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { RouteRecordRaw, useRouter } from 'vue-router';
import Title from '../components/Title.vue';
import { router, routes, CustomRouteType } from '../route';
import { store } from '../store';
import { about, changeTheme, fetchRemoteNotify, setAlwaysOnTop, setAutoLaunch, sleep } from '../utils';
import { notify } from '../utils/notify';
import { remote } from '../utils/remote';
import Icon from '../components/Icon.vue';
import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
import { processes } from '../utils/process';
import { Message, Modal } from '@arco-design/web-vue';
import BrowserPanel from '../components/browsers/BrowserPanel.vue';
import { currentBrowser } from '../fs';
import { electron, inBrowser } from '../utils/node';
import Setup from '../components/Setup.vue';
import { getWindowsRelease } from '../utils/os';
import cloneDeep from 'lodash/cloneDeep';

const { ipcRenderer } = electron;
const version = ref('');

// 当前路由
const currentRoute = useRouter().currentRoute;

onUnmounted(() => closeAllBrowser(false));
ipcRenderer.on('close', () => closeAllBrowser(true));

onMounted(async () => {
	/** 设置窗口边框 */
	remote.os.call('platform').then(async (platform) => {
		if (platform === 'win32') {
			const release = await getWindowsRelease();
			if (release !== 'win11') {
				document.documentElement.classList.add('window-frame');
			}
		}
	});

	/** 检测环境 */
	// @ts-ignore
	if (inBrowser) {
		store.render.state.setup = false;
		Modal.warning({
			content: '下载桌面版软件才能体验全部功能！',
			title: '警告',
			simple: true,
			hideCancel: false,
			okText: '前往官网下载',
			onOk() {
				window.open('https://docs.ocsjs.com/docs/资源下载/app-downloads', '_blank');
			}
		});
	}

	/** 设置版本 */
	remote.app.call('getVersion').then((v) => {
		version.value = v;
	});

	/** 初始化标题 */
	remote.win.call('setTitle', `OCS - ${router.resolve(currentRoute.value).meta.title}`);

	/** 初始化 store */
	remote.logger.call('info', 'render store init');
	setAutoLaunch();
	setAlwaysOnTop();
	changeTheme();

	/** 打开关于软件 */
	if (store.render.state.first) {
		about();
	}

	/** 监听屏幕变化 */
	onResize();
	window.addEventListener('resize', onResize);

	/** 获取最新远程通知 */
	fetchRemoteNotify(false);

	/** 如果正在更新的话，获取更新进度 */
	ipcRenderer.on('update-download', (e, rate, totalLength, chunkLength) => {
		notify(
			'OCS更新程序',
			`更新中: ${(chunkLength / 1024 / 1024).toFixed(2)}MB/${(totalLength / 1024 / 1024).toFixed(2)}MB`,
			'updater',
			{
				type: 'info',
				duration: 0,
				close: false
			}
		);
	});

	/** 监听主题变化 */
	watch(
		() => cloneDeep(store.render.setting.theme),
		(cur, prev) => {
			if (cur.dark) {
				// 设置为暗黑主题
				document.body.setAttribute('arco-theme', 'dark');
			} else {
				// 恢复亮色主题
				document.body.removeAttribute('arco-theme');
			}
		}
	);

	watch(
		store,
		(newStore) => {
			if (inBrowser) {
				localStorage.setItem('ocs-app-store', JSON.stringify(newStore));
			} else {
				remote['electron-store'].set('store', JSON.parse(JSON.stringify(newStore)));
			}
		},
		{ deep: true }
	);

	watch(() => store.window.autoLaunch, setAutoLaunch);
	watch(() => store.window.alwaysOnTop, setAlwaysOnTop);

	window.onresize = () => {
		store.render.state.height = document.documentElement.clientHeight;
	};
});

onUnmounted(() => {
	// 删除监听器
	ipcRenderer.removeAllListeners('download');
});

async function closeAllBrowser(quit: boolean) {
	if (processes.length) {
		await remote.win.call('moveTop');
		Modal.warning({
			content: '还有浏览器正在运行，您确定关闭软件吗？',
			title: '警告',
			maskClosable: true,
			closable: true,
			alignCenter: true,
			hideCancel: false,
			onOk: async () => {
				const m = Modal.info({ content: '正在关闭所有浏览器...', closable: false, maskClosable: false, footer: false });

				const close = () => {
					if (quit) {
						remote.app.call('exit');
					}
					m.close();
				};

				// 最久5秒后关闭
				const timeout = setTimeout(close, 5000);
				try {
					for (const process of processes) {
						await process.close();
						await sleep(100);
					}
				} catch (err) {
					Message.error(err);
				}
				clearTimeout(timeout);
				close();
			}
		});
	} else {
		if (quit) {
			remote.app.call('exit');
		}
	}
}

function clickMenu(route: RouteRecordRaw & { meta: { title: string } }) {
	router.push(route.path);
	remote.win.call('setTitle', `OCS - ${route.meta.title}`);
}

function onResize() {
	const isInMobild = document.documentElement.clientWidth < 1200;
	store.render.state.mini = isInMobild;
	store.render.state.responsive = isInMobild ? 'mini' : 'small';
}
</script>

<style lang="less">
@import '@/assets/css/bootstrap.min.css';
@import '@/assets/css/common.css';

.main {
	display: grid;
	grid-template-rows: 32px calc(100vh - 32px);
	grid-template-areas:
		'header'
		'main ';
}

.sider {
	-webkit-app-region: no-drag;
	user-select: none;
	width: 48px;
	flex: 0 0 48px;
	padding: 4px;
	text-align: center;
	display: flex;
	justify-content: center;
	border-right: 1px solid #f3f3f3;

	.sider-items {
		padding-top: 12px;

		.sider-item + .sider-item {
			margin-top: 22px;
		}

		.icon {
			width: 28px;
			height: 28px;
			font-size: 28px;
			cursor: pointer;
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

.bp-toc {
	position: absolute;
	background: white;
	z-index: 999;
	right: 600px;

	animation-duration: 0.5s;
	animation-name: slide-in;
	animation-timing-function: ease;
	padding: 4px;
	border-radius: 8px 0px 0px 8px;
	font-size: 12px;
	top: 24px;
	color: #86909c;

	* {
		cursor: pointer;
		margin: 6px 0px 6px 6px;
		padding: 4px;
		border-radius: 4px;

		&:hover {
			background-color: #ececec;
		}
	}
}

.app-container {
	flex: 0 0 auto;
}

@keyframes slide-in {
	from {
		top: -500px;
	}

	to {
		top: 24px;
	}
}
</style>
