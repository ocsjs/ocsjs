import { $elements, h } from 'easy-us';
import { CommonProject } from '../projects/common';
import { BackgroundProject } from '../projects/background';
import { logoSvg } from './ui';

/** 固定吸附范围：视口左右各 100px */
const EDGE_WIDTH = 100;
/** 图标尺寸（px），与 custom.less 中 .edge-minimize 的宽高一致 */
const ICON_SIZE = 64;
/** 吸附过渡动画时长（ms），与 .edge-snapping 的 transition 一致 */
const SNAP_ANIMATION_MS = 250;

const EDGE_CLASS = 'edge-minimize';
const SIDE_CLASSES = ['edge-left', 'edge-right'] as const;
const SNAP_ANIM_CLASS = 'edge-snapping';

/** 程序化吸附进行中：防止 setPosition 触发的 x 配置回调重入 */
let snapping = false;
/** 头部拖动进行中（用于拖放高亮区域显示） */
let headerDragging = false;
/** 拖放高亮区域元素 */
let dropZone: HTMLElement | undefined;

function getContainer(): HTMLElement | undefined {
	return $elements.root?.querySelector<HTMLElement>('container-element') ?? undefined;
}

/**
 * 边缘最小化判定：
 * 窗口为 minimize 状态且面板中心点位于视口左右 100px 吸附范围内时，进入图标吸附模式（隐藏头部、仅显示 OCS 图标）；
 * 否则退出图标模式，恢复普通最小化头部。
 */
export function updateEdgeMode() {
	const container = getContainer();
	if (!container || snapping) return;
	const render = BackgroundProject.scripts.render;

	const clientWidth = document.documentElement.clientWidth;
	// 以面板中心点判定：避免宽面板仅边缘擦过吸附区就触发吸附
	const centerX = container.offsetLeft + container.offsetWidth / 2;
	const side =
		render.cfg.visual !== 'minimize'
			? undefined
			: centerX <= EDGE_WIDTH
			? 'left'
			: centerX >= clientWidth - EDGE_WIDTH
			? 'right'
			: undefined;

	if (side) {
		const snappedX = side === 'left' ? 0 : clientWidth - ICON_SIZE;
		// 加图标类与吸附在同一次调用内完成，避免分步时序导致"吸附了但不变图标"
		container.classList.add(EDGE_CLASS);
		container.classList.remove(...SIDE_CLASSES);
		container.classList.add(`edge-${side}`);
		// 吸附后头部被隐藏，悬停其上的 tooltip 气泡不会触发 mouseleave 而残留显示，手动隐藏
		if ($elements.tooltipContainer) {
			$elements.tooltipContainer.style.display = 'none';
		}
		if (container.offsetLeft !== snappedX) {
			// 吸附到边缘并持久化位置（刷新后重新判定可自动恢复），附带过渡动画
			snapping = true;
			container.classList.add(SNAP_ANIM_CLASS);
			render.methods.setPosition(snappedX, container.offsetTop);
			setTimeout(() => {
				container.classList.remove(SNAP_ANIM_CLASS);
				snapping = false;
			}, SNAP_ANIMATION_MS);
		}
	} else {
		container.classList.remove(EDGE_CLASS, ...SIDE_CLASSES);
	}
}

/** 创建（或返回已创建的）拖放高亮区域元素 */
function ensureDropZone(): HTMLElement | undefined {
	if (!dropZone && $elements.root) {
		dropZone = h('div', { className: 'edge-drop-zone' }, [
			h('span', { className: 'edge-drop-zone-tip' }, '松手自动吸附')
		]);
		$elements.root.append(dropZone);
	}
	return dropZone;
}

/** 根据指针位置显示/隐藏拖放高亮区域（仅 minimize 状态且指针处于吸附区域时显示） */
function updateDropZone(clientX: number) {
	const zone = ensureDropZone();
	if (!zone) return;
	const clientWidth = document.documentElement.clientWidth;
	const side =
		BackgroundProject.scripts.render.cfg.visual !== 'minimize'
			? undefined
			: clientX <= EDGE_WIDTH
			? 'left'
			: clientX >= clientWidth - EDGE_WIDTH
			? 'right'
			: undefined;
	zone.classList.toggle('show', !!side);
	zone.classList.toggle('zone-left', side === 'left');
	zone.classList.toggle('zone-right', side === 'right');
}

function hideDropZone() {
	dropZone?.classList.remove('show', 'zone-left', 'zone-right');
}

/**
 * 展开后校正面板位置：将面板完整收拢到视口内。
 * 吸附点位于屏幕边缘（如右侧 x=视口宽-48），直接展开会导致面板超出屏幕、只剩小部分区域可拖动。
 */
function ensurePanelInViewport(container: HTMLElement) {
	const clientWidth = document.documentElement.clientWidth;
	const clientHeight = document.documentElement.clientHeight;
	// top 与原生拖拽的下限保持一致（>= 10）
	const maxX = Math.max(clientWidth - container.offsetWidth, 0);
	const maxY = Math.max(clientHeight - container.offsetHeight, 10);
	const x = Math.min(Math.max(container.offsetLeft, 0), maxX);
	const y = Math.min(Math.max(container.offsetTop, 10), maxY);
	if (x !== container.offsetLeft || y !== container.offsetTop) {
		BackgroundProject.scripts.render.methods.setPosition(x, y);
	}
}

/**
 * 图标拖拽：
 * - 垂直拖动：沿吸附边缘上下移动
 * - 向内拖出吸附区域：退出图标模式，跟随指针自由移动（松手后若在区域外则保持普通最小化）
 * - 无位移点击：还原窗口
 */
function enableIconDraggable(icon: HTMLElement, container: HTMLElement) {
	icon.addEventListener('pointerdown', (e) => {
		e.preventDefault();
		e.stopPropagation();
		const startX = e.clientX;
		const startY = e.clientY;
		const startTop = container.offsetTop;
		const side: 'left' | 'right' = container.classList.contains('edge-right') ? 'right' : 'left';
		let dragging = false;
		let exited = false;

		const onMove = (ev: PointerEvent) => {
			if (!dragging && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 6) {
				dragging = true;
			}
			if (!dragging) return;
			const clientWidth = document.documentElement.clientWidth;
			// 向内越过吸附范围 + 图标宽度的阈值时退出图标模式
			const outOfZone =
				side === 'left' ? ev.clientX > EDGE_WIDTH + ICON_SIZE : ev.clientX < clientWidth - EDGE_WIDTH - ICON_SIZE;
			if (outOfZone && !exited) {
				exited = true;
				container.classList.remove(EDGE_CLASS, ...SIDE_CLASSES);
			}
			if (exited) {
				container.style.left = ev.clientX - ICON_SIZE / 2 + 'px';
			}
			container.style.top = Math.max(startTop + (ev.clientY - startY), 10) + 'px';
		};
		const onUp = () => {
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('pointerup', onUp);
			if (dragging) {
				// 持久化位置并重新判定（拖回吸附区域则重新吸附）
				BackgroundProject.scripts.render.methods.setPosition(container.offsetLeft, container.offsetTop);
				updateEdgeMode();
			} else {
				BackgroundProject.scripts.render.methods.normal();
				// 展开为正常尺寸后（下一帧待样式生效），校正位置保证面板完整显示在屏幕内
				requestAnimationFrame(() => ensurePanelInViewport(container));
			}
		};
		document.addEventListener('pointermove', onMove);
		document.addEventListener('pointerup', onUp);
	});
}

/** 是否已初始化（幂等保护，防止重复挂图标与重复监听） */
let inited = false;

/**
 * 初始化边缘最小化图标模式（全页面执行一次）。
 * @param retry 容器元素未就绪时的重试次数（每次间隔 1s）
 */
export function initEdgeMinimize(retry = 3) {
	if (inited) return;
	const container = getContainer();
	if (!container) {
		if (retry > 0) {
			setTimeout(() => initEdgeMinimize(retry - 1), 1000);
		}
		return;
	}
	inited = true;
	const render = BackgroundProject.scripts.render;

	// 图标元素：edge 模式下替代 header 显示，支持点击还原与拖拽
	const edgeIcon = h('div', {
		className: 'edge-minimize-icon',
		innerHTML: logoSvg,
		title: '点击展开窗口，或沿边缘拖动'
	});
	container.append(edgeIcon);
	enableIconDraggable(edgeIcon, container);

	// 拖放高亮区域：头部拖动进入吸附区域时显示，松手隐藏并直接判定一次
	ensureDropZone();
	container.querySelector('header-element')?.addEventListener('pointerdown', () => {
		headerDragging = true;
	});
	document.addEventListener('pointermove', (e) => {
		if (headerDragging) updateDropZone(e.clientX);
	});
	document.addEventListener('pointerup', () => {
		if (headerDragging) {
			headerDragging = false;
			hideDropZone();
			// 不依赖配置监听时序，松手直接判定
			updateEdgeMode();
		}
	});
	document.addEventListener('pointercancel', () => {
		headerDragging = false;
		hideDropZone();
	});

	// 状态/位置变化时重新判定（覆盖标题栏按钮、三击重置、moveToEdge）
	render.onConfigChange('visual', () => updateEdgeMode());
	render.onConfigChange('x', () => updateEdgeMode());
	// 视口缩放时右侧吸附需重新对齐
	window.addEventListener('resize', () => updateEdgeMode());

	// 初始化判定（覆盖刷新后已持久化的 edge 状态）
	updateEdgeMode();
}
