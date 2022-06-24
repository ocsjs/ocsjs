export class StringUtils {
	_text: string;
	constructor(_text: string) {
		this._text = _text;
	}

	/** 删除换行符 */
	static nowrap(str?: string) {
		return str?.replace(/\n/g, '') || '';
	}

	nowrap() {
		this._text = StringUtils.nowrap(this._text);
		return this;
	}

	/** 删除特殊字符 */
	static noSpecialChar(str?: string) {
		return str?.replace(/[^\w\s]/gi, '') || '';
	}

	noSpecialChar() {
		this._text = StringUtils.noSpecialChar(this._text);
		return this;
	}

	/** 最大长度，剩余显示省略号 */
	static max(str: string, len: number) {
		return str.length > len ? str.substring(0, len) + '...' : str;
	}

	max(len: number) {
		this._text = StringUtils.max(this._text, len);
		return this;
	}

	/** 隐藏字符串 */
	static hide(str: string, start: number, end: number, replacer: string = '*') {
		// 从 start 到 end 中间的字符串全部替换成 replacer
		return str.substring(0, start) + str.substring(start, end).replace(/./g, replacer) + str.substring(end);
	}

	hide(start: number, end: number, replacer: string = '*') {
		this._text = StringUtils.hide(this._text, start, end, replacer);
		return this;
	}

	static of(text: string) {
		return new StringUtils(text);
	}

	toString() {
		return this._text;
	}
}
