<template>
	<a-space>
		<a-dropdown trigger="hover">
			<a-button size="mini">
				<Icon type="more_horiz"> 更多 </Icon>
			</a-button>
			<template #content> </template>
		</a-dropdown>

		<a-button
			size="mini"
			type="outline"
			@click="newFolder"
		>
			<Icon type="folder"> 新建文件夹 </Icon>
		</a-button>
		<a-button
			size="mini"
			type="outline"
			@click="newBrowser"
		>
			<Icon type="web"> 新建浏览器 </Icon>
		</a-button>
	</a-space>
</template>

<script setup lang="ts">
import { currentFolder } from '../../fs';
import { Browser } from '../../fs/browser';
import { Folder } from '../../fs/folder';
import { store } from '../../store';

import { resetSearch } from '../../utils/entity';
import Icon from '../Icon.vue';
import { remote } from '../../utils/remote';
import { inBrowser } from '../../utils/node';
import { Entity } from '../../fs/entity';

async function newFolder() {
	// 关闭搜索模式
	resetSearch();
	const id = await Entity.uuid();

	const folder = new Folder({
		uid: id,
		type: 'folder',
		name: '未命名文件夹',
		children: {},
		createTime: Date.now(),
		parent: currentFolder.value.uid,
		renaming: true
	});
	currentFolder.value.children[id] = folder;
}
async function newBrowser() {
	// 关闭搜索模式
	resetSearch();
	const id = await Entity.uuid();

	currentFolder.value.children[id] = new Browser({
		type: 'browser',
		uid: id,
		name: '未命名浏览器',
		checked: false,
		createTime: Date.now(),
		notes: '',
		tags: [],
		renaming: true,
		parent: currentFolder.value.uid,
		histories: [{ action: '创建', time: Date.now() }],
		cachePath: inBrowser ? '' : await remote.path.call('join', store.paths.userDataDirsFolder, id),
		store: {}
	});
}
</script>

<style scoped lang="less"></style>
