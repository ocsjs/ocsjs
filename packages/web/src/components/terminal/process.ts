import { LaunchScriptsOptions } from '@ocsjs/scripts';
import { ChildProcess } from 'child_process';
import { ITerminal } from '.';
import { message } from 'ant-design-vue';
import { remote } from '../../utils/remote';
import { store } from '../../store';
import { NodeJS } from '../../utils/export';

const childProcess = require('child_process') as typeof import('child_process');

/**
 * 运行进程
 */
export class Process {
	shell: ChildProcess | undefined;
	launched: boolean = false;
	options?: LaunchScriptsOptions;
	uid: string;
	logsPath: string;
	screenshots: any[] = [];

	constructor(uid: string, logsPath: string) {
		this.uid = uid;
		this.logsPath = logsPath;
	}

	/**
	 * 使用 child_process 运行 ocs 命令
	 */
	async init(xterm: ITerminal) {
		const target = NodeJS.path.join(await remote.app.call('getAppPath'), './script.js');
		process.env.store = JSON.stringify(store);
		const shell = childProcess.fork(target, {
			stdio: ['ipc'],
			env: process.env
		});
		shell.stdout?.on('data', (data: any) => xterm.write(data));
		shell.stderr?.on('data', (data: any) => remote.logger.call('error', String(data)));
		shell.on('message', (message: any) => {
			if (message.action === 'screenshot') {
				this.screenshots = message.data;
			}
		});
		this.shell = shell;

		/** 读取拓展路径 */
		const extensionsFolder = NodeJS.path.join(store['user-data-path'], './extensions');
		store.extensionsPaths = NodeJS.fs
			.readdirSync(extensionsFolder)
			.map((file) => NodeJS.path.join(extensionsFolder, file));
		// 初始化进程数据
		this.shell?.send(
			JSON.stringify({
				init: true,
				data: store,
				uid: this.uid
			})
		);
	}

	/**
	 * 给子进程发送信息
	 * @param action 事件名
	 * @param data 数据
	 */
	send(action: string, data: any) {
		console.log('process send :', { action, data });
		this.shell?.send(
			JSON.stringify({
				action,
				data: data,
				uid: this.uid,
				logsPath: this.logsPath
			})
		);
	}

	/** 启动文件 */
	launch(options: LaunchScriptsOptions) {
		const opts: LaunchScriptsOptions = JSON.parse(JSON.stringify(options));

		/** 解析默认字段 */
		opts.launchOptions.executablePath =
			opts.launchOptions.executablePath === 'default'
				? store.script.launchOptions.executablePath
				: opts.launchOptions.executablePath;

		opts.userScripts = store.userScripts.filter((s) => s.runAtAll || s.runAtFiles.includes(this.uid));

		this.send('launch', opts);
		this.launched = true;
		this.options = opts;
	}

	/** 关闭进程 */
	close() {
		this.send('close', undefined);
		this.launched = false;
	}

	/** 显示当前的浏览器  */
	bringToFront() {
		if (this.launched && this.options) {
			childProcess.exec(
				`"${this.options.launchOptions.executablePath}" --user-data-dir="${this.options.userDataDir}" "about:blank"`
			);
		} else {
			message.warn('必须先启动文件');
		}
	}
}
