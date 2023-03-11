import { Logger } from '../logger';
import { getProjectPath, unzip } from '../utils';
import path from 'path';
import fs from 'fs';

const logger = Logger('ocr-unzip');

export async function ocrUnzip() {
	logger.log('ocr-unzip', Date.now());
	try {
		const ocr = path.join(getProjectPath(), './bin/ocr.zip');
		const dest = path.join(getProjectPath(), './bin/ocr');
		if (!fs.existsSync(dest)) {
			await unzip(ocr, path.join(getProjectPath(), './bin/ocr'));
			logger.log('ocr-unzip-finish', Date.now());
		}
	} catch (err) {
		logger.log('ocr-unzip-error', err);
	}
}
