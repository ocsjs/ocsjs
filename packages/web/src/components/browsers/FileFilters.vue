<template>
	<a-select
		v-model="store.render.browser.search.tags"
		size="mini"
		multiple
		placeholder="使用标签搜索"
		style="width: 200px"
	>
		<template
			v-for="key in object.keys(store.render.browser.tags)"
			:key="key"
		>
			<a-option
				v-if="store.render.browser.tags[key]"
				:value="key"
				:label="key"
			>
				<a-space>
					<a-tag :color="store.render.browser.tags[key].color"> {{ key }} </a-tag>
					<span style="float: right"> {{ store.render.browser.tags[key].count }} </span>
				</a-space>
			</a-option>
		</template>
	</a-select>

	<a-input-search
		v-model="store.render.browser.search.value"
		size="mini"
		placeholder="输入名字,备注搜索"
		style="width: 240px"
	/>
</template>

<script setup lang="ts">
import { store } from '../../store';
const object = Object;
</script>

<style scoped lang="less"></style>
