import md5 from 'md5';
import { request } from '../../core/utils';
import { logger } from '../../main';
import CXAnalyses from './utils';
import Typr from 'typr.js';
import { useContext } from '../../store';

/**
 * 繁体字识别-字典匹配
 * @see 参考 https://bbs.tampermonkey.net.cn/thread-2303-1-1.html
 */
export async function mapRecognize() {
	const { cx } = useContext();
	// 顶层初始化
	if (window === top) {
		cx.isRecognizing = false;
		logger('debug', '正在加载字典库...');
		// 预加载字体库
		const res = await request('https://cdn.ocsjs.com/resources/font/table.json', {
			type: 'GM_xmlhttpRequest',
			method: 'get',
			contentType: 'json'
		});
		cx.fontMap = res;
		logger('info', '字典库加载成功');
	} else {
		/** 判断是否有繁体字 */
		const fontFaceEl = Array.from(document.head.querySelectorAll('style')).find((style) =>
			style.textContent?.includes('font-cxsecret')
		);
		const fontMap = cx.fontMap;
		if (fontFaceEl) {
			// 解析font-cxsecret字体
			const font = fontFaceEl.textContent?.match(/base64,([\w\W]+?)'/)?.[1];

			if (font) {
				const code = Typr.parse(base64ToUint8Array(font));

				// 匹配解密字体
				const match: any = {};
				for (let i = 19968; i < 40870; i++) {
					// 中文[19968, 40869]
					const Glyph = Typr.U.codeToGlyph(code, i);
					if (!Glyph) continue;
					const path = Typr.U.glyphToPath(code, Glyph);
					const hex = md5(JSON.stringify(path)).slice(24); // 8位即可区分
					match[i.toString()] = fontMap[hex];
				}

				const fonts = CXAnalyses.getSecretFont();
				// 替换加密字体
				fonts.forEach((el, index) => {
					let html = el.innerHTML;
					for (const key in match) {
						const word = String.fromCharCode(parseInt(key));
						const value = String.fromCharCode(match[key]);
						while (html.indexOf(word) !== -1) {
							html = html.replace(word, value);
						}
					}
					el.innerHTML = html;
					el.classList.remove('font-cxsecret'); // 移除字体加密
				});
			}
		}
	}
}

function base64ToUint8Array(base64: string) {
	const data = window.atob(base64);
	const buffer = new Uint8Array(data.length);
	for (let i = 0; i < data.length; ++i) {
		buffer[i] = data.charCodeAt(i);
	}
	return buffer;
}
