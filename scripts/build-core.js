const { series } = require('gulp');
const del = require('del');
const util = require('util');
const { version } = require('../package.json');
const execOut = util.promisify(require('./utils').execOut);
const { createUserScript } = require('../packages/utils');
const path = require('path');

function cleanOutput() {
	return del(['../dist', '../lib'], { force: true });
}

function buildUserJs() {
	return execOut('npm run build', { cwd: '../packages/core' });
}

async function createUserJs(cb) {
	/** 模拟浏览器环境 */
	require('browser-env')();
	/** @type {import('../packages/core')} */
	const ocs = require('../dist/index');

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
				description: `OCS 网课助手，支持 ${ocs.definedProjects.map(
					(s) => s.name
				)}，等网课的视频学习，自动跳转，及部分的作业，考试功能。`,
				author: 'enncy',
				license: 'MIT',
				namespace: 'https://enncy.cn',
				homepage: 'https://docs.ocsjs.com',
				source: 'https://github.com/ocsjs/ocsjs',
				icon: 'https://cdn.ocsjs.com/logo.ico',
				connect: ['enncy.cn', 'icodef.com', 'ocsjs.com', 'localhost'],
				match: ocs.definedProjects.map((p) => p.domains.map((d) => `*://*.${d}/*`)).flat(),
				grant: [
					'unsafeWindow',
					'GM_xmlhttpRequest',
					'GM_setValue',
					'GM_getValue',
					'GM_getResourceText',
					'GM_addValueChangeListener',
					'GM_removeValueChangeListener'
				],
				require: [path.join(__dirname, '../dist/index.js')],
				resource: [`STYLE ${path.join(__dirname, '../packages/core/assets/css/style.css')}`],
				'run-at': 'document-start'
			},
			entry: path.join(__dirname, '../packages/core/entry.js'),
			dist: path.join(__dirname, '../dist/ocs.user.js')
		});

	await createUserScript(createOptions());
	const opts = createOptions();
	/** 创建调试脚本 */
	opts.parseRequire = false;
	opts.parseResource = false;
	opts.metadata.name = opts.metadata.name + '(dev)';
	opts.metadata.require = ['file://' + path.join(__dirname, '../dist/index.js')];
	opts.metadata.resource = [`STYLE file://${path.join(__dirname, '../packages/core/assets/css/style.css')}`];
	opts.entry = path.join(__dirname, '../packages/core/entry.dev.js');
	opts.dist = path.join(__dirname, '../dist/ocs.user.dev.js');
	await createUserScript(opts);
}

exports.default = series(cleanOutput, buildUserJs, createUserJs);
