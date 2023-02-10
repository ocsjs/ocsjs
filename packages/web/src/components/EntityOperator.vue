<template>
	<a-dropdown
		v-if="instance"
		:trigger="['hover']"
	>
		<Icon
			type="menu"
			style="cursor: pointer"
			class="fs-6"
		></Icon>
		<template #content>
			<slot name="dropdown"></slot>

			<a-doption
				v-if="hasPermissions('edit')"
				@click="instance?.select()"
			>
				<Icon type="edit" /> 编辑
			</a-doption>

			<a-doption
				v-if="hasPermissions('rename')"
				@click="instance && (instance.renaming = true)"
			>
				<Icon type="text_format" /> 重命名
			</a-doption>

			<a-doption
				v-if="hasPermissions('remove')"
				@click="instance?.remove()"
			>
				<Icon
					style="color: red"
					type="delete"
				/>
				删除
			</a-doption>

			<a-doption
				v-if="hasPermissions('location')"
				@click="instance?.location()"
			>
				<Icon type="location_on" /> 跳转到文件所在位置
			</a-doption>
		</template>
	</a-dropdown>
</template>

<script setup lang="ts">
import { Browser } from '../fs/browser';
import { Folder } from '../fs/folder';
import { FolderOptions, BrowserOptions, FolderType } from '../fs/interface';
import Icon from './Icon.vue';

type Permissions = 'edit' | 'rename' | 'remove' | 'location';

const props = withDefaults(
	defineProps<{
		entity: BrowserOptions | FolderOptions<FolderType, Browser | Folder>;
		permissions?: Permissions[] | undefined;
	}>(),
	{
		permissions: () => ['edit', 'remove', 'rename']
	}
);

const instance = props.entity.type === 'browser' ? Browser.from(props.entity.uid) : Folder.from(props.entity.uid);

function hasPermissions(p: Permissions) {
	return props.permissions.some((per) => per === p);
}
</script>

<style scoped lang="less"></style>
