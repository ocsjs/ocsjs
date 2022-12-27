import { Process } from '../utils/process';

export interface Tag {
	/** 标签名字 */
	name: string;
	/** 颜色 */
	color: string;
}

/**
 * 浏览器操作历史记录
 */
export interface BrowserOperateHistory {
	action: '运行' | '重启' | '关闭' | '创建' | '改名' | '添加标签' | '删除标签' | '备注';
	content?: string;
	time: number;
}

export interface Browser {
	uid: string;
	/** 浏览器名 */
	name: string;
	/** 浏览器标签 */
	tags: Tag[];
	/** 浏览器备注 */
	notes: string;
	/** 父文件夹uid */
	parent: string | undefined;
	/** 创建时间 */
	createTime: number;
	/** 缓存路径 */
	cachePath: string;
	renaming: boolean;
	/** 历史 */
	histories: BrowserOperateHistory[];
	/** 是否正在运行 */
	running: boolean;
}

/**
 * 浏览器文件夹
 */
export interface BrowserFolder {
	uid: string;
	/** 文件夹名 */
	name: string;
	/** 父文件夹uid */
	parent: string | undefined;
	/** 子文件夹uid列表 */
	children: string[];
	/** 创建时间 */
	createTime: number;
	renaming: boolean;
}
