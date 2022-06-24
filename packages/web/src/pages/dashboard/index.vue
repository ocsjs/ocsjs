<template>
	<div class="col-12 p-2 m-auto">
		<div>
			<a-tag
				v-for="(group, index) of fileGroups"
				:key="index"
				:color="group.color"
			>
				{{ group.name }}: {{ group.data.length }}
			</a-tag>
		</div>

		<div class="d-flex mb-1 align-items-center border-bottom">
			<span>列数:</span>
			<a-slider
				v-model:value="num"
				style="width: 100px; margin: 10px 6px 10px"
				type="number"
				:min="1"
				:max="12"
			/>

			<a-divider type="vertical" />

			<span> 显示:</span>
			<a-select
				v-model:value="currentGroupName"
				size="small"
				style="width: 100px"
			>
				<a-select-option
					key="1"
					value="全部"
				>
					全部
				</a-select-option>
				<a-select-option
					key="1"
					value="编辑中"
				>
					编辑中
				</a-select-option>
				<a-select-option
					key="2"
					value="运行中"
				>
					运行中
				</a-select-option>
			</a-select>

			<a-divider type="vertical" />

			<span> 页面序号:</span>
			<a-input
				v-model:value="customIndex"
				size="small"
				type="number"
				style="width: 100px"
				:min="1"
			>
				<template #suffix>
					<a-tooltip title="显示浏览器每个页面图像的序号，默认为1，表示显示第一个页面">
						<Icon type="icon-info-circle" />
					</a-tooltip>
				</template>
			</a-input>

			<a-divider type="vertical" />

			<a-input-search
				v-model:value="search"
				placeholder="输入文件名搜索"
				size="small"
				style="width: 150px"
			/>
		</div>

		<template v-if="currentGroup.data.length === 0">
			<a-empty
				class="pt-5"
				description="暂时没有编辑中/运行中的文件"
			></a-empty>
		</template>
		<template v-else>
			<div
				class="dashboard pt-1"
				:style="{
					'grid-template-columns': `repeat(${num}, 1fr)`
				}"
			>
				<template
					v-for="[key, data] of currentGroup.data.filter(
						([key, data]) => search === '' || data.file.name.includes(search)
					)"
					:key="key"
				>
					<div
						class="screenshot-item"
						:class="{
							active: active === key
						}"
						@mouseover="active = key"
						@mouseleave="active = ''"
					>
						<div
							v-if="data.process.screenshots.length === 0"
							class="screenshot-item-title w-100 border-bottom"
						>
							{{ data.file.name }}
						</div>

						<ScreenShot
							class="h-100"
							:show-all="false"
							:custom-index="customIndex - 1"
							:screenshots="data.process.screenshots"
							@preview="onPreview"
						>
							<template #title="{ title, screenshot }">
								<div
									class="screenshot-item-title border-bottom"
									:title="screenshot?.url + '\n' + title"
									:class="{
										running: data.stat.running
									}"
								>
									<span>
										{{ data.file.name }}
									</span>
									<span>
										<span> | </span>
										<span v-if="active === key">
											<a-space>
												<Icon
													type="icon-file"
													title="编辑"
													@click="edit(data)"
												/>
												<Icon
													:type="data.stat.running ? 'icon-timeout' : 'icon-play-circle'"
													:style="{
														color: data.stat.running ? 'red' : ''
													}"
													:title="data.stat.running ? '停止' : '运行'"
													@click="data.stat.running ? close(data) : launch(data)"
												/>
											</a-space>
										</span>
										<span v-else> {{ title }} </span>
									</span>
								</div>
							</template>
						</ScreenShot>
					</div>
				</template>
			</div>
		</template>

		<a-modal
			v-model:visible="visible"
			width="90%"
			style="top: 10px"
			:title="modelTitle"
			:footer="null"
		>
			<div>
				<img
					style="width: 100%"
					:src="image"
				/>
			</div>
		</a-modal>
	</div>
</template>

<script
	setup
	lang="ts"
>
import { message } from 'ant-design-vue';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FileData, fileData } from '../../components/file/data';
import ScreenShot from '../../components/file/ScreenShot.vue';
import { store } from '../../store';

const router = useRouter();

/** 文件组 */
const fileGroups = computed(() => [
	{
		name: '全部',
		data: Array.from(fileData)
	},
	{
		name: '编辑中',
		data: Array.from(fileData).filter(([key, data]) => !data.stat.running),
		color: 'orange'
	},
	{
		name: '运行中',
		data: Array.from(fileData).filter(([key, data]) => data.stat.running),
		color: 'processing'
	}
]);

/** 文件选定组名字 */
const currentGroupName = ref(fileGroups.value[0].name);

/** 选定组 */
const currentGroup = computed(() => fileGroups.value.find((g) => g.name === currentGroupName.value));

/** 列数控制 */
const num = ref(4);
/** 图像位置 */
const customIndex = ref(1);
/** 搜索 */
const search = ref('');
/** 当前的文件 */
const active = ref('');

/** 预览图像弹窗 */
const visible = ref(false);
/** 弹窗标题 */
const modelTitle = ref('');
/** img 的 src 属性 */
const image = ref<string>('');

/** 预览 */
function onPreview(source: string, screenshot) {
	visible.value = true;
	image.value = source;
	modelTitle.value = screenshot.title;
}

function edit(data: FileData) {
	store.currentKey = data.file.path;
	store.selectedKeys = [data.file.path];
	router.push('/');
}

function close(data: FileData) {
	data.stat.running = false;
	data.process.close();
}

function launch(data: FileData) {
	data.stat.running = true;
	if (data.options) {
		data.process.launch(data.options);
	} else {
		message.error('参数错误, 可能是文件格式错误, 请到编辑页修正。');
	}
}
</script>

<style
	scoped
	lang="less"
>
.dashboard {
	display: grid;
	gap: 10px;
	grid-template-columns: repeat(6, 1fr);
}

.screenshot-item-title {
	padding: 0px 4px;
	white-space: nowrap;
}

.screenshot-item {
	overflow: hidden;
	border-radius: 4px;
	box-shadow: 0px 2px 8px -2px #b7b7b7;

	&.active {
		box-shadow: 0px 2px 4px -2px #1890ff;
	}
}
</style>
