<template>
	<span class="row flex-nowrap mb-1">
		<span class="col-3 desc-label"> {{ label }} : </span>

		<span class="col-9 d-inline-flex align-items-center">
			<span
				v-if="desc"
				class="desc"
				:class="textClass"
			>
				{{ String(desc) }}
			</span>
			<slot />
		</span>
	</span>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
interface DescriptionProps {
	label: string;
	desc?: any;
	textClass?: any;
}
const props = withDefaults(defineProps<DescriptionProps>(), {
	desc: '',
	textClass: ''
});
const { label, desc, textClass } = toRefs(props);
</script>

<style scoped lang="less">
.desc {
	word-wrap: break-word;
	word-break: break-all;
	font-size: 14px;
}

.desc-label {
	white-space: nowrap;
}
</style>
