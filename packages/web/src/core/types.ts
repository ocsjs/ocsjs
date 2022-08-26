import { File } from './File';
import { Stats } from 'fs';

/**
 * 读写接口
 */
export interface IO {
	/** 读 */
	read(): string | undefined;
	/** 写 */
	write(data: any): void;
}

/**
 * 文件属性
 */
export interface CommonFileProperties {
	name: string;
	basename: string;
	extname: string;
	dirname: string;
	stats: Stats;
	path: string;
}

/**
 * 目录属性
 */
export interface DirectoryProperties {
	parent?: File;
	children: File[];
}

/**
 * 文件接口
 */
export interface CommonFileInterface {
	/** 删除 */
	remove(...args: any[]): void;
	/** 重命名 */
	rename(basename: string, extname: string): this;
	/** 移动 */
	move(dest: File): File;
}

/**
 * 目录接口
 */
export interface DirectoryInterface<Props = File> {
	/** 创建目录 */
	mkdir(name: string): void;
	/** 创建文件 */
	create(basename: string, extname: string, data: any): void;
	/** 展开文件 */
	flat(): Props[];
	/** 查找文件 */
	find(path: string, deep: boolean): Props | undefined;
	/** 查找文件索引 */
	findIndex(path: string): number;
	/** 转换所有子文件 */
	map(handler: (file: Props) => Props): Props[];
	/** 追加文件 */
	append(file: Props): Props;
	/** 删除指定文件 */
	remove(file: Props): this;
	/** 遍历所有子文件 */
	each(handler: (file: Props) => void): this;
}

/** 普通文件类型 */
export type CommonFileType = CommonFileProperties & CommonFileInterface;
/** 目录文件类型 */
export type DirectoryType = DirectoryProperties & DirectoryInterface & CommonFileType;

export interface FileInitOptions {
	/** 文件编码 */
	// eslint-disable-next-line no-undef
	encoding?: BufferEncoding;
	/** 目录置顶 */
	topDirectory?: boolean;
	/** 属性合并 */
	merge: (file: File) => File;
}
