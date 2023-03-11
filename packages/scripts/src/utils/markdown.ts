import { marked } from 'marked';

export function markdown(md: string) {
	return marked.parse(md);
}
