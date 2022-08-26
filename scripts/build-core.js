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
	return execOut('vue-tsc --noEmit && vite build  --emptyOutDir -c ./vite.config.ts', { cwd: '../packages/core' });
}

async function createUserJs(cb) {
	/** @type {import('../packages/core')} */
	const ocs = require('../dist/index');

	await createUserScript({
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
			description: `OCS 网课助手，支持 ${ocs.definedScripts
				.filter((s) => !s.hide)
				.map((s) => s.name)}，等网课的视频学习，自动跳转，及部分的作业，考试功能。`,
			author: 'enncy',
			license: 'MIT',
			namespace: 'https://enncy.cn',
			homepage: 'https://docs.ocsjs.com',
			source: 'https://github.com/ocsjs/ocsjs',
			icon: 'https://cdn.ocsjs.com/logo.ico',
			connect: ['enncy.cn', 'icodef.com', 'ocsjs.com', 'localhost'],
			match: ocs.definedScripts
				.filter((s) => !s.hide && s.domain)
				.map((s) => (Array.isArray(s.domain) ? s.domain : [s.domain]).map((d) => `*://*.${d}/*`))
				.flat(),
			grant: [
				'unsafeWindow',
				'GM_xmlhttpRequest',
				'GM_setValue',
				'GM_getValue',
				'GM_addValueChangeListener',
				'GM_removeValueChangeListener'
			],
			require: [path.join(__dirname, '../dist/index.js')],
			resource: [`OCS_STYLE ${path.join(__dirname, '../dist/style.css')}`],
			'run-at': 'document-start'
		},
		entry: path.join(__dirname, '../packages/core/entry.js'),
		dist: path.join(__dirname, '../dist/ocs.user.js')
	});
}

exports.default = series(cleanOutput, buildUserJs, createUserJs);
