import { nextTick, reactive } from 'vue';
import { store } from '../store';
import { Process, processes } from '../utils/process';
import { resetSearch } from '../utils/entity';
import { router } from '../route';
import { Entity } from './entity';
import { Folder, root } from './folder';
import { BrowserOptions, BrowserOperateHistory, Tag, BrowserType, EntityOptions } from './interface';
import { remote } from '../utils/remote';

export class Browser extends Entity implements BrowserOptions {
	type: BrowserType;
	tags: Tag[];
	notes: string;
	checked: boolean;
	cachePath: string;
	histories: BrowserOperateHistory[];
	parent: string;
	store: Record<string, any> = reactive({});

	constructor(opts: BrowserOptions & EntityOptions) {
		super(opts);
		this.type = 'browser';
		this.tags = opts.tags;
		this.notes = opts.notes;
		this.checked = opts.checked;
		this.cachePath = opts.cachePath;
		this.histories = opts.histories;
		this.parent = opts.parent;
		this.store = opts.store;
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

	/** 重启浏览器 */
	async relaunch() {
		const process = Process.from(this.uid);
		process?.emit('relaunching');
		this.histories.unshift({ action: '重启', time: Date.now() });
		await process?.close();
		await process?.launch();
		process?.emit('relaunched');
	}

	/** 关闭浏览器 */
	async close() {
		const process = Process.from(this.uid);
		await process?.close();

		const index = processes.findIndex((p) => p.uid === this.uid);
		if (index !== -1) {
			processes.splice(index, 1);
		}

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
