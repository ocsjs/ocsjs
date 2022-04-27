import html2canvas from 'html2canvas';
import Tesseract, { createWorker } from 'tesseract.js';

/**
 * 文字识别
 *
 * @see https://github.com/naptha/tesseract.js
 */
export class OCR {
  /** 初始化语言 */
    lang: string;
    worker: Tesseract.Worker;
    /**
     * 默认加载语言
     * chi_sim: 简体中文
     *
     * 全部语言 : @see https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_lang_list.md
     */
    static DEFAULT_LANG = 'chi_sim'
    /** suit 的默认父元素 */
    static DEFAULT_WRAPPER = 'div'
    /** suit 的默认元素 */
    static DEFAULT_STYLE: Pick<CSSStyleDeclaration, 'padding' | 'fontSize' | 'letterSpacing' | 'lineHeight'> = {
      /** 父元素的内边距 */
      padding: '4px',
      /** 字体大小 */
      fontSize: '32px',
      /** 字体高 */
      lineHeight: '50px',
      /** 文字间距 */
      letterSpacing: '8px'
    }

    constructor(lang?: string) {
      this.lang = lang || OCR.DEFAULT_LANG;
      this.worker = createWorker();
    }

    /**
     * 初始化 ocr 并加载ocr语言
     * @param lang 语言 @see https://github.com/naptha/tesseract.js/blob/master/docs/tesseract_lang_list.md
     */
    async load(lang?: string) {
      await this.worker.load();
      // 加载语言
      await this.worker.loadLanguage(lang || this.lang || OCR.DEFAULT_LANG);
      await this.worker.initialize(lang || this.lang || OCR.DEFAULT_LANG);
    }

    /**
     * 字体适应
     * @param el 元素对象
     * @param style 样式， 默认 {@link OCR.DEFAULT_STYLE}
     */
    public static suit(el:HTMLElement, style?: CSSStyleDeclaration): HTMLElement {
      const { fontSize, letterSpacing, lineHeight } = style || OCR.DEFAULT_STYLE;

      el.style.fontSize = fontSize;
      el.style.letterSpacing = letterSpacing;
      el.style.lineHeight = lineHeight;
      // 使全部文本改变样式
      let nodes = Array.from(el.childNodes);
      while (nodes.length) {
        const node = nodes.shift() as HTMLElement;
        if (node && node.style) {
          node.style.fontSize = fontSize;
          node.style.letterSpacing = letterSpacing;
          node.style.lineHeight = lineHeight;
          nodes = nodes.concat(Array.from(node.childNodes));
        }
      }

      return el;
    }

    /**
     * 解析元素
     */
    async recognize(el: HTMLElement): Promise<string> {
      // 图片转base64
      const canvas = await html2canvas(el);
      // 识别
      const { data: { text } } = await this.worker.recognize(canvas.toDataURL());
      return text.replace(/ /g, '');
    }

    /** 关闭识别，释放内存 */
    async terminate() {
      // 结束
      await this.worker.terminate();
    }
}
