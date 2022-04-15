import { ElementHandle, Page } from 'playwright';
import { ocr, OCROptions } from './ocr';

/**
 * 破解验证码
 * @param page 页面
 * @param ocrOptions ocr 参数
 * @returns
 */
export async function breakCode (page: Page, target: string | ElementHandle, ocrOptions: OCROptions) {
  let el;
  if (typeof target === 'string') {
    el = await page.$(target);
  } else {
    el = target;
  }
  if (el) {
    const box = await el.boundingBox();
    if (box) {
      const buffer = await page.screenshot({ clip: box });

      if (buffer) {
        return await ocr(buffer, ocrOptions);
      }
    }
  }
  return undefined;
}
