/* eslint-disable max-len */
import { h, $ui } from 'easy-us';
import type { AnswererWrapper } from '@ocsjs/core';

/**
 * OCS 通用 UI 组件库
 *
 * 本文件存放题库配置弹窗等场景复用的展示组件与图标资源，与项目业务状态解耦：
 * 组件不直接读写 CommonProject 等全局状态，所需数据/行为通过参数注入。
 *
 * 配套样式：packages/scripts/assets/less/custom.less（.aw-* 前缀类名）
 */

/**
 * OCS 图标 SVG（唯一数据源）
 * - entry.js 标题栏使用（经 index.ts 导出后从 OCS 全局解构）
 * - edge-minimize.ts 边缘最小化图标模式使用
 */
export const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1080 1080" style="vertical-align:middle;"><path fill-rule="evenodd" d="M504.5 1.109c-72.713 4.577-147.529 25.339-212.035 58.842-50.191 26.068-92.985 57.474-133.527 97.996-41.255 41.234-72.652 84.102-98.549 134.553-63.294 123.306-76.989 265.444-38.445 399 25.189 87.279 71.847 166.103 136.667 230.88 51 50.967 110.694 90.846 176.835 118.135 49.129 20.27 108.457 34.223 163.504 38.452 17.303 1.329 66.996 1.333 83.655.006 55.204-4.397 107.295-16.401 158.822-36.6 17.371-6.81 57.946-26.767 74.073-36.433 41.445-24.842 72.509-49.199 110.493-86.637l21.507-21.198-71.734-71.786-71.734-71.785-19.766 19.567c-10.871 10.762-23.591 22.705-28.266 26.54-53.604 43.971-115.935 69.551-185 75.921-81.757 7.541-165.599-15.992-231.454-64.964-6.35-4.722-11.546-8.93-11.546-9.349s11.385-12.142 25.3-26.049l25.3-25.286 4.777-3.648c13.463 10.28 36.952 23.436 55.855 31.285 52.351 21.738 113.089 25.925 168.768 11.634 35.263-9.05 73.276-28.363 100.754-51.188C722.543 734.838 751 705.231 751 702.338c0-1.002-47.194-48.338-48.193-48.338-.39 0-4.279 4.388-8.642 9.75-24.686 30.342-55.543 51.652-92.165 63.652-22.77 7.461-33.447 9.027-61.5 9.025-20.917-.002-25.46-.293-35.363-2.266-31.598-6.297-58.925-18.374-83.801-37.035-4.858-3.644-16.847-14.474-26.642-24.066l-17.809-17.44-73.994 73.94-73.994 73.94 21.324 21c28.787 28.349 48.737 44.364 77.279 62.033 15.029 9.303 48.315 26.086 63 31.763 35.072 13.559 69.772 21.993 108 26.249 20.372 2.268 63.437 2.268 84-.001 76.772-8.471 146.44-36.203 205.832-81.934 6.508-5.01 12.471-9.558 13.252-10.106 1.101-.773 6.563 4.151 24.406 22l22.988 22.996-10.739 8.675c-65.679 53.053-141.564 86.866-223.817 99.729-27.363 4.279-43.823 5.505-73.922 5.505-46.468 0-83.994-5.037-127.455-17.107C272.797 955.351 156.557 850.805 102.504 715c-22.28-55.977-32.803-111.402-32.94-173.5-.116-52.401 7.047-99.278 22.432-146.793C147.295 223.918 294.816 99.581 473 73.582c41.922-6.117 98.943-5.919 138.5.481 72.78 11.775 134.913 36.126 194.048 76.05C823.221 162.046 848 181.418 848 183.304c0 .661-32.624 33.823-72.498 73.694-55.881 55.877-72.815 72.265-73.88 71.498-41.919-30.237-86.474-47.748-133.478-52.458-13.265-1.329-41.947-1.334-55.288-.01-78.286 7.774-150.572 51.845-194.318 118.472-31.523 48.011-46.706 105.616-42.723 162.094 1.179 16.71 3.688 33.737 6.74 45.73C287.22 620.654 297.35 649 299.235 649c.53 0 12.635-11.675 26.9-25.945l25.936-25.944-1.984-7.806c-4.264-16.777-5.55-28.045-5.569-48.805-.019-21.105.931-29.802 5.136-47 13.445-54.989 48.145-99.893 98.346-127.264 16.503-8.998 39.898-16.833 60.379-20.222 15.558-2.575 45.897-2.791 61.002-.436C638.18 356.306 694.057 399.38 721.704 463c15.443 35.539 19.804 79.228 11.676 117-1.36 6.325-2.706 12.85-2.989 14.5-.482 2.81 1.166 4.677 25.998 29.444 25.179 25.113 26.56 26.321 27.443 24 .512-1.344 2.056-5.144 3.432-8.444 22.118-53.055 24.905-120.158 7.36-177.223-8.309-27.026-22.775-56.32-38.077-77.106-2.501-3.397-4.547-6.512-4.547-6.922s43.893-44.64 97.54-98.289l97.539-97.543-23.289-22.984c-24.441-24.12-39.625-37.373-61.265-53.476C760.232 29.842 634.23-7.058 504.5 1.109m453.75 253.895C944.913 268.521 934 279.798 934 280.065s4.308 7.673 9.574 16.46c22.263 37.147 39.526 77.171 50.801 117.778 3.005 10.825 4.205 15.733 7.623 31.197 10.804 48.879 12.225 117.979 3.485 169.5-11.438 67.422-31.332 118.888-70.557 182.535l-1.87 3.036 24.863 24.848 24.863 24.848 7.942-11.884c45.969-68.783 75.805-150.569 85.686-234.883 5.282-45.065 4.544-97.517-2.004-142.5-11.025-75.743-37.133-146.086-78.498-211.5-4.87-7.7-9.878-15.141-11.131-16.536l-2.277-2.536z"/></svg>`;

/** 加载中旋转图标（旋转动画由 custom.less 的 .aw-spin 控制） */
export const loadingSpinSvg = `<svg class="aw-spin" width="14" height="14" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="28" stroke-dashoffset="10" stroke-linecap="round"/></svg>`;

/** 题库启用/停用状态接入（由调用方提供，避免组件与项目状态耦合） */
export interface AnswererListHandlers {
	/** 判断题库是否已停用 */
	isDisabled: (name: string) => boolean;
	/** 切换题库启用/停用（disabled=true 表示切换后为停用状态） */
	onToggle: (name: string, disabled: boolean) => void;
}

/** 展开箭头 SVG（代替 details/summary 的默认箭头，旋转动画由 CSS 控制） */
const CHEVRON_SVG = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/**
 * 题库配置卡片列表
 *
 * 每个题库渲染为可展开卡片：
 * - 头部：名称 + 接口域名徽标 + 启停开关 + 展开箭头，点击整行展开/收起
 * - 详情：对齐的键值行（名字/官网/接口/请求方法/请求类型/请求头/请求体）
 * - 展开/收起、停用半透明等交互通过 class（expanded / disabled）驱动，样式见 custom.less
 */
export function createAnswererWrapperList(aw: AnswererWrapper[], handlers: AnswererListHandlers): HTMLElement[] {
	/** 对齐的键值行：标签列固定宽度，值自动换行 */
	const row = (label: string, value: string | HTMLElement) =>
		h('li', { className: 'aw-card-row' }, [
			h('span', { className: 'aw-card-label' }, label),
			h('span', { className: 'aw-card-value' }, [value])
		]);

	return aw.map((item) => {
		const card = h('div', { className: 'aw-card' + (handlers.isDisabled(item.name) ? ' disabled' : '') });

		/** 启用/停用开关（阻止冒泡，避免触发卡片展开） */
		const checkbox = h('input', {
			type: 'checkbox',
			checked: !handlers.isDisabled(item.name),
			className: 'base-style-switch'
		});
		checkbox.onclick = () => {
			const disabled = !checkbox.checked;
			card.classList.toggle('disabled', disabled);
			handlers.onToggle(item.name, disabled);
		};
		checkbox.title = '点击停用或者启用题库，停用题库后将无法在自动答题中查询题目';
		const switchWrapper = $ui.tooltip(checkbox);
		switchWrapper.onclick = (e) => e.stopPropagation();

		/** 接口域名徽标 */
		const host = (() => {
			try {
				return new URL(item.url).hostname;
			} catch {
				return item.url;
			}
		})();

		/** 卡片头：名称 + 域名徽标 + 右侧开关 + 箭头，点击整行展开/收起 */
		const header = h('div', { className: 'aw-card-header' }, [
			h('span', { className: 'aw-card-name' }, item.name),
			h('span', { className: 'aw-card-badge', title: item.url }, host),
			h('span', { className: 'aw-card-spacer' }),
			switchWrapper,
			h('span', { className: 'aw-card-chevron', innerHTML: CHEVRON_SVG })
		]);
		header.onclick = () => card.classList.toggle('expanded');

		/** 详情区（默认收起） */
		const body = h('div', { className: 'aw-card-body' }, [
			h('ul', { className: 'aw-card-rows' }, [
				row('名字', item.name),
				row(
					'官网',
					h('span', {
						innerHTML: `<a target="_blank" href=${item.homepage}>${item.homepage || '无'}</a>`
					})
				),
				row('接口', item.url),
				row('请求方法', item.method),
				row('请求类型', item.type),
				row('请求头', JSON.stringify(item.headers, null, 4) || '无'),
				row('请求体', JSON.stringify(item.data, null, 4) || '无')
			])
		]);

		card.append(header, body);
		return card;
	});
}

/**
 * 题库配置渲染区：标题 + 复制按钮（右对齐）+ 卡片列表
 * @param aw 题库配置数组
 * @param title 标题
 * @param handlers 题库启停状态接入
 * @param withCopy 是否显示「复制题库配置」按钮
 */
export function createAnswererWrapperSection(
	aw: AnswererWrapper[],
	title: string,
	handlers: AnswererListHandlers,
	withCopy = true
): HTMLElement {
	/** 复制按钮：普通按钮样式（小尺寸），右对齐 */
	const copyBtn = withCopy ? $ui.copy('复制题库配置', JSON.stringify(aw, null, 4)) : undefined;
	if (copyBtn) {
		copyBtn.className = 'modal-cancel-button aw-section-copy';
	}
	return h('div', [
		h('div', { className: 'aw-section-header' }, [h('b', title), ...(copyBtn ? [copyBtn] : [])]),
		...createAnswererWrapperList(aw, handlers)
	]);
}

/**
 * 步骤指示器（① → ② → ③）
 * @param items 步骤文案列表
 */
export function createSteps(items: string[]): HTMLElement {
	const children: (HTMLElement | string)[] = [];
	items.forEach((text, i) => {
		children.push(h('span', { className: 'aw-step' }, [h('span', { className: 'aw-step-num' }, String(i + 1)), text]));
		if (i < items.length - 1) {
			children.push(h('span', { className: 'aw-step-arrow' }, '→'));
		}
	});
	return h('div', { className: 'aw-steps' }, children);
}

/** 状态提示类型：info 进行中 / success 成功 / error 失败 */
export type StatusType = 'info' | 'success' | 'error';

/**
 * 状态提示框（默认隐藏，setStatus 后显示并按类型着色）
 * @returns el 状态框元素；setStatus 更新文本与类型
 */
export function createStatusBox(): { el: HTMLElement; setStatus: (text: string, type: StatusType) => void } {
	const el = h('div', { className: 'aw-connect-status' });
	const setStatus = (text: string, type: StatusType) => {
		el.innerHTML = text;
		el.className = 'aw-connect-status ' + type;
	};
	return { el, setStatus };
}

/** Hero 头部配置 */
export interface HeroOptions {
	/** 图标（emoji 文本） */
	icon: string;
	/** 主标题 */
	title: string;
	/** 副标题说明 */
	subtitle: string;
	/** 额外信息行（如题库源与官网链接） */
	extra?: HTMLElement | string;
}

/**
 * Hero 头部（简洁浅色底 + 居中图标/标题/副标题 + 可选附加信息行）
 */
export function createHero(opts: HeroOptions): HTMLElement {
	return h('div', { className: 'aw-connect-hero' }, [
		h('div', { className: 'aw-connect-hero-icon' }, opts.icon),
		h('div', { className: 'aw-connect-hero-title' }, opts.title),
		h('div', { className: 'aw-connect-hero-subtitle' }, opts.subtitle),
		...(opts.extra ? [h('div', { className: 'aw-connect-hero-extra' }, [opts.extra])] : [])
	]);
}
