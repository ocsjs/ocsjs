<template>
	<a-dropdown :trigger="['contextmenu']">
		<div @click="onClick?.(uid)">
			<div>
				<Icon
					:type="icon"
					class="fs-1"
				>
				</Icon>
			</div>
			<a-input
				v-if="rename"
				ref="input"
				v-model:value="renameValue"
				size="small"
				@blur="(rename = false), onRename?.(uid, renameValue)"
			></a-input>
			<span v-else>{{ name }} </span>
		</div>

		<template #overlay>
			<a-menu class="entity-drop-menu">
				<a-menu-item
					key="remove"
					@click="onRemove?.(uid)"
				>
					<Icon type="icon-delete">删除</Icon>
				</a-menu-item>
				<a-menu-item
					key="rename"
					@click="rename = true"
				>
					<Icon type="icon-edit-square">重命名</Icon>
				</a-menu-item>
				<slot name="menus"></slot>
			</a-menu>
		</template>
	</a-dropdown>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import Icon from './Icon.vue';

const props = defineProps<{
	uid: string;
	name: string;
	icon: string;
	renaming?: boolean;
	onClick?: (uid: string) => void;
	onRemove?: (uid: string) => void;
	onRename?: (uid: string, currentName: string) => void;
}>();

const input = ref<HTMLInputElement>();
const rename = ref(props.renaming);
const renameValue = ref(props.name);

watch(rename, () => {
	if (rename.value) {
		nextTick(active);
	}
});

onMounted(() => {
	nextTick(active);
});

function active() {
	input.value?.focus();
	input.value?.select();
}
</script>
<style scoped lang="less">
.entity-drop-menu {
	min-width: 150px;
}
</style>
