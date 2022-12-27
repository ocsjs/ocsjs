<template>
	<component :is="slots.default ? Space : span">
		<IconFont
			class="ocs-icon"
			:type="type"
			:title="title"
			:class="{ active }"
		/>
		<span><slot /></span>
	</component>
</template>

<script setup lang="ts">
import { Space } from 'ant-design-vue';
import { h, toRefs, useSlots } from 'vue';
const span = h('span');
interface IconProps {
	type: string;
	title?: string;
	active?: boolean;
}
const slots = useSlots();
const props = withDefaults(defineProps<IconProps>(), {
	title: ''
});
const { type } = toRefs(props);
</script>

<style scoped lang="less">
.active {
	color: #1890ff;
}

.ocs-icon.anticon {
	transform: translate(0px, -1px);
}
</style>
