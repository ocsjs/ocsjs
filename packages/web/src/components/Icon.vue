<template>
	<span class="ocs-icon">
		<IconFont
			:type="type"
			:title="title"
			:class="{ active }"
		/>
	</span>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
interface IconProps {
	type: string;
	title?: string;
	active?: boolean;
}
const props = withDefaults(defineProps<IconProps>(), {
	title: ''
});
const { type } = toRefs(props);
</script>

<style scoped lang="less">
.active {
	color: #1890ff;
}
</style>
