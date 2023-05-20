import { el } from '../utils/dom';
import { IElement } from './interface';

/**
 * 脚本的面板，创建于悬浮窗下，每当切换页面，或者展开时会重新渲染面板。
 *
 * 主要结构为：
 * 分隔符
 * 提示板块
 * 设置表单板块
 * 主体
 *
 */
export class ScriptPanelElement extends IElement {
	/** 分隔符 */
	separator: HTMLDivElement = el('div', { className: 'separator' });
	/** 创建提示板块 */
	notesContainer: HTMLDivElement = el('div', { className: 'notes card' });
	/** 创建设置板块 */
	configsContainer: HTMLDivElement = el('div', { className: 'configs-container card' });
	/** 主体 */
	body: HTMLDivElement = el('div', { className: 'script-panel-body' });
	/** 锁定配置板块 */
	lockWrapper: HTMLDivElement = el('div', { className: 'lock-wrapper' });
	/** 面板名字 */
	name?: string;

	connectedCallback() {
		this.separator.innerText = this.name || '';
		this.append(this.separator);
		this.append(this.notesContainer);
		this.append(this.configsContainer);
		this.append(this.body);
	}
}
