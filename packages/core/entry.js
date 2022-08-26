/* eslint-disable no-undef */

(function () {
	'use strict';

	// 运行脚本
	OCS.start({
		// 加载样式
		style: OCS_STYLE,
		// 支持拖动
		draggable: true,
		// 加载默认脚本列表，默认 OCS.definedScripts
		scripts: OCS.definedScripts
	});
})();
