<template>
	<a-row class="pt-1 border-bottom align-items-center entity-properties">
		<a-col
			v-if="isShow('checkbox')"
			flex="32px"
			class="d-flex"
		>
		</a-col>
		<!-- 名字 -->
		<a-col
			v-if="isShow('name')"
			class="entity-property"
			flex="300px"
		>
			浏览器名
		</a-col>
		<template v-if="isShow('extra')">
			<a-col
				class="entity-property"
				flex="250px"
			>
				<a-divider
					class="ms-0 m-1"
					direction="vertical"
				/>
				备注
			</a-col>
			<a-col
				class="entity-property"
				flex="200px"
			>
				<a-divider
					class="ms-0 m-1"
					direction="vertical"
				/>
				标签
			</a-col>
		</template>

		<!-- 操作按钮 -->
		<a-col
			v-if="isShow('actions')"
			class="entity-property text-end pe-3"
			flex="auto"
		>
			操作
		</a-col>
	</a-row>
</template>

<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		columns?: ('checkbox' | 'icon' | 'name' | 'extra' | 'actions')[];
	}>(),
	{
		columns: () => ['checkbox', 'icon', 'name', 'extra', 'actions']
	}
);

function isShow(type: 'checkbox' | 'icon' | 'name' | 'extra' | 'actions') {
	return !!props.columns.find((c) => c === type);
}
</script>

<style scoped lang="less">
.entity-properties {
	background-color: #f7f7f7;
	color: #4d4d4d;

	.entity-property {
		font-size: 12px;
	}
}
</style>
