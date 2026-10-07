import { marked } from 'marked';
import DOMPurify from 'dompurify';

// 渲染出的链接统一新窗口打开，并禁止携带 opener 引用
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if (node.tagName === 'A') {
		node.setAttribute('target', '_blank');
		node.setAttribute('rel', 'noopener noreferrer');
	}
});

/**
 * 渲染 markdown 为安全的 HTML
 *
 * marked 不会净化 HTML，远程内容（如 CDN 的更新日志）可能注入恶意 HTML/事件属性，
 * 必须使用 DOMPurify 消毒后再写入 innerHTML
 */
export function markdown(md: string) {
	return DOMPurify.sanitize(marked.parse(md) as string, { ADD_ATTR: ['target'] });
}
