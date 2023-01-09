/**
 * 字符串工具库
 */
export const $string = {
	/**
	 * 驼峰转目标字符串
	 * @param value
	 */
	humpToTarget(value: string, target: string) {
		return value
			.replace(/([A-Z])/g, target + '$1')
			.toLowerCase()
			.split(target)
			.slice(1)
			.join(target);
	}
};

export class StringUtils {
	_text: string;
	constructor(_text: string) {
		this._text = _text;
	}

	/** 删除换行符 */
	static nowrap(str?: string) {
		return str?.replace(/\n/g, '') || '';
	}

	/** 删除换行符 */
	nowrap() {
		this._text = StringUtils.nowrap(this._text);
		return this;
	}

	/** 删除空格，多个空格只留一个 */
	static nospace(str?: string) {
		return str?.replace(/ +/g, ' ') || '';
	}

	/** 删除空格，多个空格只留一个 */
	nospace() {
		this._text = StringUtils.nospace(this._text);
		return this;
	}

	/** 删除特殊字符 */
	static noSpecialChar(str?: string) {
		return str?.replace(/[^\w\s]/gi, '') || '';
	}

	/** 删除特殊字符 */
	noSpecialChar() {
		this._text = StringUtils.noSpecialChar(this._text);
		return this;
	}

	/** 最大长度，剩余显示省略号 */
	static max(str: string, len: number) {
		return str.length > len ? str.substring(0, len) + '...' : str;
	}

	/** 最大长度，剩余显示省略号 */
	max(len: number) {
		this._text = StringUtils.max(this._text, len);
		return this;
	}

	/** 隐藏字符串 */
	static hide(str: string, start: number, end: number, replacer: string = '*') {
		// 从 start 到 end 中间的字符串全部替换成 replacer
		return str.substring(0, start) + str.substring(start, end).replace(/./g, replacer) + str.substring(end);
	}

	/** 隐藏字符串 */
	hide(start: number, end: number, replacer: string = '*') {
		this._text = StringUtils.hide(this._text, start, end, replacer);
		return this;
	}

	/**
	 * 根据字符串创建 StringUtils 对象
	 * @param text  字符串
	 */
	static of(text: string) {
		return new StringUtils(text);
	}

	toString() {
		return this._text;
	}
}
