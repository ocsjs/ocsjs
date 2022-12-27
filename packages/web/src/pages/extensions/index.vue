<template>
	<div class="col-12 ps-1 pe-1 m-auto">
		<p class="text-secondary text-small markdown">
			<code>浏览器拓展</code> 会在浏览器启动时自动加载（你也可以手动下载并解压到 <code>存储路径</code> 中）。<br />
			<code>当前存储路径</code> {{ store.extensionsPath }} <br />
			<code>用户脚本管理器</code> 只能存在一个，否则可能造成脚本之间的冲突
		</p>
		<div v-if="loading">
			<a-skeleton active />
		</div>
		<a-table
			v-else
			size="small"
			:data-source="
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
					key: 'icon',
					customRender: ({ text }) => {
						return h('img', {
							src: text,
							style: {
								width: '32px'
							}
						});
					}
				},
				{
					title: '名称',
					dataIndex: 'name',
					key: 'name'
				},
				{
					title: '简介',
					dataIndex: 'description',
					ellipsis: true,
					key: 'description'
				},
				{
					title: '官网',
					dataIndex: 'homepage',
					key: 'homepage',
					customRender: ({ text }) => {
						return h(
							'a',
							{
								href: text
							},
							text
						);
					}
				},
				{
					title: '操作',
					width: 64,
					fixed: 'right',
					dataIndex: 'actions',
					key: 'actions',
					customRender: ({ index }) => {
						return h('span', [
							extensions[index].installed
								? h(
										Button,
										{
											type: 'link',
											danger: true,
											size: 'small',
											onClick: () => uninstallExtension(extensions[index])
										},
										['卸载']
								  )
								: h(
										Button,
										{
											type: 'link',
											size: 'small',
											onClick: () => installExtension(extensions[index])
										},
										['安装']
								  )
						]);
					}
				}
			]"
		/>
	</div>
</template>

<script setup lang="ts">
import { Button, message, Modal } from 'ant-design-vue';
import { h, onMounted, ref } from 'vue';
import { config } from '../../config';
import { store } from '../../store';
import { BrowserExtension } from '../../types/extensions';
import { NodeJS } from '../../utils/export';
import { notify } from '../../utils/notify';
import { remote } from '../../utils/remote';

const { ipcRenderer } = require('electron');

type Extension = BrowserExtension & {
	installed?: boolean;
};

const loading = ref(true);
// 拓展列表
const extensions = ref<Extension[]>([]);

// 加载拓展
onMounted(async () => {
	for (const engine of config.extensionSearchEngines) {
		const exts = await engine.search();
		extensions.value = extensions.value.concat(exts);
	}
	for (const extension of extensions.value) {
		extension.installed = NodeJS.fs.existsSync(`${store.extensionsPath}/${extension.name}`);
	}

	loading.value = false;
});

// 下载拓展
async function installExtension(extension: Extension) {
	if (extensions.value.filter((e) => e.installed).length > 0) {
		message.warn('脚本管理器已经存在，请卸载另外一个再尝试安装。');
	} else {
		// 压缩包下载位置
		const zipPath = NodeJS.path.join(store.extensionsPath, `${extension.name}.zip`);
		// 拓展位置
		const extensionPath = NodeJS.path.join(store.extensionsPath, extension.name);

		const listener = (e: any, channel: string, rate: number, chunkLength: number, totalLength: number) => {
			installListener(extension.name, channel, rate, chunkLength, totalLength);
		};
		// 监听下载进度
		ipcRenderer.on('download', listener);
		try {
			// 下载
			await remote.methods.call('download', 'download-extensions-' + extension.name, extension.url, zipPath);

			// 解压拓展
			await remote.methods.call('unzip', zipPath, extensionPath);
			// 删除压缩包
			NodeJS.fs.unlinkSync(zipPath);
		} catch (err) {
			message.error('下载错误 ' + err.message);
		}
		ipcRenderer.removeListener('download', listener);
		extension.installed = true;
	}
}

// 卸载拓展
function uninstallExtension(extension: Extension) {
	NodeJS.fs.rmdirSync(NodeJS.path.join(store.extensionsPath, extension.name), { recursive: true });
	extension.installed = false;
}

function installListener(name: string, channel: string, rate: number, chunkLength: number, totalLength: number) {
	if (channel === 'download-extensions-' + name) {
		if (rate === 100) {
			notify(
				'拓展下载',
				`${name} 下载完成: ${(totalLength / 1024 / 1024).toFixed(2)}MB`,
				'download-extensions-' + name,
				{ type: 'success', duration: 3 }
			);

			Modal.confirm({
				title: '提示',
				content: '安装脚本管理器后需要重启才能生效。',
				okText: '立刻重启',
				cancelText: '下次一定',
				onOk: () => {
					remote.app.call('relaunch');
					remote.app.call('exit', 0);
				}
			});
		} else {
			notify(
				'拓展下载',
				`${name} 下载中: ${(chunkLength / 1024 / 1024).toFixed(2)}MB/${(totalLength / 1024 / 1024).toFixed(2)}MB`,
				'download-extensions-' + name,
				{
					type: 'info',
					duration: 5,
					close: false
				}
			);
		}
	}
}
</script>

<style scoped lang="less"></style>
