<template>
	<div class="col-12 p-2 m-auto">
		<div class="text-secondary markdown mb-3">
			<code>浏览器拓展</code> 会在浏览器启动时自动加载（你也可以手动下载并解压到
			<code>浏览器拓展路径</code> 中），具体请在设置查看。<br />
			<code>用户脚本管理器</code> 只能存在一个，否则可能造成脚本之间的冲突
		</div>
		<div v-if="loading">
			<a-skeleton animation>
				<a-skeleton-line :rows="3" />
			</a-skeleton>
		</div>
		<a-table
			v-else
			size="small"
			:data="
				extensions.map((e) => ({
					key: e.name,
					...e
				}))
			"
			:columns="[
				{
					title: '图标',
					width: 64,
					dataIndex: 'icon',

					render: ({ rowIndex }) => {
						return h('img', {
							src: extensions[rowIndex].icon,
							style: {
								width: '32px'
							}
						});
					}
				},
				{
					title: '名称',
					dataIndex: 'name'
				},
				{
					title: '简介',
					dataIndex: 'description',
					ellipsis: true
				},
				{
					title: '官网',
					dataIndex: 'homepage',

					render: ({ rowIndex }) => {
						return h(
							'a',
							{
								href: extensions[rowIndex].homepage
							},
							extensions[rowIndex].homepage
						);
					}
				},
				{
					title: '操作',
					width: 84,
					fixed: 'right',
					dataIndex: 'actions',

					render: ({ rowIndex }) => {
						return actions(rowIndex);
					}
				}
			]"
		/>
	</div>
</template>

<script setup lang="ts">
import { Button } from '@arco-design/web-vue';
import { h, onMounted, ref } from 'vue';
import { config } from '../../config';
import { store } from '../../store';
import { remote } from '../../utils/remote';
import { installExtension } from '../../utils/extension';
import { ExtensionResource } from '@ocsjs/common';

type Extension = ExtensionResource & {
	installed?: boolean;
};

const loading = ref(true);
// 拓展列表
const extensions = ref<Extension[]>([]);

/** 操作按钮 */
const actions = (rowIndex: number) =>
	h('span', {}, [
		extensions.value[rowIndex].installed
			? h(
					Button,
					{
						type: 'text',
						danger: true,
						size: 'small',
						onClick: () => uninstallExtension(extensions.value[rowIndex])
					},
					() => ['卸载']
			  )
			: h(
					Button,
					{
						type: 'text',
						size: 'small',
						onClick: () => installExtension(extensions.value, extensions[rowIndex])
					},
					() => ['安装']
			  )
	]);

// 加载拓展
onMounted(async () => {
	for (const engine of config.extensionSearchEngines) {
		const exts = await engine.search();
		extensions.value = extensions.value.concat(exts);
	}
	for (const extension of extensions.value) {
		extension.installed = await remote.fs.call('existsSync', `${store.paths.extensionsFolder}/${extension.name}`);
	}

	loading.value = false;
});

// 卸载拓展
async function uninstallExtension(extension: Extension) {
	await remote.fs.call('rmdirSync', await remote.path.call('join', store.paths.extensionsFolder, extension.name), {
		recursive: true
	});
	extension.installed = false;
}
</script>

<style scoped lang="less"></style>
