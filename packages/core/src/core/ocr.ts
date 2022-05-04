import domtoimage from 'dom-to-image';

import Tesseract, { createWorker } from 'tesseract.js';

/**
 * 文字识别
 *
 * @see https://github.com/naptha/tesseract.js
 */
export class OCR {
  worker: Tesseract.Worker;
  /**
   * 默认加载语言
   * chi_sim: 简体中文
   *
   * 全部语言 : @see https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_lang_list.md
   */
  static DEFAULT_LANG = 'eng+chi_sim'
  /** suit 的默认父元素 */
  static DEFAULT_WRAPPER = 'div'
  /** suit 的默认元素 */
  static DEFAULT_STYLE: Pick<CSSStyleDeclaration, 'padding' | 'fontSize' | 'letterSpacing' | 'lineHeight' | 'fontWeight'> = {
    /** 父元素的内边距 */
    padding: '12px',
    /** 字体大小 */
    fontSize: '36px',
    /** 字体高 */
    lineHeight: '48px',
    /** 文字间距 */
    letterSpacing: '8px',
    /** 字体大小 */
    fontWeight: 'bold'
  }

  constructor(options: Partial<Tesseract.WorkerOptions> = {}) {
    this.worker = createWorker(options);
  }

  /**
   * 初始化 ocr 并加载ocr语言
   * @param lang 语言 @see https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_lang_list.md
   */
  async load(lang?: string) {
    await this.worker.load();
    // 加载语言
    await this.worker.loadLanguage(lang || OCR.DEFAULT_LANG);
    await this.worker.initialize(lang || OCR.DEFAULT_LANG);
  }

  /**
   * 字体适应
   * @param el 元素对象
   * @param style 样式， 默认 {@link OCR.DEFAULT_STYLE}
   */
  public static suit(el: HTMLElement, style?: CSSStyleDeclaration): HTMLElement {
    this.changeStyle(el, style);
    // 使全部文本改变样式
    let nodes = Array.from(el.childNodes);
    while (nodes.length) {
      const node = nodes.shift() as HTMLElement;
      if (node && node.style) {
        this.changeStyle(node, style);
        nodes = nodes.concat(Array.from(node.childNodes));
      }
    }
    return el;
  }

  /**
   * 还原样式
   */
  public static unsuit(el: HTMLElement) {
    this.restoreStyle(el);
    // 使全部文本还原样式
    let nodes = Array.from(el.childNodes);
    while (nodes.length) {
      const node = nodes.shift() as HTMLElement;
      if (node && node.style) {
        this.restoreStyle(node);
        nodes = nodes.concat(Array.from(node.childNodes));
      }
    }

    return el;
  }

  /**
   * 更改样式
   */
  private static changeStyle(el: HTMLElement, style?: CSSStyleDeclaration) {
    const { fontSize, letterSpacing, lineHeight, fontWeight } = style || OCR.DEFAULT_STYLE;
    // @ts-ignore
    el.__fontSize__ = el.style.fontSize || 'inherit';
    // @ts-ignore
    el.__letterSpacing__ = el.style.letterSpacing || 'inherit';
    // @ts-ignore
    el.__lineHeight__ = el.style.lineHeight || 'inherit';
    // @ts-ignore
    el.__fontWeight__ = el.style.fontWeight || 'inherit';

    el.style.fontWeight = fontWeight;
    el.style.fontSize = fontSize;
    el.style.letterSpacing = letterSpacing;
    el.style.lineHeight = lineHeight;
  }

  /**
   * 复原样式
   */
  private static restoreStyle(el: HTMLElement) {
    // @ts-ignore
    if (el.__fontSize__) el.style.fontSize = el.__fontSize__;
    // @ts-ignore
    if (el.__letterSpacing__) el.style.letterSpacing = el.__letterSpacing__;
    // @ts-ignore
    if (el.__lineHeight__) el.style.lineHeight = el.__lineHeight__;
    // @ts-ignore
    if (el.__fontWeight__) el.style.fontWeight = el.__fontWeight__;
    // @ts-ignore
    delete el.__fontSize__;
    // @ts-ignore
    delete el.__letterSpacing__;
    // @ts-ignore
    delete el.__lineHeight__;
    // @ts-ignore
    delete el.__fontWeight__;
  }

  /**
   * 解析元素
   */
  async recognize(el: HTMLElement): Promise<string> {
    // 图片转base64
    const base64 = await domtoimage.toPng(el);
    // 识别
    const { data: { text } } = await this.worker.recognize(base64);
    return text.replace(/\n/g, '').replace(/([^ ]) /g, '$1');
  }

  /** 关闭识别，释放内存 */
  async terminate() {
    // 结束
    await this.worker.terminate();
  }
}
