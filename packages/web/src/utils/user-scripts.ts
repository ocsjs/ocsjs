import { Message } from '@arco-design/web-vue';
import { download } from '.';
import { remote } from './remote';
import { store } from '../store';

/**
 * 添加并且解析本地脚本
 */
export function addScriptFromFile(e: any) {
	const file = e.target.files[0] as File;

	if (file.path.endsWith('.user.js')) {
		remote.fs
			.call('statSync', file.path)
			.then(async (stat) => {
				const text = await remote.fs.call('readFileSync', file.path, { encoding: 'utf8' });
				addLocalScript(file.path, text.toString());
			})
			.catch((err) => {
				Message.error('文件读取失败 : ' + err.message);
			});
	} else {
		Message.error('用户脚本必须以 .user.js 作为文件后缀');
	}

	// 最后删除文件对象，防止选中同一个文件时不执行事件
	e.target.value = '';
}

function addLocalScript(uri: string, text: string) {
	const metadata = text.match(/\/\/\s+==UserScript==([\s\S]+)\/\/\s+==\/UserScript==/)?.[1] || '';

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

	if (metadata === '') {
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
					authors: getMetadata('author').map((a) => ({ name: a, url: '' })) || [],
					description: getMetadata('description')[0],
					license: getMetadata('license')[0],
					name: getMetadata('name')[0],
					version: getMetadata('version')[0],
					code_url: uri,
					ratings: 0,
					total_installs: 0,
					daily_installs: 0,
					createTime: 0,
					updateTime: 0
				}
			});
		}
	}
}

export async function addScriptFromUrl(opts: { name: string; url: string }) {
	const scripts = await remote.path.call('join', store.paths.downloadFolder, './scripts');
	if (!(await remote.fs.call('existsSync', scripts))) {
		await remote.fs.call('mkdirSync', scripts);
	}

	const dest = await remote.path.call('join', scripts, opts.url.split('/').at(-1) || 'script.js');

	await download({
		name: opts.name,
		dest: dest,
		url: opts.url
	});
	const text = await remote.fs.call('readFileSync', dest, { encoding: 'utf8' });

	addLocalScript(dest, text.toString());
}
