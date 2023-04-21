import { nextTick } from 'vue';
import { store } from '../store';
import { Process, processes } from '../utils/process';
import { resetSearch } from '../utils/entity';
import { router } from '../route';
import { Entity } from './entity';
import { Folder, root } from './folder';
import { BrowserOptions, BrowserOperateHistory, Tag, BrowserType, EntityOptions } from './interface';
import { remote } from '../utils/remote';
import { RawPlaywrightScript } from '../components/playwright-scripts';
import { child_process } from '../utils/node';

export class Browser extends Entity implements BrowserOptions {
	type: BrowserType;
	tags: Tag[];
	notes: string;
	checked: boolean;
	cachePath: string;
	histories: BrowserOperateHistory[];
	parent: string;
	playwrightScripts: RawPlaywrightScript[];

	constructor(opts: BrowserOptions & EntityOptions) {
		super(opts);
		this.type = 'browser';
		this.tags = opts.tags;
		this.notes = opts.notes;
		this.checked = opts.checked;
		this.cachePath = opts.cachePath;
		this.histories = opts.histories;
		this.parent = opts.parent;
		this.playwrightScripts = opts.playwrightScripts;
	}

	/**
	 *	获取浏览器文件
	 */
	static from(uid: string) {
		return root().find('browser', uid);
	}

	/** 启动浏览器 */
	async launch() {
		const process = new Process(this, {
			executablePath: store.render.setting.launchOptions.executablePath,
			headless: false
		});
		processes.push(process);
		const reactiveProcess = Process.from(this.uid);
		if (reactiveProcess) {
			await reactiveProcess.init(console.log);
			await reactiveProcess.launch();
		}

		this.histories.unshift({ action: '运行', time: Date.now() });
	}

	/**
	 * 仅启动浏览器，不执行其他操作
	 * 适用于模拟更真实的浏览器环境
	 */
	async onlyLaunch() {
		const extensionPaths: string[] = [];
		// @ts-ignore
		const paths: string[] = await remote.fs.call('readdirSync', store.paths.extensionsFolder);

		for (const file of paths) {
			extensionPaths.push(await remote.path.call('join', store.paths.extensionsFolder, file));
		}
		const cmd = ` "${store.render.setting.launchOptions.executablePath}" ${[
			'--window-position=0,0',
			'--no-first-run',
			'--no-default-browser-check',
			`--user-data-dir=${this.cachePath}`
		]
			.concat(formatExtensionArguments(extensionPaths))
			.join(' ')} http://localhost:${store.server.port || 15319}/index.html#/bookmarks`;
		console.log(cmd);
		child_process.exec(cmd);
	}

	/** 重启浏览器 */
	async relaunch() {
		const process = Process.from(this.uid);
		await process?.close();
		/**
		 * 因为 process.close 会杀死进程，并删除 process 实例
		 * 所以重新创建 process 实例并启动
		 */
		await this.launch();
	}

	/** 关闭浏览器 */
	async close() {
		const process = Process.from(this.uid);
		await process?.close();
		this.histories.unshift({ action: '关闭', time: Date.now() });
	}

	/** 置顶浏览器 */
	bringToFront() {
		const process = Process.from(this.uid);
		process?.bringToFront();
	}

	location(): void {
		// 进入列表页
		router.push('/');
		// 关闭搜索模式
		resetSearch();
		// 设置当前文件夹
		store.render.browser.currentFolderUid = this.parent;
		nextTick(() => {
			store.render.browser.currentBrowserUid = this.uid;
			this.select();
		});
	}

	select(): void {
		store.render.browser.currentBrowserUid = this.uid;
	}

	async remove() {
		// 如果在运行，关闭当前浏览器
		const process = Process.from(this.uid);
		if (process) {
			await process.close();
		}

		const parent = Folder.from(this.parent);
		Reflect.deleteProperty(parent?.children || {}, this.uid);

		const exists = await remote.fs.call('existsSync', this.cachePath);
		if (exists) {
			// 删除本地缓存
			await remote.fs.call('rmSync', this.cachePath, { recursive: true });
		}
	}

	rename(name: string): void {
		if (this.name !== name) {
			this.histories.unshift({ action: '改名', content: `${this.name} => ${name}`, time: Date.now() });
		}
		this.name = name;
		this.renaming = false;
	}
}

function formatExtensionArguments(extensionPaths: string[]) {
	const paths = extensionPaths.map((p) => p.replace(/\\/g, '/')).join(',');
	return [`--disable-extensions-except=${paths}`, `--load-extension=${paths}`];
}
