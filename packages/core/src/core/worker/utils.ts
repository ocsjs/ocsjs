import { QuestionTypes, WorkContext } from './interface';

/** 默认题目类型解析器 */
export function defaultWorkTypeResolver(ctx: WorkContext<any>): QuestionTypes | undefined {
	function count(selector: string) {
		let c = 0;
		for (const option of ctx.elements.options || []) {
			if (option?.querySelector(selector) !== null) {
				c++;
			}
		}
		return c;
	}
	return count('[type="radio"]') === 2
		? 'judgement'
		: count('[type="radio"]') > 2
		? 'single'
		: count('[type="checkbox"]') > 2
		? 'multiple'
		: count('textarea') >= 1
		? 'completion'
		: undefined;
}

/** 判断答案是否为A-Z的文本, 并且字符序号依次递增, 并且 每个字符是否都只出现了一次 */
export function isPlainAnswer(answer: string) {
	answer = answer.trim();
	if (answer.length > 8 || !/[A-Z]/.test(answer)) {
		return false;
	}
	const counter: any = {};
	let min = 0;
	for (let i = 0; i < answer.length; i++) {
		if (answer.charCodeAt(i) < min) {
			return false;
		}
		min = answer.charCodeAt(i);
		counter[min] = (counter[min] || 0) + 1;
	}
	// 判断每个字符是否都只出现了一次
	for (const key in counter) {
		if (counter[key] !== 1) {
			return false;
		}
	}

	return true;
}

/** 分割答案 */
export function splitAnswer(answer: string) {
	try {
		// 如果是 json 格式的多选答案
		const json = JSON.parse(answer);
		if (Array.isArray(json)) {
			return json.map(String).filter((el) => el.trim().length > 0);
		}
	} catch {
		const seprators = ['===', '#', '---', '###', '|', ';'];
		for (const sep of seprators) {
			if (answer.split(sep).length > 1) {
				return answer.split(sep).filter((el) => el.trim().length > 0);
			}
		}
	}

	return [answer];
}
