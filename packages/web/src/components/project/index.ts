import { reactive } from 'vue';
import { NodeJS } from '../../utils/export';
import { FileNode, validFileContent } from '../file/File';

export class Project {
	path: string;
	title: string = '未命名';
	node: FileNode;

	constructor(title: string, path: string, node?: FileNode) {
		if (NodeJS.fs.statSync(path).isDirectory() === false) {
			throw Error('项目路径应该为文件夹路径！');
		}
		this.title = title;
		this.path = path;
		this.node = reactive(node || Project.createFileNode(path));
		/** 深层监听文件，如果文件有改变则更新 */
		this.watchDirectory(this.node);
	}

	/** 创建文件节点 */
	static createFileNode(filePath: string): FileNode {
		const stat = NodeJS.fs.statSync(filePath);
		const isDirectory = stat.isDirectory();
		let children;
		let content;
		let icon;
		let options;
		let error;
		if (isDirectory) {
			icon = 'dir';
			children = NodeJS.fs
				.readdirSync(filePath)
				.map((childFilePath) => this.createFileNode(NodeJS.path.resolve(filePath, childFilePath)))
				.filter((f) => !!f)
				/** 文件夹置顶 */
				.sort((a, b) => (a.stat?.isDirectory ? -1 : 1));
			content = '';
		} else {
			icon = 'file';
			content = NodeJS.fs.readFileSync(filePath).toString();

			/** 解析文件内容 */
			const result = validFileContent(content);

			if (typeof result === 'string') {
				options = JSON.parse(result);
			} else {
				error = result.error;
			}
		}

		const parent = NodeJS.path.dirname(filePath);

		return {
			title: NodeJS.path.basename(filePath),
			uid: options?.uid,
			content,
			options,
			error,
			slots: {
				icon
			},
			stat: {
				isDirectory,
				isFile: !isDirectory,
				createTime: stat.birthtimeMs,
				modifyTime: stat.ctimeMs,
				show: false,
				opened: false,
				running: false,
				renaming: false
			},
			parent,
			path: filePath,
			children: children
		};
	}

	/** 监听项目，如果发生变化。则重新渲染子目录 */
	watchDirectory(dir: FileNode) {
		NodeJS.fs.watch(dir.path, { recursive: true }, (e, f) => {
			Object.assign(this.node, Project.createFileNode(dir.path));
			console.log('update', this.node);
		});
	}

	public static create(title: string, path: string, node?: FileNode) {
		return new Project(title, path, node);
	}
}
