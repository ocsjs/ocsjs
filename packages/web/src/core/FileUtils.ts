import { NodeJS } from '../utils/export';

export class FileUtils {
	/**
	 * 获取可用文件名
	 * @param dir 文件夹路径
	 * @param filename 文件名
	 * @param extname 后缀名
	 *
	 * @example
	 *
	 * getValidPath('D://','新建文件','.txt') // D://新建文件(x).txt
	 */
	static getValidPath(dir: string, filename: string, extname: string) {
		let valid = NodeJS.path.join(dir, filename + extname);
		let count = 1;
		while (NodeJS.fs.existsSync(valid)) {
			valid = NodeJS.path.join(dir, `${filename}(${count++})${extname}`);
		}
		return valid;
	}
}
