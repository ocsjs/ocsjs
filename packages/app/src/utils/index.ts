import { app, dialog } from 'electron';
import path from 'path';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { finished } from 'stream/promises';
import { Logger } from '../logger';
import xlsx from 'xlsx';

const taskLogger = Logger('task');
const logger = Logger('utils');

export async function task(name: string, func: any) {
	const time = Date.now();
	const res = await func();
	taskLogger.info(name, ' 耗时:', Date.now() - time);
	return res;
}

/**
 * 下载文件
 */
export async function downloadFile(fileURL: string, outputURL: string, rateHandler: any) {
	logger.info('downloadFile', fileURL, outputURL);

	const { data, headers } = await axios.get(fileURL, {
		responseType: 'stream'
	});
	const totalLength = parseInt(headers['content-length']);

	let chunkLength = 0;
	data.on('data', (chunk: any) => {
		chunkLength += String(chunk).length;
		const rate = ((chunkLength / totalLength) * 100).toFixed(2);
		rateHandler(parseFloat(rate), totalLength, chunkLength);
	});

	// 创建文件夹
	if (existsSync(path.dirname(outputURL)) === false) {
		mkdirSync(path.dirname(outputURL), { recursive: true });
	}

	const writer = createWriteStream(outputURL);
	data.pipe(writer);
	await finished(writer);
	rateHandler(100, totalLength, totalLength);
}

/**
 * 压缩文件
 */

export function zip(input: string, output: string) {
	return new Promise<void>((resolve, reject) => {
		const zip = new AdmZip();
		zip.addLocalFile(input, './');
		zip.writeZip(output, (err: any) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

/**
 * 解压文件
 */

export function unzip(input: string, output: string) {
	return new Promise<void>((resolve, reject) => {
		const zip = new AdmZip(input);
		zip.extractAllToAsync(output, true, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export function getProjectPath() {
	/** 这里多退出一层是因为打包后是运行在 ./lib 下面的 */
	return app.isPackaged ? app.getAppPath() : path.resolve('./');
}

/**
 * 导出excel
 */
export function exportExcel(excel: { sheetName: string; list: any[] }[], filename: string) {
	dialog
		.showSaveDialog({
			title: '导出Excel',
			defaultPath: filename
		})
		.then(({ canceled, filePath }) => {
			if (!canceled && filePath) {
				const book = xlsx.utils.book_new();
				for (const item of excel) {
					xlsx.utils.book_append_sheet(book, xlsx.utils.json_to_sheet(item.list), item.sheetName);
				}
				xlsx.writeFile(book, filePath);
			}
		});
}
