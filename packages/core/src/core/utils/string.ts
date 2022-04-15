import { Rating, findBestMatch } from 'string-similarity';

/**
 * 删除特殊字符，只保留英文，数字，中文
 * @param str
 * @returns
 */
export function clearString (str: string, ...exclude: string[]) {
  return str
    .trim()
    .toLocaleLowerCase()
    .replace(RegExp(`[^\\u4e00-\\u9fa5A-Za-z0-9${exclude.join('')}]*`, 'g'), '');
}

/**
 * 答案相似度匹配 , 返回相似度对象列表 Array<{@link Rating}>
 *
 * 相似度计算算法 : https://www.npmjs.com/package/string-similarity
 *
 * @param answers 答案列表
 * @param options 选项列表
 *
 *
 * @example
 *
 * ```js
 *
 * answerSimilar( ['3'], ['1+2','3','4','错误的例子'] ) // [0, 1, 0, 0]
 *
 * answerSimilar( ['hello world','console.log("hello world")'], ['console.log("hello world")','hello world','1','错误的例子'] ) // [1, 1, 0, 0]
 *
 * ```
 *
 */
export function answerSimilar (answers: string[], options: string[]): Rating[] {
  answers = answers.map(removeRedundant);
  options = options.map(removeRedundant);

  const similar =
    answers.length !== 0
      ? options.map((option) => findBestMatch(option, answers).bestMatch)
      : options.map((opt) => ({ rating: 0, target: '' } as Rating));

  return similar;
}

/**
 * 删除题目选项中开头的冗余字符串
 */
export function removeRedundant (str: string) {
  return str?.trim().replace(/[A-Z]{1}[^A-Za-z0-9\u4e00-\u9fa5]+([A-Za-z0-9\u4e00-\u9fa5]+)/, '$1') || '';
}

export class StringUtils {
  _text: string
  constructor (_text: string) {
    this._text = _text;
  }

  /** 删除换行符 */
  static nowrap (str?: string) {
    return str?.replace(/\n/g, '') || '';
  }

  nowrap () {
    this._text = StringUtils.nowrap(this._text);
    return this;
  }

  /** 删除特殊字符 */
  static noSpecialChar (str?: string) {
    return str?.replace(/[^\w\s]/gi, '') || '';
  }

  noSpecialChar () {
    this._text = StringUtils.noSpecialChar(this._text);
    return this;
  }

  /** 最大长度，剩余显示省略号 */
  static max (str: string, len: number) {
    return str.length > len ? str.substring(0, len) + '...' : str;
  }

  max (len: number) {
    this._text = StringUtils.max(this._text, len);
    return this;
  }

  /** 隐藏字符串 */
  static hide (str: string, start: number, end: number, replacer: string = '*') {
    // 从 start 到 end 中间的字符串全部替换成 replacer
    return str.substring(0, start) + str.substring(start, end).replace(/./g, replacer) + str.substring(end);
  }

  hide (start: number, end: number, replacer: string = '*') {
    this._text = StringUtils.hide(this._text, start, end, replacer);
    return this;
  }

  static of (text: string) {
    return new StringUtils(text);
  }

  toString () {
    return this._text;
  }
}
