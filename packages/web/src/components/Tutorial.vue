<template>
	<template v-if="showHelp">
		<a-tooltip
			color="white"
			:visible="true"
			:placement="placement"
			:arrow-point-at-center="true"
			overlay-class-name="tutorial-tooltip"
		>
			<template #title>
				<span style="color: black"> {{ content }} </span>
				<a-button
					type="link"
					size="small"
					@click="emits('click')"
					>下一步</a-button
				>
			</template>
			<slot></slot>
		</a-tooltip>
	</template>
	<template v-else>
		<slot></slot>
	</template>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
interface HelperProps {
	content: string;
	showHelp: boolean;
	placement: string;
}
const props = withDefaults(defineProps<HelperProps>(), {
	content: '',
	showHelp: false
});
const { content, showHelp } = toRefs(props);

const emits = defineEmits<{
	(e: 'click'): void;
}>();
</script>

<style scoped lang="less"></style>
