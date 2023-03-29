import { Message } from '@arco-design/web-vue';
import { remote } from './remote';
import { store } from '../store';

/**
 * 添加并且解析本地脚本
 */
export function addScriptFromFile() {
	remote.dialog
		.call('showOpenDialog', {
			title: '选择脚本文件(.user.js)',
			buttonLabel: '添加脚本',
			filters: [{ extensions: ['js', 'user.js'], name: '用户脚本' }]
		})
		.then(async ({ canceled, filePaths }) => {
			if (canceled === false && filePaths.length) {
				const text = await remote.fs.call('readFileSync', filePaths[0], { encoding: 'utf8' });
				await addLocalScript(filePaths[0], text.toString());
			}
		});
}

async function addLocalScript(uri: string, text: string) {
	if (await remote.fs.call('existsSync', uri)) {
		const metadata = getMetadataFromScript(text);
		if (metadata === undefined) {
			Message.error('脚本格式不正确，请选择能够解析的用户脚本。');
		} else {
			if (store.render.scripts.find((s) => s.url === uri)) {
				Message.warning('当前脚本已安装。');
			} else {
				const id = Date.now();
				store.render.scripts.push({
					id,
					url: uri,
					enable: true,
					isLocalScript: true,
					info: {
						id,
						url: uri,
						code_url: uri,
						ratings: 0,
						total_installs: 0,
						daily_installs: 0,
						createTime: 0,
						updateTime: 0,
						...metadata
					}
				});
			}
		}
	} else {
		Message.warning('文件不存在。');
	}
}

export async function addScriptFromUrl(url: string) {
	if (store.render.scripts.find((s) => s.url === url)) {
		return Message.warning('当前脚本已安装。');
	}

	if (url.startsWith('http')) {
		const text = await remote.methods.call('get', url);
		const metadata = getMetadataFromScript(text);
		if (metadata === undefined) {
			Message.error('脚本格式不正确，请选择能够解析的用户脚本。');
		} else {
			const id = Math.round(Math.random() * 1000000);
			store.render.scripts.push({
				id: id,
				url: url,
				enable: true,
				isLocalScript: false,
				info: {
					id,
					url: url,
					code_url: url,
					ratings: 0,
					total_installs: 0,
					daily_installs: 0,
					createTime: 0,
					updateTime: 0,
					...metadata
				}
			});
		}
	} else {
		Message.error('脚本链接无效，必须是以 http 开头的网络链接。');
	}
}

function getMetadataFromScript(text: string) {
	const metadata = text.match(/\/\/\s+==UserScript==([\s\S]+)\/\/\s+==\/UserScript==/)?.[1] || '';

	if (metadata === '') {
		return undefined;
	} else {
		const metadataList = (metadata.match(/\/\/\s+@(.+?)\s+(.*?)(?:\n|$)/g) || []).map((line) => {
			const words = line.match(/[\S]+/g) || [];
			return {
				key: (words[1] || '').replace('@', ''),
				value: words.slice(2).join(' ')
			};
		});

		// 解析函数
		const getMetadata = (key: string) => {
			return metadataList.filter((l) => l.key === key).map((l) => l.value);
		};

		return {
			authors: getMetadata('author').map((a) => ({ name: a, url: '' })) || [],
			description: getMetadata('description')[0],
			license: getMetadata('license')[0],
			name: getMetadata('name')[0],
			version: getMetadata('version')[0]
		};
	}
}
