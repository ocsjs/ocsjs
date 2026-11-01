/**
 * Bing 搜索结果页解析（纯逻辑，无浏览器/网络依赖，可单测）
 */

export interface WebPassage {
	source?: string;
	text: string;
}

/** 从 Bing 结果 HTML 提取标题+摘要段落 */
export function extractBingPassages(html: string): WebPassage[] {
	const passages: WebPassage[] = [];
	const re = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
	let m: RegExpExecArray | null;
	let idx = 0;
	while ((m = re.exec(html)) && passages.length < 6) {
		const block = m[1];
		const title = (block.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || ['', ''])[1]
			.replace(/<[^>]+>/g, ' ')
			.replace(/&[a-z]+;/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		const caption = (block.match(/class="[^"]*b_caption[^"]*"[^>]*>([\s\S]*?)<\/(?:div|p)>/) || ['', ''])[1]
			.replace(/<[^>]+>/g, ' ')
			.replace(/&[a-z]+;/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		const text = (title + ' ' + caption).trim();
		if (text.length > 12) passages.push({ source: '网络' + ++idx, text });
	}
	return passages;
}
