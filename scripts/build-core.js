// @ts-check

const { series } = require('gulp');
const del = require('del');
const util = require('util');
const { version } = require('../package.json');
const execOut = util.promisify(require('./utils').execOut);
const { createUserScript } = require('../packages/utils');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const distPath = process.env.BUILD_PATH || '../dist';
const distResolvedPath = path.resolve(__dirname, distPath);

function cleanOutput() {
	return del([distPath, '../lib'], { force: true });
}

async function buildPackages() {
	// @ts-ignore
	await execOut('vite build', { cwd: '../packages/core' });
	// @ts-ignore
	await execOut('vite build', { cwd: '../packages/scripts' });
}

async function createUserJs(cb) {
	/** 模拟浏览器环境 */
	require('browser-env')();

	// @ts-ignore
	globalThis.unsafeWindow = {};

	/** @type {import('../packages/scripts/src/index')} */
	// @ts-ignore
	const ocs = require(path.join(distPath, 'index.js'));

	const createOptions = () =>
		/** @type {import('../packages/utils').CreateOptions} */
		({
			parseRequire: true,
			parseResource: true,
			resourceBuilder: (key, value) => `const ${key} = \`${value}\`;`,
			metaDataFormatter: {
				header: '==UserScript==',
				footer: '==/UserScript==',
				prefix: '// ',
				symbol: '@',
				gap: '\t'.repeat(4)
			},
			metadata: {
				name: 'OCS 网课助手',
				version: version,
				description: `OCS(online-course-script) 网课助手，专注于帮助大学生从网课中释放出来。让自己的时间把握在自己的手中，拥有人性化的操作页面，流畅的步骤提示，支持 ${ocs
					.definedProjects()
					.filter((p) => p.studyProject)
					.map((s) => `【${s.name}】`)
					.join(' ')}，等网课的学习，作业。具体的功能请查看脚本悬浮窗中的教程页面，OCS官网 https://docs.ocsjs.com 。`,
				author: 'enncy',
				license: 'MIT',
				namespace: 'https://enncy.cn',
				homepage: 'https://docs.ocsjs.com',
				source: 'https://github.com/ocsjs/ocsjs',
				icon: 'https://cdn.ocsjs.com/logo.png',
				connect: ['enncy.cn', 'icodef.com', 'ocsjs.com', 'localhost'],
				match: Array.from(
					new Set(
						ocs
							.definedProjects()
							.map((p) => p.domains.map((d) => `*://*.${d}/*`))
							.flat()
					)
				),
				grant: [
					'GM_info',
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
				],
				require: [path.join(__dirname, distPath, 'index.js')],
				resource: [`STYLE ${path.join(__dirname, '../packages/scripts/assets/css/style.css')}`],
				'run-at': 'document-start',
				antifeature: 'payment'
			},
			entry: path.join(__dirname, '../packages/scripts/entry.js'),
			dist: path.join(__dirname, distPath, 'ocs.user.js')
		});

	await createUserScript(createOptions());
	const opts = createOptions();
	/** 创建调试脚本 */
	opts.parseRequire = false;
	opts.parseResource = false;
	opts.metadata.name = opts.metadata.name + '(dev)';
	opts.metadata.require = ['file://' + path.join(distResolvedPath, 'index.js')];
	opts.metadata.resource = [`STYLE file://${path.join(__dirname, '../packages/scripts/assets/css/style.css')}`];
	opts.entry = path.join(__dirname, '../packages/scripts/entry.dev.js');
	opts.dist = path.join(distResolvedPath, 'ocs.dev.user.js');
	/** 导出样式文件 */
	fs.copyFileSync(
		path.join(__dirname, '../packages/scripts/assets/css/style.css'),
		path.join(distResolvedPath, 'style.css')
	);

	await createUserScript(opts);
}

exports.default = series(cleanOutput, buildPackages, createUserJs);
