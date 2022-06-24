import { LaunchScriptsOptions } from '@ocsjs/scripts';
import { message, Modal } from 'ant-design-vue';
import { h, markRaw } from 'vue';
import { config } from '../../config';
import { File } from '../../core/File';
import { openedFiles, store } from '../../store';
import { jsonLint, sleep } from '../../utils';
import { NodeJS } from '../../utils/export';
import Description from '../Description.vue';
import { ITerminal } from '../terminal';
import { Process } from '../terminal/process';
import { fileData, FileData } from './data';

/** 文件节点状态 */
export interface FileStats {
	createTime: number;
	modifyTime: number;
	/** 是否为文件夹 */
	isDirectory: boolean;
	/** 是否为文件 */
	isFile: boolean;
	/** 是否显示 */
	show: boolean;
	/** 是否正在打开编辑 */
	opened: boolean;
	/** 是否运行中 */
	running: boolean;
	/** 重命名中 */
	renaming: boolean;
}

/**
 * 文件节点
 */
export interface FileNode {
	/** 文件名 */
	title: string;
	uid: string;
	/** 文件内容 */
	content: string;
	/** 文件解析 */
	options?: LaunchScriptsOptions;
	/** 文件是否解析错误 */
	error?: {
		message: string;
		line: number;
	};

	/** 文件信息 */
	stat: FileStats;
	/** 文件路径 */
	path: string;
	/** 父目录 */
	parent: string;
	/** 子文件 */
	children?: FileNode[];
	/** 进程对象 */
	process?: Process;
	/** 控制台对象 */
	xterm?: ITerminal;

	/** 以下是 TreeNodeItem 字段 */

	slots: {
		icon: string;
	};
}

/**
 * 获取可用文件名
 * @param rootPath 父目录
 * @param name 名字模板, 例如 新建文件夹($count) , $count - 序号占位符
 */
export function validFileName(rootPath: string, name: string) {
	if (!name.includes('$count')) throw new Error('名字模板未带有序号占位符 - $count');
	let count = 0;
	let p = '';
	while (true) {
		p = NodeJS.path.resolve(rootPath, name.replace('($count)', count++ === 0 ? '' : `(${count})`));
		if (!NodeJS.fs.existsSync(p)) {
			break;
		}
	}
	return p;
}

/**
 * 提供文件遍历操作
 * @param files 文件源
 * @param handlers 处理器
 */
export function loopFiles(files: FileNode[], ...handlers: { (files: FileNode[]): FileNode[] }[]) {
	for (const handler of handlers) {
		files = handler(files);
	}

	for (const file of files) {
		if (file.children) {
			for (const handler of handlers) {
				file.children = handler(file.children);
			}
			loopFiles(file.children, ...handlers);
		}
	}

	return files;
}

/**
 * 扁平化目录结构
 * @param files 文件源
 */
export function flatFiles(files: FileNode[]): FileNode[] {
	let _files: FileNode[] = Array.from(markRaw(files));
	const flat = [] as FileNode[];
	while (_files.length !== 0) {
		const file = _files.shift();
		if (file) {
			if (file.children) {
				_files = _files.concat(file.children);
			}
			flat.push(file);
		}
	}

	return flat;
}

/**
 * 在 parent 下创建文件
 * @param parent
 */
export function createFile(parentPath: string, uid?: string) {
	const newFilePath = validFileName(parentPath, '新建OCS文件($count).ocs');
	NodeJS.fs.writeFileSync(newFilePath, config.ocsFileTemplate(uid));
}

/**
 * 在 parent 下创建文件夹
 * @param parent
 */
export function mkdir(parentPath: string) {
	const newDirPath = validFileName(parentPath, '新建文件夹($count)');
	NodeJS.fs.mkdirSync(newDirPath);
}

/**
 * 显示详情属性
 * @param file 文件节点
 */
export function detail(file: FileNode) {
	Modal.info({
		title: () => '文件属性',
		mask: false,
		closable: true,
		maskClosable: true,
		okText: '确定',
		width: 500,
		content: () =>
			h('div', {}, [
				desc('uid', file.uid),
				desc('文件名', file.title),
				desc('位置', file.path),
				desc('创建时间', new Date(file.stat.createTime).toLocaleString()),
				desc('最近修改', new Date(file.stat.modifyTime).toLocaleString())
			])
	});

	function desc(label: string, desc: string) {
		return h(Description, { label, desc });
	}
}

/**
 * 检验文件格式
 */
export function validFileContent(content: string) {
	const result = jsonLint(content);

	if (result) {
		return {
			error: {
				message: `Unexpected token ${result.token} in JSON at line ` + result.line,
				line: result.line
			}
		};
	} else {
		if (typeof JSON.parse(content) !== 'object') {
			return {
				error: {
					message: '错误的OCS文件格式, 请勿创建除了 (.ocs) 以外的任何文件, 软件将不会解析',
					line: 1
				}
			};
		}
		return content;
	}
}

/**
 * 显示文件
 */
export function showFile(file: File) {
	openedFiles.set(file.path, file);
	// 显示当前文件
	store.currentKey = file.path;
	// 选择当前文件
	store.selectedKeys = [file.path];
}

/**
 * 关闭文件
 */
export function closeFile(file: File) {
	// 关闭状态
	const data = fileData.get(file.path);
	if (data) {
		data.stat.running = false;
		data.process.close();
		data.xterm.clear();
	}

	// 打开的文件中删除
	openedFiles.delete(file.path);
	// 将编辑的文件跳转至最后一个
	store.currentKey = Array.from(openedFiles.keys()).at(-1) || '';
}

/** 运行文件 */
export async function startup(fileDataList: FileData[], period: number = 3000) {
	if (!store.script.launchOptions.executablePath) {
		return message.error('请前往 “设置” -> 指定浏览器 , 设置您的默认浏览器。');
	}
	if (fileDataList.some((f) => f.options?.init) && store.userScripts.length === 0) {
		return message.warn('请前往 “用户脚本” 搜索网络脚本，添加脚本到本地。');
	}

	for (const data of fileDataList) {
		if (data.file.stats.isFile() && data.stat.running === false) {
			// 标记运行
			data.stat.running = true;
			// 显示文件
			showFile(data.file);
			if (data.options) {
				/** 如未初始化控制台面板，则先初始化 */
				if (data.process.shell === undefined) {
					await data.process.init(data.xterm);
				}
				/** 运行 */
				data.process.launch(data.options);
			}

			await sleep(period);
		}
	}
}
