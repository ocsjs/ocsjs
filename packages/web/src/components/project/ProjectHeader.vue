<template>
	<div class="header w-100">
		<template v-if="openSearch">
			<div class="d-flex align-items-center">
				<a-input-search
					class="rounded"
					size="small"
					placeholder="输入搜索文件名"
					@change="emits('update:searchValue', ($event.target as any).value)"
				/>
				<Icon
					title="关闭搜索"
					class="ms-1"
					type="icon-close-circle"
					@click.stop="emits('update:openSearch', false)"
				/>
			</div>
		</template>
		<template v-else>
			<div class="d-flex w-100 align-items-center">
				<div class="title">
					{{ title }}
				</div>
				<div class="d-flex w-100 justify-content-end title-actions">
					<template v-if="expend">
						<template v-if="rootPath">
							<Icon
								title="新建文件夹"
								class="me-2"
								type="icon-folder-plus"
								@click.stop="mkdir(rootPath)"
							/>

							<Icon
								title="新建文件"
								class="me-2"
								type="icon-file-plus"
								@click.stop="createFile(rootPath, undefined)"
							/>
						</template>
						<Icon
							title="搜索文件"
							type="icon-search"
							@click.stop="emits('update:openSearch', true)"
						/>
					</template>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { createFile, mkdir } from '../file/File';
interface ProjectHeaderProps {
	rootPath?: string;
	openSearch: boolean;
	searchValue: string;
	title: string;
	expend: boolean;
}
const props = withDefaults(defineProps<ProjectHeaderProps>(), {
	rootPath: ''
});
const { openSearch } = toRefs(props);

const emits = defineEmits<{
	(e: 'update:openSearch', value: boolean): void;
	(e: 'update:searchValue', value: string): void;
}>();
</script>

<style scoped lang="less">
.header {
	white-space: nowrap;

	.title {
		font-size: 12px;
		margin-left: 24px;
	}
}
</style>
