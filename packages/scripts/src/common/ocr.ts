import axios from 'axios';

export interface OCROptions {
	username: string;
	password: string;
	typeid?: string;
}

const API_URL = 'http://api.ttshitu.com/predict';

/**
 * ocr 文字识别
 * - `buffer` 流数据
 * - `account` 账号
 * - `password` 密码
 * - `typeid` 类型
 * ```
 * 1 : 纯数字
 * 1001：纯数字2
 * 2 : 纯英文
 * 1002：纯英文2
 * 3 : 数英混合
 * ```
 * @see https://ttshitu.com/
 */
export async function ocr(
	buffer: string | Buffer,
	{ username, password, typeid = '1' }: OCROptions
): Promise<string | undefined> {
	try {
		const base64data = buffer.toString('base64');
		const response: any = await axios.post(API_URL, {
			username, // 用户名
			password, // 密码
			typeid,
			image: base64data
		});

		const d = response.data;
		if (d.success) {
			// handle success
			const { result } = d.data;
			return result;
		} else {
			return undefined;
		}
	} catch (__) {
		return undefined;
	}
}
