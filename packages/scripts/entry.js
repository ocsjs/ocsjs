/* eslint-disable no-undef */
/// <reference path="./global.d.ts" />

const { start, definedProjects, CommonProject } = OCS;

(function () {
	'use strict';

	// 运行脚本
	start({
		style: STYLE,
		projects: definedProjects(),
		defaultPanelName: CommonProject.scripts.guide.namespace,
		updatePage:
			GM_info.scriptHandler === 'Tampermonkey'
				? 'https://greasyfork.org/zh-CN/scripts/457151'
				: 'https://scriptcat.org/script-show-page/367'
	});
})();
