import { FileUtils } from './FileUtils';
import { Stats } from 'fs';
import { NodeJS } from '../utils/export';
import { remote } from '../utils/remote';

import { CommonFileType, DirectoryType, FileInitOptions, IO } from './types';

/**
 * 文件对象
 */
export class File implements DirectoryType, CommonFileType, IO {
	// eslint-disable-next-line no-undef
	[x: string]: any;
	private static DEFAULT_ENCODING: 'utf-8' = 'utf-8';
	/** 文件名， 包含 `basename` 和 `extname` */
	name: string;
	basename: string;
	extname: string;
	dirname: string;
	stats: Stats;
	path: string;
	parent?: File;
	children: File[] = [];
	opts?: FileInitOptions;

	private constructor(path: string, parent: File | undefined, opts?: FileInitOptions) {
		this.name = NodeJS.path.basename(path);
		this.extname = NodeJS.path.extname(path);
		this.basename = NodeJS.path.basename(path, this.extname);
		this.dirname = NodeJS.path.dirname(path);
		this.stats = NodeJS.fs.statSync(path);
		this.path = path;
		this.opts = opts;
		this.parent = parent;
	}

	public static from(path: string, parent: File | undefined, opts?: FileInitOptions) {
		let file = new File(path, parent, opts);

		file = opts?.merge(file) || file;

		// 如果是目录，则读取子文件
		if (file.stats.isDirectory()) {
			file.children = NodeJS.fs
				.readdirSync(file.path)
				.map((child) => File.from(NodeJS.path.join(file.path, child), file, file.opts));
			// 排序
			if (opts && opts.topDirectory) {
				file.children.sort((a: File, b: File) => (a.stats.isDirectory() ? -1 : 1));
			}
		}

		return file;
	}

	write(data: string) {
		if (this.stats.isFile()) {
			NodeJS.fs.writeFileSync(this.path, String(data), { encoding: this.opts?.encoding || File.DEFAULT_ENCODING });
		}
		return this;
	}

	/** 读取文件内容 */
	read() {
		if (this.stats.isFile()) {
			return NodeJS.fs.readFileSync(this.path, { encoding: this.opts?.encoding || File.DEFAULT_ENCODING });
		}
	}

	mkdir(name: string): File {
		if (this.stats.isDirectory()) {
			// 目标路径
			const dest = FileUtils.getValidPath(this.path, name, '');
			// 新建目录
			NodeJS.fs.mkdirSync(dest);
			// 添加新建目录
			return this.append(File.from(dest, this, this.opts));
		} else {
			throw new Error('此文件不是目录，不能创建目录以及文件');
		}
	}

	create(basename: string, extname: string, data: any): File {
		if (this.stats.isDirectory()) {
			// 目标路径
			const dest = FileUtils.getValidPath(this.path, basename, extname);
			// 写入文件
			NodeJS.fs.writeFileSync(FileUtils.getValidPath(this.path, basename, extname), String(data));
			// 添加新建文件
			return this.append(File.from(dest, this, this.opts));
		} else {
			throw new Error('此文件不是目录，不能创建目录以及文件');
		}
	}

	flat(): File[] {
		const files: File[] = [];
		this.each((f) => files.push(f));
		return files;
	}

	/**
	 * 查找子文件
	 * @param path 路径
	 * @param deep 深度搜索
	 */
	find(path: string, deep: boolean): File | undefined {
		if (this.stats.isFile()) return undefined;
		const index = this.findIndex(path);
		if (index !== -1) return this.children[index];
		if (deep) {
			for (const child of this.children) {
				const file = child.find(path, deep);
				if (file) return file;
			}
		}
	}

	findIndex(path: string): number {
		if (this.stats.isFile()) return -1;
		return this.children.findIndex((file: File) => file.path === path);
	}

	splice(file: File) {
		const index = this.findIndex(file.path);
		if (index !== -1) {
			file.parent = undefined;
			this.children.splice(index, 1);
		}
		return this;
	}

	/** 过滤子文件 */
	filter(handler: (file: File) => boolean): File[] {
		return this.children.filter((file: File) => {
			file.children = file.filter(handler);
			return handler(file);
		});
	}

	map(handler: (file: File) => File): File[] {
		return this.children.map((file: File) => {
			file.children = file.map(handler);
			return handler(file);
		});
	}

	append(file: File): File {
		file.parent = this;
		this.children.push(file);
		return file;
	}

	remove(file?: File): this {
		remote.methods.call('trash', file ? file.path : this.path);

		if (file) {
			if (this.stats.isDirectory()) {
				this.splice(file);
			} else {
				throw new Error('此文件不是目录，不能移除目录以及文件');
			}
		} else {
			const index = this.parent?.findIndex(this.path);
			if (index !== undefined && index !== -1) {
				this.parent?.children.splice(index, 1);
				this.parent = undefined;
			}
		}

		return this;
	}

	each(handler: (file: File) => void): this {
		this.children.forEach((file: File) => {
			file.each(handler);
		});

		handler(this);
		return this;
	}

	rename(basename: string, extname: string): this {
		const dest = FileUtils.getValidPath(this.dirname, basename, extname);
		this.name = NodeJS.path.basename(dest);
		this.basename = basename;
		this.extname = extname;
		NodeJS.fs.renameSync(this.path, dest);
		this.path = dest;
		return this;
	}

	move(dest: File): this {
		if (dest.stats.isFile()) {
			throw new Error('目标路径不是目录');
		}
		if (dest.find(this.path, false)) {
			throw new Error('此路径下已有同名文件');
		}

		//  文件类型为目录
		if (this.stats.isDirectory()) {
			// 新建目录
			const dir = dest.mkdir(this.name);
			// 移动子文件
			this.children.forEach((file: File) => {
				file.move(dir);
			});
			// 删除本文件
			this.remove();
		} else {
			const filePath = NodeJS.path.join(dest.path, this.name);
			// 移动文件
			NodeJS.fs.renameSync(this.path, filePath);
			// 添加文件
			dest.append(File.from(filePath, dest, dest.opts));

			this.parent?.splice(this);
		}

		return this;
	}
}
