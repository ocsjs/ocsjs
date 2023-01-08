/* eslint-disable no-undef */

const { start, RenderProject, CommonProject, ZHSProject, CXProject } = OCS;

(function () {
	'use strict';

	// 运行脚本
	start({
		style: GM_getResourceText('STYLE'),
		projects: [RenderProject, CommonProject, ZHSProject, CXProject]
	});
})();
