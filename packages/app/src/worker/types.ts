export interface ScriptWorkerAction {
	target: (opts: any) => void;
	name: string;
	/** 任务处理时发生错误，是否销毁上下文 */
	destroyWhenError?: boolean;
	enableLogger?: boolean;
}

export interface ScriptWorkerActions {
	launch: ScriptWorkerAction;
	'page-close': ScriptWorkerAction;
	'browser-close': ScriptWorkerAction;
	call: ScriptWorkerAction;
	'page-switch': ScriptWorkerAction;
}
