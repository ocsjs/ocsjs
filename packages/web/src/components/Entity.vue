<template>
	<a-row
		v-if="instance"
		class="entity align-items-center"
		:class="{ active: store.render.browser.currentBrowserUid === instance.uid }"
	>
		<slot name="prefix"></slot>

		<!-- 图标 -->
		<a-col
			v-if="slots.icon"
			style="cursor: pointer"
			flex="32px"
			@click="instance?.select()"
		>
			<slot name="icon"></slot>
		</a-col>

		<!-- 名字 -->
		<a-col
			:flex="typeof widths.name === 'string' ? widths.name : widths.name + 'px'"
			class="text-secondary entity-name"
			style="font-size: 12px; cursor: pointer"
			@click="instance?.select()"
		>
			<a-input
				v-show="instance.renaming"
				ref="renameInput"
				v-model="renameValue"
				size="mini"
				@click.stop
				@blur="instance?.rename(renameValue)"
			></a-input>
			<span v-show="!instance.renaming">
				{{ instance.name }}
			</span>

			<slot name="name"></slot>
		</a-col>

		<slot name="extra"></slot>

		<!-- 操作按钮 -->
		<a-col
			v-if="slots.actions"
			:flex="typeof widths.actions === 'string' ? widths.actions : widths.actions + 'px'"
			class="text-secondary text-nowrap d-flex justify-content-end pe-3"
		>
			<a-space
				:size="0"
				class="actions justify-content-end"
			>
				<template #split>
					<a-divider direction="vertical" />
				</template>

				<slot name="actions"></slot>
			</a-space>
		</a-col>
	</a-row>
</template>
<script setup lang="ts">
import { nextTick, onMounted, ref, watch, useSlots } from 'vue';
import { store } from '../store';
import { FolderOptions, BrowserOptions, FolderType } from '../fs/interface';
import { Browser } from '../fs/browser';
import { Folder } from '../fs/folder';

const slots = useSlots();

const props = withDefaults(
	defineProps<{
		entity: BrowserOptions | FolderOptions<FolderType, Browser | Folder>;
		widths?: { name: number | 'auto'; actions: number | 'auto' };
	}>(),
	{
		widths: () => ({ name: 300, actions: 'auto' })
	}
);

const renameInput = ref<any>();
const renameValue = ref(props.entity.name);

const instance = props.entity.type === 'browser' ? Browser.from(props.entity.uid) : Folder.from(props.entity.uid);

watch(
	() => props.entity.renaming,
	() => {
		if (props.entity.renaming) {
			nextTick(active);
		}
	}
);

onMounted(() => {
	nextTick(active);
});

function active() {
	const input: HTMLInputElement = renameInput.value.$el.querySelector('input');
	input.focus();
	input.select();
}
</script>
<style scoped lang="less">
.entity-drop-menu {
	min-width: 150px;
}

.entity-name {
	text-overflow: ellipsis;
	white-space: nowrap;
	overflow: hidden;

	// 禁止选择
	-moz-user-select: none; /*火狐*/
	-webkit-user-select: none; /*webkit浏览器*/
	-ms-user-select: none; /*IE10*/
	-khtml-user-select: none; /*早期浏览器*/
	user-select: none;
}

.entity {
	border-bottom: 1px solid #eeeeee;

	&:hover {
		border-radius: 4px;
		background-color: #f7f7f7;
	}

	&.active {
		background-color: #3577db25;
	}
}

.arco-space-item > span {
	cursor: pointer;
}
</style>
