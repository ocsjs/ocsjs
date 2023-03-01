<template>
	<template
		v-for="(script, index) of playwrightScripts"
		:key="index"
	>
		<div class="shadow-sm rounded ps">
			<div>{{ script.name }}</div>
			<a-divider class="mb-1 mt-1" />
			<div
				v-for="cfg of script.configs"
				:key="cfg.label"
				class="ps-item"
			>
				<a-row v-if="!cfg.hide">
					<a-col flex="100px">
						<span> {{ cfg.label }} </span>
					</a-col>
					<a-col flex="auto">
						<a-input
							v-model="cfg.value"
							size="mini"
						></a-input>
					</a-col>
				</a-row>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { RawPlaywrightScript } from './index';

defineProps<{
	playwrightScripts: RawPlaywrightScript[];
}>();

defineEmits<{
	(e: 'update:playwrightScripts', playwrightScripts: RawPlaywrightScript[]);
}>();
</script>

<style scoped lang="less">
.ps + .ps {
	margin-top: 12px;
}

.ps {
	color: #4e5969;
	padding: 4px 12px 12px 12px;
	border: 1px solid #efefef;
}

.ps-item + .ps-item {
	margin-top: 4px;
}
</style>
