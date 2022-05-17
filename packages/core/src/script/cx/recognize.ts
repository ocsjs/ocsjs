import md5 from 'md5';
import { Typr, TyprU } from 'typr-ts';
import { request } from '../../core/utils';
import { logger, OCR, store } from '../../main';
import CXAnalyses from './utils';

/**
 * 繁体字识别-字典匹配
 * @see 参考 https://bbs.tampermonkey.net.cn/thread-2303-1-1.html
 */
export async function mapRecognize() {
  // 顶层初始化
  if (window === top) {
    store.isRecognizing = false;
    logger('debug', '正在加载字典库...');
    // 预加载字体库
    const res = await request('https://cdn.ocs.enncy.cn/resources/font/table.json', {
      type: 'fetch',
      method: 'get',
      contentType: 'json'
    });
    store.fontMap = res;
    logger('info', '字典库加载成功');
  } else {
    /** 判断是否有繁体字 */
    const fontFaceEl = Array.from(document.head.querySelectorAll('style')).find((style) => style.textContent?.includes('font-cxsecret'));
    const fontMap = store.fontMap;
    if (fontFaceEl) {
      // 解析font-cxsecret字体
      const font = fontFaceEl.textContent?.match(/base64,([\w\W]+?)'/)?.[1];

      if (font) {
        const code = Typr.parse(base64ToUint8Array(font));

        // 匹配解密字体
        const match: any = {};
        for (let i = 19968; i < 40870; i++) { // 中文[19968, 40869]
          const Glyph = TyprU.codeToGlyph(code, i);
          if (!Glyph) continue;
          const path = TyprU.glyphToPath(code, Glyph);
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
            html = html.replaceAll(word, value);
          }
          el.innerHTML = html;
          el.classList.remove('font-cxsecret'); // 移除字体加密
        });
      }
    }
  }
}
/** 繁体字识别-OCR文字识别 */
export async function ocrRecognize() {
  const ocr = new OCR({
    langPath: 'https://cdn.ocs.enncy.cn/resources/tessdata',
    corePath: 'https://cdn.ocs.enncy.cn/resources/tesseract/tesseract-core.wasm.js',
    workerPath: 'https://cdn.ocs.enncy.cn/resources/tesseract/worker.min.js'
  });

  // 顶层初始化
  if (window === top) {
    store.isRecognizing = false;
    logger('debug', '加载文字识别功能, 如果是初始化请耐心等待..., 大约需要下载20mb的数据文件');
    // 预加载
    await ocr.load();
    logger('info', '文字识别功能加载成功');
  }

  const fonts = CXAnalyses.getSecretFont();
  if (fonts.length) {
    logger('info', '文字识别功能启动');
    store.isRecognizing = true;
    // 加载
    await ocr.load();
    for (let i = 0; i < fonts.length; i++) {
      try {
        // 识别
        const text = await ocr.recognize(OCR.suit(fonts[i]));
        // 改变文本
        fonts[i].innerText = text;
        // 复原样式
        OCR.unsuit(fonts[i]);
      } catch (e) {
        logger('error', '文字识别功能出错,可能存在图片无法识别。', e);
        console.log('文字识别错误', e);
      }
    }

    store.isRecognizing = false;
    logger('info', '文字识别完成');
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
