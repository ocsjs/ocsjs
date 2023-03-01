import { app } from 'electron';
import path from 'path';
import AdmZip from 'adm-zip';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { finished } from 'stream/promises';
import { Logger } from '../logger';

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
	return new Promise<void>((resolve) => {
		const zip = new AdmZip(input);
		zip.extractAllTo(output, true);
		resolve();
	});
}

export function getProjectPath() {
	/** 这里多退出一层是因为打包后是运行在 ./lib 下面的 */
	return app.isPackaged ? app.getAppPath() : path.resolve('./');
}
