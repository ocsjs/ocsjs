import { appStore } from './src/store';
import { ScriptWorker } from './src/worker';

export { RemoteMethods } from './src/tasks/remote.register';
export type AppStore = typeof appStore;

export { ScriptWorker };

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
	/** 是否为本地脚本 */
	isLocalScript: boolean;
}
