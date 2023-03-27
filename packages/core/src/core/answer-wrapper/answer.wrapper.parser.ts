import { AnswererWrapper } from './interface';
import { request } from '../utils/request';

/**
 * 解析题库配置 数据来源可以是 url , base64 , json , json-string
 */
export class AnswerWrapperParser {
	/** 从 json 字符串中解析 */
	static fromObject(json: any): AnswererWrapper[] {
		const aw: AnswererWrapper[] = json;

		if (aw && Array.isArray(aw)) {
			if (aw.length) {
				for (let i = 0; i < aw.length; i++) {
					const item = aw[i];
					if (typeof item.name !== 'string') {
						throw new Error(`第 ${i + 1} 个题库的 名字(name) 为空`);
					}
					if (typeof item.url !== 'string') {
						throw new Error(`第 ${i + 1} 个题库的 接口地址(url) 为空`);
					}
					if (typeof item.handler !== 'string') {
						throw new Error(`第 ${i + 1} 个题库的 解析器(handler) 为空`);
					}
					if (item.headers && typeof item.headers !== 'object') {
						throw new Error(`第 ${i + 1} 个题库的 头部信息(header) 应为 对象 格式`);
					}
					if (item.data && typeof item.data !== 'object') {
						throw new Error(`第 ${i + 1} 个题库的 提交数据(data) 应为 对象 格式`);
					}
					const contentTypes = ['json', 'text'] as AnswererWrapper['contentType'][];
					if (item.contentType && contentTypes.every((i) => i !== item.contentType)) {
						throw new Error(`第 ${i + 1} 个题库的 contentType 必须为以下选项中的一个  ${contentTypes.join(', ')}`);
					}
					const methods = ['post', 'get'] as AnswererWrapper['method'][];
					if (item.method && methods.every((i) => i !== item.method)) {
						throw new Error(`第 ${i + 1} 个题库的 method 必须为以下选项中的一个  ${methods.join(', ')}`);
					}
					const types = ['fetch', 'GM_xmlhttpRequest'] as AnswererWrapper['type'][];
					if (item.type && types.every((i) => i !== item.type)) {
						throw new Error(`第 ${i + 1} 个题库的 type 必须为以下选项中的一个  ${types.join(', ')}`);
					}
				}
				return aw;
			} else {
				throw new Error('题库为空！');
			}
		} else {
			throw new Error('题库配置格式错误！');
		}
	}

	static fromJSONString(json: string) {
		const raw = json.toString();
		try {
			return JSON.parse(raw);
		} catch {
			throw new Error(`格式错误，必须为：json字符串 或 题库配置链接`);
		}
	}

	/** 从 url 中解析 */
	static async fromURL(url: string) {
		const text = await request(url, {
			responseType: 'text',
			method: 'get',
			type: 'fetch'
		});
		return this.fromJSONString(text);
	}

	/** 从 base64 解析 */
	static fromBase64(base64: string) {
		return this.fromJSONString(Buffer.from(base64, 'base64').toString('utf8'));
	}

	/**
	 * 解析题库配置 数据来源可以是 url , base64 , json , json-string
	 */
	static from(value: any): AnswererWrapper[] | Promise<AnswererWrapper[]> {
		if (typeof value === 'string') {
			if (value.startsWith('http')) {
				return this.fromURL(value);
			} else {
				return this.fromJSONString(value);
			}
		} else {
			return this.fromObject(value);
		}
	}
}
