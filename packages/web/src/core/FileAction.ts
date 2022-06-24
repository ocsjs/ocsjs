import { File } from './File';

/**
 * 文件动作
 */
export interface FileActions {
	/** 读取文件内容 */
	read: (...args: any[]) => string | undefined;
	/** 写入内容到文件 */
	write: (data: string, ...args: any[]) => any;
	/** 重命名 */
	rename: (...args: any[]) => any;
	/** 移除 */
	remove: (...args: any[]) => any;
	/**
	 * 移动到指定目录
	 * @param path 目标目录的路径
	 */
	move: (...args: any[]) => any;
}

/**
 * 文件动作回调类型
 */
export interface FileActionCallbacks {
	read: (file: File, data: string) => void;
	write: (file: File, data: string) => void;
	remove: (file: File) => void;
	rename: (file: File) => void;
	move: (file: File) => any;
}
