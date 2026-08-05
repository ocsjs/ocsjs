import { AnswererWrapper, LLMConfig, SearchInformation, Result } from './interface';
import { request } from '../utils/request';
import { $ } from '../../utils';

export const LLMHandlerConfig = {
	timeout_seconds: 120
};

export const DEFAULT_LLM_MESSAGES_TEMPLATE = `你是一个网课答题助手。请根据题目和选项给出正确答案。

题目：\${title}
选项：\${options}
题型：\${type}

要求：
1. 如果是单选题，只输出正确选项的字母（如A、B、C、D）
2. 如果是多选题，输出所有正确选项的字母，用#分隔（如A#B#C）
3. 如果是判断题，输出"正确"或"错误"
4. 如果是填空题，直接输出答案内容
5. 只输出答案，不要输出任何解释`;

const DEFAULT_LLM_NAME = '🤖 大模型答题';

/**
 * 大模型题库查题处理器
 */
export async function llmAnswerWrapperHandler(
	wrapper: AnswererWrapper,
	env: {
		title?: string;
		options?: string;
		type?: string;
		[x: string]: any;
	}
): Promise<SearchInformation> {
	const { name = DEFAULT_LLM_NAME, homepage = '#', headers = {}, data: wrapperData = {} } = wrapper;

	try {
		const typeMap: Record<string, string> = {
			single: '单选题',
			multiple: '多选题',
			judgement: '判断题',
			completion: '填空题'
		};
		const questionType = typeMap[env.type || ''] || '未知题型';

		const messagesTemplate = wrapperData.messages_template || DEFAULT_LLM_MESSAGES_TEMPLATE;
		const userContent = resolvePlaceHolder(messagesTemplate, {
			title: env.title || '',
			options: env.options || '无',
			type: questionType
		});

		const requestData = {
			model: wrapperData.model || 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: '你是一个网课答题助手，请严格按照要求输出答案，不要输出任何多余内容。'
				},
				{ role: 'user', content: userContent }
			],
			temperature: 0.1,
			max_tokens: 256
		};

		const responseData = await Promise.race([
			request(wrapper.url, {
				method: 'post',
				responseType: 'json',
				type: 'GM_xmlhttpRequest',
				data: requestData,
				headers: {
					'Content-Type': 'application/json',
					...headers
				}
			}),
			$.sleep((LLMHandlerConfig.timeout_seconds ?? 120) * 1000)
		]);

		if (responseData === undefined) {
			throw new Error('大模型请求超时，请检查网络或增加超时时间。');
		}

		const results: Result[] = parseLLMResponse(responseData);

		return {
			url: wrapper.url,
			name,
			homepage,
			results,
			response: responseData,
			data: requestData
		};
	} catch (error) {
		console.error(error);
		return {
			url: wrapper.url,
			name,
			homepage,
			results: [],
			response: undefined,
			data: undefined,
			error: (error as any)?.message || '大模型请求失败'
		};
	}
}

/**
 * 解析大模型API响应，提取答案
 */
function parseLLMResponse(responseData: any): Result[] {
	const content = responseData?.choices?.[0]?.message?.content;

	if (!content) {
		if (responseData?.error?.message) {
			throw new Error('大模型API错误: ' + responseData.error.message);
		}
		throw new Error('大模型返回内容为空');
	}

	const answer = content.trim();
	return [
		{
			question: '',
			answer,
			extra_data: { ai: true }
		}
	];
}

/**
 * 占位符替换
 */
function resolvePlaceHolder(template: string, values: Record<string, string>): string {
	let result = template;
	const matches = template.match(/\${(.*?)}/g) || [];
	for (const placeholder of matches) {
		const key = placeholder.replace(/\${(.*)}/, '$1') || '';
		const value = values[key] || '';
		result = result.replace(placeholder, value);
	}
	return result;
}

/**
 * 根据大模型配置创建 AnswererWrapper
 */
export function createLLMAnswererWrapper(config: LLMConfig): AnswererWrapper {
	return {
		name: DEFAULT_LLM_NAME,
		url: config.url,
		homepage: '#',
		method: 'post',
		type: 'llm',
		contentType: 'json',
		headers: {
			Authorization: `Bearer ${config.apikey}`
		},
		data: {
			model: config.model,
			messages_template: config.messages || DEFAULT_LLM_MESSAGES_TEMPLATE
		},
		handler: 'return (res) => undefined'
	};
}

/**
 * 从 AnswererWrapper 中提取大模型配置
 */
export function extractLLMConfig(wrapper: AnswererWrapper): LLMConfig | undefined {
	if (wrapper.type !== 'llm') return undefined;

	const apikey = wrapper.headers?.Authorization?.replace('Bearer ', '') || '';
	return {
		apikey,
		url: wrapper.url,
		model: wrapper.data?.model || '',
		messages: wrapper.data?.messages_template || ''
	};
}

/**
 * 测试大模型连接
 */
export async function testLLMConnection(wrapper: AnswererWrapper): Promise<{ success: boolean; error?: string }> {
	try {
		const res = await request(wrapper.url, {
			type: 'GM_xmlhttpRequest',
			method: 'post',
			responseType: 'json',
			headers: {
				'Content-Type': 'application/json',
				...wrapper.headers
			},
			data: {
				model: wrapper.data?.model || 'gpt-3.5-turbo',
				messages: [{ role: 'user', content: 'hi' }],
				max_tokens: 1
			}
		});

		if (res?.error?.message) {
			return { success: false, error: res.error.message };
		}

		return { success: true };
	} catch (err) {
		return { success: false, error: (err as any)?.message || '连接失败' };
	}
}
