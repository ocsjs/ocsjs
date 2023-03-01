<template>
	<div>
		<a-input-search
			v-model="state.search"
			size="small"
			class="mb-2"
			placeholder="输入脚本名搜索"
		/>

		<template
			v-for="(script, index) of scripts"
			:key="index"
		>
			<div
				class="ps"
				:class="{
					selected: isSelected(script)
				}"
				@click="select(script)"
			>
				<b> {{ script.name }} </b>
				<span
					style="font-size: 12px"
					class="text-secondary float-end"
				>
					<span> 需配置 : </span>
					<span
						v-for="(cfg, key, i) of script.configs"
						:key="cfg.label"
					>
						<span v-if="!cfg.hide">
							<span v-if="i !== 0"> , </span>

							{{ cfg.label }}
						</span>
					</span>
				</span>
			</div>
		</template>

		<div class="mt-3 float-end">
			<a-space>
				<span
					style="font-size: 12px"
					class="text-secondary float-end"
				>
					共选中 {{ selectedScripts.length }} 个
				</span>
				<a-button
					style="width: 100px"
					type="primary"
					@click="confirm"
				>
					确定
				</a-button>
			</a-space>
		</div>
	</div>
</template>

<script setup lang="ts">
import * as Scripts from '@ocsjs/app/src/scripts/index';
import { ref, reactive } from 'vue';
import { RawPlaywrightScript } from './index';

const state = reactive({
	search: ''
});

const props = withDefaults(
	defineProps<{
		playwrightScripts: RawPlaywrightScript[];
		multiple?: boolean;
	}>(),
	{
		playwrightScripts: () => [],
		multiple: true
	}
);

const emits = defineEmits<{
	(e: 'update:playwrightScripts', playwrightScripts: RawPlaywrightScript[]);
	(e: 'confirm');
}>();

const scripts = ref<RawPlaywrightScript[]>(createPlaywrightScripts());
const selectedScripts = ref<string[]>(props.playwrightScripts.map((s) => s.name));

function confirm() {
	const playwrightScripts = selectedScripts.value
		.map((s) => scripts.value.find((ps) => ps.name === s))
		.filter(Boolean) as RawPlaywrightScript[];
	emits('update:playwrightScripts', playwrightScripts);
	emits('confirm');
}

function select(ps: RawPlaywrightScript) {
	if (props.multiple) {
		const index = selectedScripts.value.findIndex((s) => s === ps.name);
		if (index === -1) {
			selectedScripts.value.push(ps.name);
		} else {
			selectedScripts.value.splice(index, 1);
		}
	} else {
		selectedScripts.value = [ps.name];
	}
}

function isSelected(ps: RawPlaywrightScript) {
	return selectedScripts.value.find((s) => s === ps.name) !== undefined;
}

function createPlaywrightScripts(): RawPlaywrightScript[] {
	const list: RawPlaywrightScript[] = [];
	for (const key in Scripts) {
		if (Object.prototype.hasOwnProperty.call(Scripts, key)) {
			list.push(Scripts[key]);
		}
	}
	return list;
}
</script>

<style scoped lang="less">
.ps {
	border: 1px solid #e1e1e18c;
	padding: 6px;
	margin: 8px 0px;
	border-radius: 4px;
	cursor: pointer;

	&.selected {
		border: 1px solid #0d6efd8c;
	}
}
</style>
