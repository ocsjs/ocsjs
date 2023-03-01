import MarkdownIt from 'markdown-it';
import Emoji from 'markdown-it-emoji';
import { markdownContainer } from '../utils/markdown.container';

// @ts-ignore full options list (defaults)
export const markdownIt: MarkdownIt = MarkdownIt({
	html: true,
	xhtmlOut: false,
	breaks: true,
	langPrefix: 'language-',
	linkify: true,
	typographer: true,
	quotes: '“”‘’'
});

markdownIt
	// emoji 表情
	.use(Emoji)
	// 自定义 container
	.use(markdownContainer);
