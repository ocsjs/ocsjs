import { store } from '../store';
import { ResourceFile, ResourceLoaderOptions } from './apis';
import { remote } from './remote';

/**
 *
 * 资源加载器
 *
 */
export class ResourceLoader {
	resourceRootPath: string;
	constructor(options: ResourceLoaderOptions) {
		this.resourceRootPath = options.resourceRootPath;
	}

	/** 返回本地绝对路径 */
	async getPath(group_name: string, file: ResourceFile) {
		const basename = await remote.path.call('basename', file.url);
		return await remote.path.call('join', this.resourceRootPath, group_name, basename);
	}

	/** 判断是否存在 */
	async isExists(group_name: string, file: ResourceFile) {
		const path = await this.getPath(group_name, file);
		return await remote.fs.call('existsSync', path);
	}

	/** 是否为压缩包文件 */
	isZipFile(file: ResourceFile) {
		return /\.(zip|rar|7z)$/.test(file.url);
	}

	/** 获取解压缩后的文件路径 */
	async getUnzippedPath(group_name: string, file: ResourceFile) {
		const path = await this.getPath(group_name, file);
		const basename = await remote.path.call('basename', path);
		return await remote.path.call('join', this.resourceRootPath, group_name, basename.replace(/\.(zip|rar|7z)$/, ''));
	}

	/** 判断压缩包是否存在 */
	async isZipFileExists(group_name: string, file: ResourceFile) {
		if (this.isZipFile(file)) {
			const path = await this.getUnzippedPath(group_name, file);
			return await remote.fs.call('existsSync', path);
		}
		return false;
	}

	/** 下载资源 */
	async download(group_name: string, file: ResourceFile) {
		const path = await this.getPath(group_name, file);
		// 下载
		await remote.methods.call('download', 'download-file-' + file.name, file.url, path);
	}

	/** 解压资源 */
	async unzip(group_name: string, file: ResourceFile) {
		const path = await this.getPath(group_name, file);

		// 获取压缩包文件名
		const basename = await remote.path.call('basename', path);
		const to = await remote.path.call(
			'join',
			this.resourceRootPath,
			group_name,
			basename.replace(/\.(zip|rar|7z)$/, '')
		);
		await remote.methods.call('unzip', path, to);
		// 删除压缩包
		await remote.fs.call('unlinkSync', path);
	}

	/** 删除资源 */
	async remove(group_name: string, file: ResourceFile) {
		if (this.isZipFile(file)) {
			const path = await this.getUnzippedPath(group_name, file);
			// 删除文件夹所有文件
			await remote.fs.call('rmSync', path, {
				recursive: true
			});
		} else {
			const path = await this.getPath(group_name, file);
			await remote.fs.call('unlinkSync', path);
		}
	}
}

/** 资源加载器 */
export const resourceLoader = new ResourceLoader({
	// 这里要加可选链，在浏览器环境中初始化时 store.paths 为 undefined
	resourceRootPath: store.paths?.downloadFolder
});
