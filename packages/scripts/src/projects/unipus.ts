/* eslint-disable no-unused-vars */

import { Project, Script, $message, $ui, h, $gm } from 'easy-us';
import { CommonProject } from './common';
import { $, RemotePage, request } from '@ocsjs/core';
import { waitForElement } from '../utils/study';
import { $playwright } from '../utils/app';
import { BackgroundProject } from './background';
import { UnipusIpublishScript } from './unipus/ipublish';
import { UnipusExplorationScript } from './unipus/exploration';

export const UnipusProject = Project.create({
	name: 'U校园',
	domains: ['unipus.cn', 'docs.ocsjs.com'],
	scripts: {
		guid: new Script({
			name: '💡 使用提示',
			matches: [
				['我的课程页', '/app/cmgt/course-management'],
				['首页', '/home']
			],
			configs: {
				notes: {
					defaultValue: $ui.notes(['打开任意课程进行自动学习！']).outerHTML
				}
			},
			onrender(elements) {},
			oncomplete() {
				CommonProject.scripts.render.methods.pin(this);
			}
		}),
		'default-study': new Script({
			name: '🖥️ 普通版-课程学习',
			namespace: 'unipus.default.study',
			matches: [['普通学习页面', 'unipus.cn/_pc_default/pc.html']],
			oncomplete() {}
		}),
		'exploration-study': UnipusExplorationScript,
		'ipublish-study': UnipusIpublishScript
	}
});
