import { defineComponent } from 'vue';
import { ScriptPanelChild } from '../core/define.script';
import { SearchResults } from './SearchResults';
import { Terminal } from './Terminal';

/**
 * 创建提示面板
 */
export function createNote(...notes: string[]) {
	return defineComponent({
		render() {
			return (
				<div>
					<ul>
						{notes.map((note) => (
							<li style={{ padding: '4px 2px', fontWeight: 'bold' }}>{note}</li>
						))}
					</ul>
				</div>
			);
		}
	});
}

/**
 * 创建日志面板
 */
export function createTerminalPanel(): ScriptPanelChild {
	return {
		name: '日志',
		priority: -999,
		el: () => Terminal
	};
}

/**
 * 添加题目答题结果
 */
export function createSearchResultPanel() {
	return {
		name: '搜题结果',
		el: () => SearchResults
	};
}
