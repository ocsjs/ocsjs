// ==UserScript==
// @name       				OCS 网课助手(dev)
// @version    				4.4.5
// @description				OCS(online-course-script) 网课助手，专注于帮助大学生从网课中释放出来。让自己的时间把握在自己的手中，拥有人性化的操作页面，流畅的步骤提示，支持 【知到智慧树】 【超星学习通】 【智慧职教(MOOC学院)】 【职教云】，等网课的学习，作业。具体的功能请查看脚本悬浮窗中的教程页面，OCS官网 https://docs.ocsjs.com 。
// @author     				enncy
// @license    				MIT
// @match      				*://*.zhihuishu.com/*
// @match      				*://*.chaoxing.com/*
// @match      				*://*.edu.cn/*
// @match      				*://*.org.cn/*
// @match      				*://*.xueyinonline.com/*
// @match      				*://*.hnsyu.net/*
// @match      				*://*.icve.com.cn/*
// @match      				*://*.course.icve.com.cn/*
// @match      				*://*.icve.com.cn/*
// @match      				*://*.zjy2.icve.com.cn/*
// @grant      				GM_info
// @grant      				GM_getTab
// @grant      				GM_saveTab
// @grant      				GM_setValue
// @grant      				GM_getValue
// @grant      				unsafeWindow
// @grant      				GM_listValues
// @grant      				GM_deleteValue
// @grant      				GM_notification
// @grant      				GM_xmlhttpRequest
// @grant      				GM_getResourceText
// @grant      				GM_addValueChangeListener
// @grant      				GM_removeValueChangeListener
// @run-at     				document-start
// @namespace  				https://enncy.cn
// @homepage   				https://docs.ocsjs.com
// @source     				https://github.com/ocsjs/ocsjs
// @icon       				https://cdn.ocsjs.com/logo.png
// @connect    				enncy.cn
// @connect    				icodef.com
// @connect    				ocsjs.com
// @connect    				localhost
// @require    				file://D:\code\ocsjs\dist\index.js
// @resource   				STYLE file://D:\code\ocsjs\packages\scripts\assets\css\style.css
// @antifeature				payment
// ==/UserScript==





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
