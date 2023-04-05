<template>
	<div class="w-100">
		<div class="setting text-center p-2 col-12 col-md-10 col-lg-8">
			<Card title="基本设置">
				<Description label="开机自启">
					<a-switch
						v-model="store.window.autoLaunch"
						size="small"
					/>
				</Description>

				<Description label="窗口置顶">
					<a-switch
						v-model="store.window.alwaysOnTop"
						size="small"
					/>
				</Description>
				<Description label="夜间模式">
					<a-switch
						v-model="store.render.setting.theme.dark"
						size="small"
						@click="changeTheme"
					/>
				</Description>
			</Card>

			<Card title="通用设置">
				<BrowserPath></BrowserPath>

				<Description label="OCS配置">
					<a-switch v-model="store.render.setting.ocs.openSync">
						<template #checked> 同步到全部浏览器中 </template>
						<template #unchecked> 同步到全部浏览器中 </template>
					</a-switch>

					<a-divider
						class="mt-2 mb-2"
						direction="vertical"
					/>

					<a-button
						v-if="state.loading === false && state.err === ''"
						@click="state.show = true"
					>
						点击配置
					</a-button>
					<a-modal
						v-model:visible="state.show"
						:footer="false"
						:simple="true"
						:width="500"
						modal-class="p-0 m-0"
					>
						<div
							id="ocs-global-configs"
							style="height: 90vh"
							class="m-2"
						>
							<OCSConfigs
								v-show="state.loading === false"
								v-model:store="store.render.setting.ocs.store"
								@error="(err) => (state.err = err)"
								@loaded="() => (state.loading = false)"
								@loading="() => (state.loading = true)"
							></OCSConfigs>
						</div>
					</a-modal>

					<div
						v-show="state.loading === false && state.err !== ''"
						style="color: red"
					>
						解析错误！
					</div>
					<div v-show="state.loading === true && state.err === ''"><icon-loading /> 正在获取最新OCS配置</div>
				</Description>
			</Card>

			<Card title="路径设置">
				<Path
					label="浏览器缓存路径"
					name="userDataDirsFolder"
				/>
				<Path
					label="文件下载路径"
					name="downloadFolder"
				/>
				<Path
					label="软件存储"
					name="user-data-path"
				/>
				<Path
					label="软件路径"
					name="exe-path"
				/>
			</Card>

			<div class="mt-4">
				<a-popconfirm
					content="确认重置您的设置，并重新启动软件吗？"
					ok-text="确认"
					cancel-text="取消"
					@ok="reset"
				>
					<a-button
						size="small"
						status="danger"
					>
						重置设置
					</a-button>
				</a-popconfirm>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import Card from '../../components/Card.vue';
import Description from '../../components/Description.vue';
import Path from '../../components/Path.vue';
import { store } from '../../store';
import { remote } from '../../utils/remote';
import BrowserPath from '../../components/setting/BrowserPath.vue';
import OCSConfigs from '../../components/OCSConfigs.vue';
import { reactive } from 'vue';
import { changeTheme } from '../../utils';

const state = reactive({
	/** 是否加载 */
	loading: false,
	/** 是否加载错误 */
	err: '',
	show: false
});

/** 重置设置 */
async function reset() {
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

#ocs-global-configs {
	height: 70vh;
	overflow: overlay;
}
</style>
