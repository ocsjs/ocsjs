<template>
	<a-space
		v-if="instance"
		:size="0"
		class="justify-content-end align-items-center"
	>
		<template #split>
			<slot name="split"></slot>
		</template>
		<template v-if="process === undefined || process.status === 'closed'">
			<a-tooltip :position="tooltipPosition">
				<template #content>
					启动浏览器 <br />
					- 并自动安装脚本 <br />
					- 以及执行自动化脚本等一系列操作。
				</template>

				<Icon
					type="play_circle"
					color="#165dff"
					:class="iconClass"
					@click="instance?.launch()"
				/>
			</a-tooltip>
		</template>

		<template v-else-if="process.status === 'launched'">
			<a-tooltip
				content="置顶"
				:position="tooltipPosition"
			>
				<Icon
					type="push_pin"
					:class="iconClass"
					color="#165dff"
					@click="instance?.bringToFront()"
				/>
			</a-tooltip>

			<a-tooltip
				content="重启"
				:position="tooltipPosition"
			>
				<Icon
					type="sync"
					:class="iconClass"
					color="#165dff"
					@click="instance?.relaunch()"
				/>
			</a-tooltip>

			<a-tooltip
				content="关闭"
				:position="tooltipPosition"
			>
				<Icon
					type="cancel"
					:class="iconClass"
					color="#ff0000db"
					@click="instance?.close()"
				/>
			</a-tooltip>
		</template>

		<!-- 加载中 -->
		<template v-else-if="process.status === 'launching' || process.status === 'closing'">
			<icon-loading />
		</template>

		<slot name="extra"></slot>
	</a-space>
</template>

<script setup lang="ts">
import Icon from '../Icon.vue';
import { Process } from '../../utils/process';
import { computed } from 'vue';
import { Browser } from '../../fs/browser';
import { BrowserOptions } from '../../fs/interface';

const props = withDefaults(
	defineProps<{
		browser: BrowserOptions;
		tooltipPosition?: 'top' | 'br';
		iconClass?: string;
	}>(),
	{
		tooltipPosition: 'top',
		iconClass: 'fs-6'
	}
);
const instance = Browser.from(props.browser.uid);
const process = computed(() => Process.from(props.browser.uid));
</script>

<style scoped lang="less">
.arco-space-item > span {
	cursor: pointer;
}
</style>
