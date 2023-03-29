import { Message, Modal } from '@arco-design/web-vue';
import { remote } from './remote';
import { resourceLoader } from './resources.loader';
import { notify } from './notify';
import { ResourceFile } from './apis';

type Extension = ResourceFile & {
	installed?: boolean;
};

// 下载拓展
export async function installExtensions(extensions: Extension[], extension: Extension) {
	if (extensions.filter((e) => e.installed).length > 0) {
		Message.warning({
			content: `脚本管理器 ${extension.name} 已经存在，无需重复安装！`,
			duration: 10 * 1000
		});
	} else {
		await resourceLoader.download('extensions', extension);

		notify('文件解压', `${extension.name} 解压中...`, 'download-file-' + extension.name, {
			type: 'info',
			duration: 0
		});

		await resourceLoader.unzip('extensions', extension);

		notify('文件下载', `${extension.name} 下载完成！`, 'download-file-' + extension.name, {
			type: 'success',
			duration: 3000
		});

		extension.installed = true;

		Modal.confirm({
			title: '提示',
			content: '安装脚本管理器后需要重启才能生效。',
			okText: '立刻重启',
			cancelText: '稍等自行重启',
			onOk: async () => {
				await remote.app.call('relaunch');
				await remote.app.call('exit', 0);
			}
		});
	}
}
