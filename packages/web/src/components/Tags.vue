<template>
	<template
		v-for="tag in tags"
		:key="tag"
	>
		<a-tooltip
			v-if="tag.name.length > 20"
			:title="tag"
		>
			<a-tag
				:closable="true"
				:color="tag.color"
				@close="handleClose(tag)"
			>
				{{ `${tag.name.slice(0, 20)}...` }}
			</a-tag>
		</a-tooltip>
		<a-tag
			v-else
			:closable="true"
			:color="tag.color"
			@close="handleClose(tag)"
		>
			{{ tag.name }}
		</a-tag>
	</template>

	<a-tag
		style="background: #fff; border-style: dashed; cursor: pointer"
		@click="showModel"
	>
		<plus-outlined />
		添加新标签
	</a-tag>
	<a-modal
		v-model:visible="state.modalVisible"
		centered
		ok-text="确认"
		cancel-text="取消"
		title="添加新标签"
		@ok="handleInputConfirm"
	>
		<div class="d-flex mb-3">
			<span class="col-2">标签名: </span>
			<a-auto-complete
				ref="inputRef"
				v-model:value="state.inputValue"
				placeholder="输入标签名"
				size="small"
				style="width: 100%"
				:options="options"
				@search="handleSearch"
			>
				<template #option="{ value, color, count }">
					<a-tag :color="color"> {{ value }} </a-tag>
					<span style="float: right"> {{ count }} </span>
				</template>
			</a-auto-complete>
		</div>
		<div class="d-flex">
			<span class="col-2">标签颜色: </span>
			<template v-if="store.browser.tags[state.inputValue]">
				<div
					style="cursor: not-allowed; width: 50px"
					:style="{
						backgroundColor: store.browser.tags[state.inputValue].color
					}"
					@click.prevent
				></div>
			</template>
			<template v-else>
				<ColorPicker v-model:pureColor="state.color" />
			</template>
		</div>
	</a-modal>
</template>
<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';

import { Tag } from '../types/browser';
import { store } from '../store';
const object = Object;

const props = defineProps<{
	tags: Tag[];
}>();
const emits = defineEmits<{
	(e: 'update:tags', tags: Tag[]): void;
	(e: 'remove', tag: Tag): void;
	(e: 'create', tag: Tag): void;
}>();

const getOptions = () =>
	object
		.keys(store.browser.tags)
		.map((key) => ({ value: key, ...store.browser.tags[key] }))
		.sort((a, b) => b.count - a.count);

const options = ref(getOptions());

const inputRef = ref();
const state = reactive({
	modalVisible: false,
	inputValue: '',
	color: ''
});

const handleSearch = (val: string) => {
	options.value = getOptions().filter((opt) => RegExp(val).test(opt.value));
};

const handleClose = (removeTag: Tag) => {
	const tags = props.tags.filter((tag) => tag.name !== removeTag.name);
	emits('update:tags', tags);
	emits('remove', removeTag);
};

const showModel = () => {
	state.modalVisible = true;
	nextTick(() => {
		inputRef.value.focus();
	});
};

const handleInputConfirm = () => {
	const inputValue = state.inputValue;
	let tags = props.tags;
	if (inputValue && tags.map((t) => t.name).indexOf(inputValue) === -1) {
		const newTag = { name: inputValue, color: state.color };
		tags = [...tags, newTag];
		emits('create', newTag);
	}
	// 重置状态
	Object.assign(state, {
		modalVisible: false,
		inputValue: '',
		color: ''
	});

	emits('update:tags', tags);
};
</script>
