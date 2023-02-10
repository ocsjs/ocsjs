import { Message, Modal } from '@arco-design/web-vue';
import { downloadZip } from '.';
import { store } from '../store';
import { remote } from './remote';
import { ExtensionResource } from '@ocsjs/common';

type Extension = ExtensionResource & {
	installed?: boolean;
};

// 下载拓展
export async function installExtension(extensions: Extension[], extension: Extension) {
	if (extensions.filter((e) => e.installed).length > 0) {
		Message.warning('脚本管理器已经存在，请卸载另外一个再尝试安装。');
	} else {
		await downloadZip({
			name: extension.name,
			filename: extension.name,
			folder: store.paths.extensionsFolder,
			url: extension.url
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
