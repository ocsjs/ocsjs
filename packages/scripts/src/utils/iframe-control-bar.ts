import { $elements, $ui, $message, MessageElement, CommonEventEmitter, cors, h } from 'easy-us';
import { WorkerEvents } from '@ocsjs/core';
import { logoSvg } from './ui';

/**
 * 子 iframe 操控指令事件名（顶层操控条按钮 → 子帧执行）。
 * 注意 cors 为单消费者语义（队列 list.pop()）：仅当前答题子帧注册监听，
 * 多个子帧同时答题时指令会被随机一帧消费（与答题器单任务模型一致，可接受）
 */
export const IFRAME_CONTROL_EVENT = 'ocs.iframe-work-control';

export type IframeControlAction = 'stop' | 'continuate' | 'reload';

/**
 * 操控条元素与按钮引用（仅顶层窗口上下文中使用；
 * defineTopFunction 的函数体在顶层执行，捕获的是顶层模块变量）
 */
let controlBar: HTMLElement | undefined;
let pauseBtn: HTMLInputElement | undefined;
let reloadBtn: HTMLInputElement | undefined;

/** 构建操控条（在顶层窗口执行，$elements.root 内共享脚本样式表，可直接使用 base-style-button 等样式） */
function buildControlBar(): HTMLElement {
	pauseBtn = $ui.button('⏸暂停', { style: { padding: '0px 8px', fontSize: '12px', lineHeight: '20px' } });
	reloadBtn = $ui.button('🔃重新答题', { style: { padding: '0px 8px', fontSize: '12px', lineHeight: '20px' } });

	pauseBtn.onclick = () => {
		// 按钮状态由子帧执行指令后回同步（render），此处仅发送指令
		cors.emit(IFRAME_CONTROL_EVENT, [pauseBtn?.dataset.paused === 'true' ? 'continuate' : 'stop']);
	};
	reloadBtn.onclick = () => {
		cors.emit(IFRAME_CONTROL_EVENT, ['reload']);
	};

	// OCS 图标：标识该面板属于脚本，悬浮显示简介与功能说明。
	// 使用 CSS-only 悬浮提示（样式随操控条注入 shadow root）：
	// $ui.tooltip 依赖顶层 tooltipContainer（挂载在脚本面板窗口内），面板窗口隐藏时提示不可见
	const icon = h('span', { className: 'ocs-iframe-bar-tip' }, [
		h('span', {
			innerHTML: logoSvg,
			style: { display: 'inline-flex', alignItems: 'center' }
		}),
		h('div', { className: 'tip-content' }, [
			h('div', { style: { fontWeight: 'bold', marginBottom: '4px' } }, 'OCS 答题操作面板'),
			h('div', '当前页面由 OCS 网课助手自动答题中，可进行以下操作：'),
			h('div', '⏸暂停/▶️继续：暂停或恢复自动答题'),
			h('div', '🔃重新答题：刷新页面，重新开始自动答题')
		])
	]);

	return h(
		'div',
		{
			style: {
				position: 'fixed',
				top: '24px',
				left: '50%',
				transform: 'translateX(-50%)',
				zIndex: '999999',
				display: 'inline-flex',
				alignItems: 'center',
				gap: '8px',
				padding: '4px 10px',
				background: '#fff',
				border: '1px solid #e5e5e5',
				borderRadius: '8px',
				boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
			}
		},
		[
			h('style', {
				textContent: [
					'.ocs-iframe-bar-tip{position:relative;display:inline-flex;align-items:center;flex-shrink:0;cursor:help;}',
					'.ocs-iframe-bar-tip .tip-content{display:none;position:absolute;top:calc(100% + 8px);left:0;width:230px;padding:8px 10px;background:#303133;color:#fff;font-size:12px;line-height:1.7;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.2);z-index:1;}',
					'.ocs-iframe-bar-tip:hover .tip-content{display:block;}'
				].join('\n')
			}),
			icon,
			pauseBtn,
			reloadBtn
		]
	);
}

/**
 * 子 iframe 操控面板（跨窗口）。
 * 渲染入口为 cors.defineTopFunction：子帧（commonWork iframe_control 开启）调用，
 * 实际在顶层窗口执行，操控条挂载到 $elements.root 下共享样式；
 * 按钮指令经 cors 事件回传子帧执行（worker 在子帧内，无法跨帧直接引用）。
 */
export const IframeControlBar = {
	/**
	 * 渲染/更新操控条（幂等：不存在则创建，存在则仅同步按钮状态）
	 * @param barState.paused 当前是否暂停中（决定 暂停/继续 按钮文案）
	 * @param barState.done 答题是否已结束（结束后禁用暂停按钮，重新答题保持可用）
	 */
	render: cors.defineTopFunction((barState: { paused: boolean; done: boolean }) => {
		const root = $elements.root;
		if (!root) {
			return;
		}
		if (!controlBar?.isConnected) {
			controlBar = buildControlBar();
			root.append(controlBar);
		}
		if (pauseBtn) {
			pauseBtn.dataset.paused = String(barState.paused);
			pauseBtn.value = barState.paused ? '▶️继续' : '⏸️暂停';
			pauseBtn.disabled = barState.done;
		}
	}),
	/** 移除操控条（worker 关闭时调用） */
	remove: cors.defineTopFunction(() => {
		controlBar?.remove();
		controlBar = undefined;
		pauseBtn = undefined;
		reloadBtn = undefined;
	})
};

/**
 * 子 iframe 操控会话（commonWork 生命周期接口）
 */
export interface IframeControlSession {
	/** worker 创建后激活：渲染操控条到顶层 $elements.root */
	activate(): void;
	/** 答题结束：禁用暂停按钮（重新答题保持可用） */
	finish(): void;
	/** worker 关闭：移除操控条与暂停提示 */
	dispose(): void;
}

/**
 * 创建子 iframe 操控会话：封装子帧侧全部逻辑——
 * 顶层操控条按钮的指令监听、暂停状态维护、暂停提示消息、按钮状态回同步。
 *
 * 未开启或当前不在子帧时返回 undefined，调用方（commonWork）无需重复判断
 * `iframe_control && self !== top`，仅在 worker 生命周期中可选调用 activate/finish/dispose。
 *
 * 注意：cors.on 同帧内按事件名去重，同帧多个 commonWork 实例时仅首个实例的处理器生效
 */
export function createIframeControlSession(options: {
	/** commonWork 的 iframe_control 参数 */
	enabled?: boolean;
	/** 获取当前 worker（指令到达时执行 暂停/继续） */
	workerProvider: () => CommonEventEmitter<WorkerEvents> | undefined;
	/** 暂停状态（外部托管，与 commonWork 共享） */
	paused: { value: boolean };
}): IframeControlSession | undefined {
	if (!options.enabled || self === top) {
		return undefined;
	}

	/** 暂停提示消息（子帧中 $message 经 cors 转发到顶层显示） */
	let stopMessage: MessageElement | undefined;

	// 注册顶层操控条按钮的指令监听（cors 单消费者语义，仅当前答题帧注册）
	cors.on(IFRAME_CONTROL_EVENT, (args: any[]) => {
		const action = args[0] as IframeControlAction;
		if (action === 'reload') {
			// 重新答题：刷新子帧页面重新触发脚本（预检倒计时结束后自动开始答题）
			location.reload();
			return;
		}
		options.paused.value = action === 'stop';
		options.workerProvider()?.emit(action);
		if (options.paused.value) {
			stopMessage = $message.warn({ duration: 0, content: '暂停中...' });
		} else {
			stopMessage?.remove();
		}
		// 回同步按钮状态到顶层操控条
		IframeControlBar.render({ paused: options.paused.value, done: false });
	});

	return {
		activate: () => {
			IframeControlBar.render({ paused: options.paused.value, done: false });
		},
		finish: () => {
			IframeControlBar.render({ paused: false, done: true });
		},
		dispose: () => {
			stopMessage?.remove();
			IframeControlBar.remove();
		}
	};
}
