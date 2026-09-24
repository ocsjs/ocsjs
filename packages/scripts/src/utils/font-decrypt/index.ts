/**
 * 字体解密框架（字形置换类加密通用）
 *
 * 【架构说明】
 * 本目录为平台无关的底层框架，各平台（projects/*.ts）只需提供：
 *   1. 字体获取方式（data URI / 网络 URL）
 *   2. 加密元素选择器
 *   3. 对应字重的特征表地址
 * 即可复用同一套解密算法，例如：
 *
 * ```ts
 * import { crackFont, collectChars, decryptElements, extractFontFromStyle } from '../utils/font-decrypt';
 *
 * const buffer = extractFontFromStyle(document, 'font-cxsecret');
 * const els = Array.from(document.querySelectorAll('.font-cxsecret'));
 * const { map } = await crackFont(buffer, collectChars(els), {
 *   refTableUrl: 'https://cdn.ocsjs.com/resources/font/cx.bin'
 * });
 * decryptElements(els, map);
 * ```
 *
 * 【特征表】
 * 不同平台的加密字体可能基于不同字重设计，特征表按字重拆分以减小体积：
 *   - cx.bin   ：wght 350/400 字重（超星 SourceHanSansCN-Normal 设计）
 *   - yuketang.bin ：wght 250 字重（雨课堂 SourceHanSansSC-VF 默认实例）
 * 表为 FRB2 位打包格式（单平台约 0.76MB），由离线脚本一次性生成，
 * 与平台加密方式无关，无需随平台改字体而更新。
 */
export * from './types';
export { loadRefTable } from './ref-table';
export {
	crackChar,
	crackFont,
	decryptText,
	decryptElements,
	collectChars,
	findFontUrls,
	extractFontFromStyle,
	listFontFaces
} from './bitmap';
export type { FontFaceInfo } from './bitmap';
export { FontDecryptor, watchElements } from './decryptor';
export type { WatchController } from './decryptor';
