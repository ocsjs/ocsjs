/* eslint-disable no-undef */
/// <reference path="./global.d.ts" />

// 环境检测
// 注意：不能用 Reflect.get(globalThis, api) —— Tampermonkey 5.3+（MV3 userScripts API 模式）
// 将 GM API 以作用域级绑定注入，globalThis 上取不到，会误判为不支持。
if (
	typeof GM_getTab === 'undefined' ||
	typeof GM_saveTab === 'undefined' ||
	typeof GM_setValue === 'undefined' ||
	typeof GM_getValue === 'undefined' ||
	typeof GM_listValues === 'undefined' ||
	typeof GM_deleteValue === 'undefined' ||
	typeof GM_notification === 'undefined' ||
	typeof GM_xmlhttpRequest === 'undefined' ||
	typeof GM_getResourceText === 'undefined' ||
	typeof GM_addValueChangeListener === 'undefined' ||
	typeof GM_removeValueChangeListener === 'undefined'
) {
	const open = confirm(
		`OCS网课脚本不支持当前的脚本管理器（${GM_info.scriptHandler}）。` +
			'请前往 https://docs.ocsjs.com/docs/script 下载指定的脚本管理器，例如 “Scriptcat 脚本猫” 或者 “Tampermonkey 油猴”'
	);

	if (open) {
		window.location.href = 'https://docs.ocsjs.com/docs/script';
	}
	return;
}

const { start, definedProjects, CommonProject, RenderScript } = OCS;

const infos = GM_info;

(function () {
	'use strict';

	const projects = definedProjects();

	// 运行脚本
	start({
		projects: projects,
		renderConfig: {
			renderScript: RenderScript,
			styles: [STYLE],
			defaultPanelName: CommonProject.scripts.guide.namespace,
			title: `OCS-${infos.script.version}`
		},
		updatePage: 'https://docs.ocsjs.com/docs/update'
	});
})();
