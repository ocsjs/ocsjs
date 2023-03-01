<template>
	<div class="col-12 p-2 m-auto">
		<div class="text-secondary markdown mb-2">
			<div>浏览器多开的数量取决于电脑的配置，自行根据实际情况尝试。建议全部浏览器加载完成后再开启监控。</div>
		</div>

		<div class="d-flex mb-1 align-items-center">
			<a-space :size="0">
				<template #split>
					<a-divider direction="vertical" />
				</template>

				<a-tooltip
					content="显示每个浏览器的图像，如果太多浏览器可能会造成电脑卡顿"
					position="bl"
				>
					<a-button
						size="mini"
						type="outline"
						:disabled="processes.length === 0"
						@click="state.show = !state.show"
					>
						{{ state.show ? '暂停' : '开始' }}监控
					</a-button>
				</a-tooltip>

				<a-switch v-model="store.render.dashboard.details.tags">
					<template #checked> 显示标签 </template>
					<template #unchecked> 显示标签 </template>
				</a-switch>

				<a-switch v-model="store.render.dashboard.details.notes">
					<template #checked> 显示备注 </template>
					<template #unchecked> 显示备注 </template>
				</a-switch>

				<a-select
					v-model="store.render.dashboard.num"
					size="mini"
					style="width: 100px"
					:options="[1, 2, 4, 6, 8].map((i) => ({ value: i, label: `显示${i}列` }))"
				>
				</a-select>

				<a-select
					v-model="store.render.dashboard.video.aspectRatio"
					size="mini"
					style="width: 140px"
					:options="[[0,'默认'], [4/3,'4:3'], [16/9,'16:9'], ]
				.map((i) => 
				({ selected: i[0] ===store.render.dashboard.video.aspectRatio, 
				 value: i[0]!, label: i[1]! } as SelectOptionData))"
				>
					<template #prefix> 横纵比 </template>
				</a-select>

				<div></div>
			</a-space>
		</div>

		<template v-if="processes.length === 0">
			<a-empty
				class="pt-5"
				description="没有运行中的浏览器"
			></a-empty>
		</template>
		<template v-else-if="state.show === false">
			<a-empty
				class="pt-5"
				description="当前监控已暂停，请点击监控按钮重新监控"
			></a-empty>
		</template>
		<template v-else>
			<a-empty
				v-show="state.loading === true"
				class="pt-5"
				description="加载中..."
			></a-empty>
			<div
				v-show="state.loading === false"
				class="dashboard mt-2"
				:style="{
					'grid-template-columns': `repeat(${store.render.dashboard.num}, 1fr)`
				}"
			>
				<template
					v-for="pro of processes"
					:key="pro.uid"
				>
					<div class="browser">
						<!-- 头部操作按钮 -->
						<div class="browser-title">
							<a-row>
								<a-col flex="100px">
									<span
										class="text-secondary"
										style="font-size: 12px"
									>
										{{ pro.browser.name }}
									</span>
								</a-col>
								<a-col
									flex="auto"
									class="d-flex align-content-center justify-content-end text-end"
								>
									<a-space
										:size="0"
										class="justify-content-end"
									>
										<template #split>
											<a-divider
												direction="vertical"
												class="ms-1 me-1"
											/>
										</template>

										<BrowserOperators
											:space="false"
											:browser="pro.browser"
										>
											<template #split>
												<a-divider
													direction="vertical"
													class="ms-1 me-1"
												/>
											</template>
										</BrowserOperators>

										<EntityOperator
											type="browser"
											:entity="pro.browser"
											:permissions="['location', 'edit']"
										></EntityOperator>
									</a-space>
								</a-col>
							</a-row>
						</div>

						<!-- 影像区域 -->
						<div
							class="browser-video"
							@click="openBrowser(pro.uid)"
						>
							<a-tooltip content="点击操控浏览器">
								<!-- 浏览器影像投屏占位符 -->
								<div :id="'video-' + pro.uid"></div>
							</a-tooltip>

							<span v-if="pro.video === undefined">
								<a-empty
									v-if="pro.status === 'launching'"
									description="等待浏览器启动..."
								>
								</a-empty>
								<a-empty
									v-else-if="pro.status === 'launched'"
									description="等待图像初始化..."
								>
								</a-empty>
							</span>
						</div>

						<!-- 显示浏览器信息 -->

						<a-row
							v-if="store.render.dashboard.details.notes || store.render.dashboard.details.tags"
							class="align-items-center"
						>
							<!-- 标签 -->
							<a-col
								v-if="store.render.dashboard.details.tags"
								style="width: 100px"
								flex="100px"
							>
								<Tags
									:tags="pro.browser.tags"
									:read-only="true"
									size="small"
								></Tags>
							</a-col>
							<!-- 备注 -->
							<a-col
								v-if="store.render.dashboard.details.notes"
								style="width: 100px"
								flex="100px"
								class="text-secondary notes"
							>
								<a-tooltip
									content="备注描述"
									position="tl"
								>
									<template #content>
										<div>备注描述</div>
										<a-divider class="mt-1 mb-1" />
										<div>
											{{ pro.browser.notes }}
										</div>
									</template>
									<span> {{ pro.browser.notes }} </span>
								</a-tooltip>
							</a-col>
						</a-row>
					</div>
				</template>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { onDeactivated, watch, reactive } from 'vue';
import { Process, processes } from '../../utils/process';
import BrowserOperators from '../../components/browsers/BrowserOperators.vue';
import { store } from '../../store';

import Tags from '../../components/Tags.vue';
import { DesktopCapturerSource } from 'electron';
import { remote } from '../../utils/remote';
import { SelectOptionData } from '@arco-design/web-vue';
import debounce from 'lodash/debounce';
import EntityOperator from '../../components/EntityOperator.vue';

const state = reactive({
	show: false,
	loading: false
});

defineEmits<{
	(e: '1', v: string): void;
	(e: '2', v: string): void;
	(e: '3', v: string): void;
}>();

const debounceRefreshVideo = debounce(refreshVideo, 1000);

// 当帧率和横纵比改变时，延迟更新视频
watch(() => [store.render.dashboard.video.aspectRatio], debounceRefreshVideo);
// 当show改变时，即时更新
watch(
	() => state.show,
	() => {
		state.show ? refreshVideo() : closeVideo();
	}
);

onDeactivated(() => {
	state.show = false;
	closeVideo();
});

/** 如果其中有一个重启了，全部重新刷新 */
for (const process of processes) {
	process.on('relaunching', () => {
		process.video = undefined;
		// 删除视频
		document.querySelector(`#video-${process.uid}`)?.replaceChildren();
	});
	process.on('relaunched', () => {
		debounceRefreshVideo();
	});
}

/**
 * 关闭视频显示
 */
async function closeVideo() {
	for (const process of processes) {
		process.stream?.getTracks().forEach((track) => {
			track.stop();
		});
	}
}

/**
 * 刷新视频显示
 */
async function refreshVideo() {
	state.loading = true;

	// 将所有浏览器跳转至 webrtc 对接页面

	await Promise.all(
		processes.map(
			(process) =>
				new Promise<void>((resolve) => {
					process.once('webrtc-page-loaded', resolve);
					process.worker?.('gotoWebRTCPage');
				})
		)
	);

	// 抓取屏幕
	const sources: DesktopCapturerSource[] = await remote.desktopCapturer.call('getSources', { types: ['window'] });

	for (const process of processes) {
		const res = await getBrowserVideo(process.uid, sources);
		if (res) {
			process.stream = res.stream;

			process.stream?.getTracks().forEach((track) => {
				track.applyConstraints({
					/** 尽量减低帧率不占用高内存 */
					frameRate: 1,
					/** 横纵比 */
					aspectRatio:
						store.render.dashboard.video.aspectRatio === 0 ? undefined : store.render.dashboard.video.aspectRatio
				});
			});
			process.video = res.video;
		}
		// 挂载视频
		const slot = document.querySelector(`#video-${process.uid}`);
		if (slot && process.video) {
			slot.replaceChildren(process.video);
		}
	}

	await Promise.all(
		processes.map(
			(process) =>
				new Promise<void>((resolve) => {
					process.once('webrtc-page-closed', resolve);
					process.worker?.('closeWebRTCPage');
				})
		)
	);

	state.loading = false;
}

async function getBrowserVideo(uid: string, sources: DesktopCapturerSource[]) {
	for (const source of sources) {
		if (RegExp(uid).test(source.name)) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						// @ts-ignore
						mandatory: {
							chromeMediaSource: 'desktop',
							chromeMediaSourceId: source.id
						}
					}
				});

				const video = document.createElement('video');
				video.srcObject = stream;
				video.style.display = 'block';
				video.style.width = '100%';
				video.poster = source.thumbnail.toDataURL();

				video.onloadedmetadata = (e) => video.play();

				return { video, stream };
			} catch (e) {
				console.log(e);
			}
		}
	}
}

function openBrowser(uid: string) {
	Process.from(uid)?.bringToFront();
}
</script>

<style scoped lang="less">
.dashboard {
	display: grid;
	gap: 10px;
	grid-template-columns: repeat(6, 1fr);
}

.screenshot-item-title {
	padding: 0px 4px;
	white-space: nowrap;
}

.browser {
	background-color: #f2f5f8;
	padding: 4px;
	border-radius: 4px;

	&:hover {
		box-shadow: 0px 0px 4px -1px #2e98fc;
	}
}

.browser-video {
	overflow: hidden;
	cursor: pointer;
	border-radius: 4px;
}

.browser-title {
	height: 26px;
}

.browser-entity {
	padding: 4px;
}

.notes {
	font-size: 12px;
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;
}
</style>
