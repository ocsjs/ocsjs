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
			<a-tooltip content="启动">
				<Icon
					type="play_circle"
					color="#165dff"
					class="fs-6"
					@click="instance?.launch()"
				/>
			</a-tooltip>
		</template>

		<template v-else-if="process.status === 'launched'">
			<a-tooltip content="置顶">
				<Icon
					type="push_pin"
					class="fs-6"
					color="#165dff"
					@click="instance?.bringToFront()"
				/>
			</a-tooltip>

			<a-tooltip content="重启">
				<Icon
					type="sync"
					class="fs-6"
					color="#165dff"
					@click="instance?.relaunch()"
				/>
			</a-tooltip>

			<a-tooltip content="关闭">
				<Icon
					type="cancel"
					class="fs-6"
					color="#ff0000db"
					@click="instance?.close()"
				/>
			</a-tooltip>
		</template>
		<template v-else-if="process.status === 'launching'">
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

const props = defineProps<{
	browser: BrowserOptions;
	space?: boolean;
}>();
const instance = Browser.from(props.browser.uid);
const process = computed(() => Process.from(props.browser.uid));
</script>

<style scoped lang="less">
.arco-space-item > span {
	cursor: pointer;
}
</style>
