import { appStore } from './src/store';

export { RemoteMethods } from './src/tasks/remote.register';
export type AppStore = typeof appStore;

export interface UserScripts {
	id: number;
	/** 用户脚本链接 */
	url: string;
	/** 启动自动安装脚本 */
	enable: boolean;
	/**
	 * 脚本信息
	 */
	info: any;
}
