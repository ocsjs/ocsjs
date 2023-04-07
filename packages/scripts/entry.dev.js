/* eslint-disable no-undef */
/// <reference path="./global.d.ts" />

const { start, definedProjects, CommonProject } = OCS;

(function () {
	'use strict';

	// 运行脚本
	start({
		style: GM_getResourceText('STYLE'),
		projects: definedProjects(),
		defaultPanelName: CommonProject.scripts.guide.namespace
	});
})();
