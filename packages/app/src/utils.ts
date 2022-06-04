/** 异步任务 */

import axios from 'axios';
import { createWriteStream } from 'fs';
import { finished } from 'stream/promises';
import { Logger } from './logger';

const taskLogger = Logger('task');
const logger = Logger('utils');

export async function task(name: string, func: any) {
  const time = Date.now();
  const res = await func();
  taskLogger.info(name, ' 耗时:', Date.now() - time);
  return res;
};

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
    rateHandler(rate, totalLength, chunkLength);
  });

  const writer = createWriteStream(outputURL);
  data.pipe(writer);
  await finished(writer);
};
