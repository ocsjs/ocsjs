import { Logger } from '../logger';
import { getProjectPath, unzip } from '../utils';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { store } from '../store';

const logger = Logger('ocr-unzip');

export let ocr_path = '';

export async function ocrUnzip() {
	logger.log('ocr-unzip', Date.now());
	const parentFolder = app.isPackaged ? path.join(app.getPath('exe'), '../') : getProjectPath();
	try {
		const ocr = path.join(parentFolder, './bin/ocr.zip');
		ocr_path = path.join(store.store.paths.downloadFolder, './ocr');
		if (!fs.existsSync(ocr_path)) {
			await unzip(ocr, ocr_path);
			logger.log('ocr-unzip-finish', Date.now(), ocr_path);
		}
	} catch (err) {
		logger.log('ocr-unzip-error', err);
	}
}
