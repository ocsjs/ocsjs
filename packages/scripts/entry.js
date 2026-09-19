/* eslint-disable no-undef, max-len */
/// <reference path="./global.d.ts" />

// 环境检测
if (
	[
		'GM_getTab',
		'GM_saveTab',
		'GM_setValue',
		'GM_getValue',
		'unsafeWindow',
		'GM_listValues',
		'GM_deleteValue',
		'GM_notification',
		'GM_xmlhttpRequest',
		'GM_getResourceText',
		'GM_addValueChangeListener',
		'GM_removeValueChangeListener'
	].some((api) => typeof Reflect.get(globalThis, api) === 'undefined')
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

const { start, definedProjects, CommonProject, RenderScript, logoSvg } = OCS;

// 预设题库配置一键获取渠道（题库站登录后 postMessage 自动回填，无需手动复制粘贴）
// 对接文档：docs/题库配置一键获取对接文档.md（言溪题库，协议 v1）；未配置时不显示一键获取入口，手动配置功能不受影响
OCS.setAnswererConfigProvider({
	name: '言溪题库',
	connectUrl: 'https://tk.enncy.cn/ocs/connect'
});

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
			title: `${logoSvg} OCS <span style="font-size: 12px; color: #969696;">v${infos.script.version}</span>`
		},
		updatePage: 'https://docs.ocsjs.com/docs/update'
	});
})();
