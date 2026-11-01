/**
 * 答题兜底决策（纯逻辑，无 DOM 依赖，可在 node 中直接测试）
 *
 * 题库搜不到答案时的三级兜底：
 * 1. 课程上下文检索（语料支持度足够高）
 * 2. 随机选择（单选/多选/判断）
 * 3. 填空题使用与题目最相似的语料文句（无则放弃）
 *
 * 输出的是「伪搜题结果」：与题库返回格式一致，
 * 交给既有解析器走正常匹配流程，保证选项点击/填空逻辑完全复用。
 */

export type FallbackQuestionType = 'single' | 'multiple' | 'judgement' | 'completion' | undefined;

export interface FallbackSearchInfo {
	name: string;
	homepage?: string;
	results: { question: string; answer: string }[];
}

export interface ContextPick {
	/** 语料选中的候选项文本（选择题）或最相似文句（填空题） */
	answer: string;
	score: number;
	source?: string;
}

export const CONTEXT_SOURCE_NAME = '课程上下文';
export const RANDOM_SOURCE_NAME = '随机兜底';

/** 生成伪搜题结果 */
export function buildSearchInfo(name: string, question: string, answer: string): FallbackSearchInfo {
	return { name, results: [{ question, answer }] };
}

/**
 * 随机兜底答案：
 * - single: 随机一个选项文本（解析器会精确命中该选项并点击）
 * - judgement: 随机 对/错（判断题解析器按关键词匹配）
 * - multiple: 随机非空子集，用分隔符连接（多选解析器逐项匹配）
 * - completion: 无法随机，返回 undefined
 */
export function randomFallbackAnswer(
	type: FallbackQuestionType,
	optionTexts: string[],
	separator = '#',
	rng: () => number = Math.random
): string | undefined {
	const options = optionTexts.map((t) => t.trim()).filter(Boolean);
	if (type === 'judgement') {
		return rng() < 0.5 ? '对' : '错';
	}
	if (type === 'single') {
		if (!options.length) return undefined;
		return options[Math.floor(rng() * options.length)];
	}
	if (type === 'multiple') {
		if (!options.length) return undefined;
		let picked = options.filter(() => rng() < 0.5);
		if (picked.length === 0) {
			picked = [options[Math.floor(rng() * options.length)]];
		}
		return picked.join(separator);
	}
	return undefined;
}

export interface FallbackDecision {
	answer: string;
	source: 'context' | 'random';
}

/**
 * 决策：优先用语料命中结果，否则随机。
 * @param contextPick 语料检索结果（选择题=pickBestCandidate 命中的选项文本；填空=pickBestSentence 的文句），没有则为 undefined
 */
export function decideFallback(
	type: FallbackQuestionType,
	optionTexts: string[],
	contextPick: ContextPick | undefined,
	separator = '#',
	rng: () => number = Math.random
): FallbackDecision | undefined {
	if (contextPick && contextPick.answer.trim()) {
		return { answer: contextPick.answer, source: 'context' };
	}
	const answer = randomFallbackAnswer(type, optionTexts, separator, rng);
	return answer ? { answer, source: 'random' } : undefined;
}

/**
 * 判断题确定性匹配：根据题目是否含否定/错误语义词推断答案。
 * 含否定词 → 倾向「错」；否则倾向「对」。纯规则、无随机。
 * 返回 '对' | '错'（永远有答案）。
 */
export function judgementByNegation(question: string): '对' | '错' {
	const neg = /(不是|不对|不正确|错误|不能|无法|没有|不可能|否认|缺乏|不会|未|无|非但|未必)/;
	return neg.test(question || '') ? '错' : '对';
}

/** 判断题两个选项哪个是「对」 */
export function judgementOptionTexts(optionTexts: string[]): { positive?: string; negative?: string } {
	const CORRECT = ['是', '对', '正确', '√', 'true', 't', 'yes', '1'];
	const WRONG = ['非', '否', '错', '错误', '×', 'x', 'false', 'f', 'no', '0'];
	const norm = (s: string) => s.trim().toLowerCase();
	const positive = optionTexts.find((t) => CORRECT.some((w) => norm(t) === w));
	const negative = optionTexts.find((t) => WRONG.some((w) => norm(t) === w));
	return { positive, negative };
}

/** 多选：返回所有得分不低于阈值的选项文本（用于课程内容检索兜底） */
export function pickOptionsAboveThreshold(optionTexts: string[], scores: number[], threshold = 0.35): string[] {
	return optionTexts.filter((_, i) => (scores[i] ?? 0) >= threshold);
}
