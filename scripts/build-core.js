const { series } = require('gulp');
const fs = require('fs');
const del = require('del');
const util = require('util');
const { version } = require('../package.json');
const execOut = util.promisify(require('./utils').execOut);

function cleanOutput() {
	return del(['../dist', '../lib'], { force: true });
}

function buildUserJs() {
	return execOut('vue-tsc --noEmit && vite build  --emptyOutDir -c ./vite.config.ts', { cwd: '../packages/core' });
}

function createUserJs(cb) {
	const template = fs.readFileSync('../userjs.template').toString();
	const script = fs.readFileSync('../dist/index.js').toString();
	const style = fs.readFileSync('../dist/style.css').toString();
	const userjs = template
		.replace(/{{VERSION_SLOT}}/g, version)
		.replace(/{{SCRIPT_SLOT}}/g, script)
		.replace(/{{STYLE_SLOT}}/g, style);
	fs.writeFileSync('../dist/ocs.user.js', userjs);
	cb();
}

exports.default = series(cleanOutput, buildUserJs, createUserJs);
