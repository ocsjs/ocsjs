import { appStore } from './src/store';

export { RemoteMethods } from './src/tasks/remote.register';
export type AppStore = typeof appStore;

export interface UserScripts {
	id: number;
	/** 用户脚本链接 */
	url: string;
	/** 用户脚本所执行的文件 */
	runAtFiles: string[];
	/** 是否运行在所有页面 */
	runAtAll: boolean;
	/**
	 * 脚本信息
	 */
	info: any;
}
