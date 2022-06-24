<template>
	<div class="screenshots">
		<div
			v-if="screenshots.length === 0"
			class="screenshot-empty"
		>
			<slot name="empty-title"> </slot>
			<a-empty
				class="empty"
				description="暂无预览图, 启动后获取。"
			/>
		</div>
		<div
			v-else
			class="w-100"
		>
			<template
				v-for="(screenshot, index) of showAll ? screenshots : [screenshots[customIndex]]"
				:key="index"
			>
				<div class="screenshot">
					<span class="screenshot-title">
						<slot
							name="title"
							:title="screenshot?.title || '空白页'"
							:screenshot="screenshot"
						>
							{{ screenshot?.title || '空白页' }}
						</slot>
					</span>
					<div
						v-if="screenshot"
						class="p-1"
					>
						<img
							:src="`data:image/png;base64,${screenshot.base64}`"
							@click="emits('preview', `data:image/png;base64,${screenshot.base64}`, screenshot)"
						/>
					</div>
					<div v-else>
						<a-empty
							class="empty"
							description="此页面无图像"
						/>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script
	setup
	lang="ts"
>
import { toRefs } from 'vue';

interface Screenshot {
	title: string;
	url: string;
	index: number;
	base64: string;
}

interface ScreenShotProps {
	/** 自定义显示的索引 */
	customIndex?: number;
	showAll: boolean;
	screenshots: Screenshot[];
}
const emits = defineEmits<{
	(e: 'preview', image: string, screenshot: Screenshot): void;
}>();

const props = withDefaults(defineProps<ScreenShotProps>(), {
	customIndex: undefined,
	showAll: true
});
const { screenshots } = toRefs(props);
</script>

<style
	scoped
	lang="less"
>
:deep(.ant-empty-img-default) {
	width: 100px;
	height: 100px;
}

:deep(.ant-empty-description) {
	font-size: 12px;
}

.screenshot-empty {
	padding: 4px;
}

.screenshot {
	height: fit-content;
	border-radius: 6px;
	cursor: pointer;

	img {
		width: 100%;
		max-height: 70vh;
		object-fit: cover;
	}
}

.screenshots {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}

.screenshot-title {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: left;
}
</style>
