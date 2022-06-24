import Store from 'electron-store';
import { getFileInArguments } from './global.listener';

/**
 * 检测是否打开了(.ocs)拓展文件
 */
export function handleOpenFile(argv: any[]) {
	const file = getFileInArguments(argv);
	if (file) {
		const store = new Store();
		/**
		 * 添加新的文件到编辑文件区
		 */
		const files = store.get('files');
		const newFiles = Array.isArray(files) ? Array.from(files).concat(file) : [file];
		store.set('files', newFiles);
	}
}
