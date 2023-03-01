/* eslint-disable no-unused-vars */
import MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import Token from 'markdown-it/lib/token';

export enum CommonContainerNames {
	INFO = 'info',
	WARNING = 'warning',
	SUCCESS = 'success',
	ERROR = 'error'
}

export function markdownContainer(md: MarkdownIt) {
	createContainer({
		md,
		name: 'code',
		renders: {
			open() {
				return '<details><summary>点击查看代码</summary>\n';
			},
			close() {
				return '</details>\n';
			}
		}
	});

	// 创建全局通用容器
	createCommonContainer(md, CommonContainerNames.INFO);
	createCommonContainer(md, CommonContainerNames.WARNING);
	createCommonContainer(md, CommonContainerNames.SUCCESS);
	createCommonContainer(md, CommonContainerNames.ERROR);
	createContainer({
		md,
		name: 'video',
		renders: {
			open(tokens: Token[], idx: number) {
				const [input, src] = tokens[idx].info.trim().match(/^video (.*)$/) || [];
				console.log(tokens[idx].info, [input, src]);

				return `<video class="mt-3 mb-3 video-js w-100" controls>
        <source src="${src?.trim()}" type="video/mp4">
        </video>`;
			},
			close() {
				return ``;
			}
		}
	});
}

/**
 * 创建通用容器的模板函数
 * @param name 容器名
 */
export function createCommonContainer(md: MarkdownIt, name: string | CommonContainerNames) {
	createContainer({
		md,
		name,
		renders: {
			open(tokens: Token[], idx: number) {
				const m = tokens[idx].info.trim().match(RegExp(`^${name}\\s+(.*)$`));
				return `
                                <div class='container-${name}'>
                                    <p class='container-title'>${m?.[1] || ''}</p>
                                    <div class='container-body'>
                            `;
			},
			close() {
				return '</div></div>';
			}
		}
	});
}

export interface RenderOptions {
	open: (tokens: Token[], idx: number) => string;
	close: (tokens: Token[], idx: number) => string;
}

// 容器创建
export function createContainer({
	md,
	name,
	renders,
	maker = ':'
}: {
	md: MarkdownIt;
	name: string | CommonContainerNames;
	renders: RenderOptions;
	maker?: string;
}) {
	md.use(container, name, {
		maker,
		validate: (params: string) => RegExp(name).test(params.trim()),
		render: (tokens: Token[], idx: number) => {
			if (tokens[idx].nesting === 1) {
				// open tag
				return renders.open(tokens, idx);
			} else {
				// closing tag
				return renders.close(tokens, idx);
			}
		}
	});
}
