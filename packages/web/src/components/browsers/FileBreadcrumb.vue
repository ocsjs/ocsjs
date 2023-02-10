<template>
	<span class="breadcrumb">
		<a-breadcrumb>
			<template
				v-for="folder of currentFolder ? Folder.from(currentFolder.uid)?.flatParents() : []"
				:key="folder.uid"
			>
				<a-breadcrumb-item @click="Folder.from(folder.uid)?.location()">
					<span class="path-item"> {{ folder.name }} </span>
				</a-breadcrumb-item>
			</template>
			<!-- 表示一个斜杠 -->
			<a-breadcrumb-item> </a-breadcrumb-item>
		</a-breadcrumb>
	</span>
</template>

<script setup lang="ts">
import { currentFolder } from '../../fs';
import { Folder } from '../../fs/folder';
</script>

<style scoped lang="less">
.breadcrumb {
	background-color: #f2f2f2;
	padding: 2px 12px;
	border-radius: 4px;
	white-space: nowrap;
	margin-bottom: 0px;
	width: 100%;
	overflow: overlay;
}

.path-item {
	cursor: pointer;
}
</style>
