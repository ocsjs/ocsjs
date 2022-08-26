const { series, src, dest } = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const { execOut } = require('./utils');
const { readFileSync } = require('fs');
const { version } = JSON.parse(readFileSync('../packages/app/package.json').toString());

function buildWeb() {
	return execOut('pnpm build', { cwd: '../packages/web' });
}

function buildApp() {
	return execOut('pnpm dist', { cwd: '../packages/app' });
}

function cleanOutput() {
	return del([`../packages/app/dist/app${version}.zip`], { force: true });
}

function packResource() {
	return src('../packages/app/dist/win-unpacked/resources/app/**/*')
		.pipe(zip(`app${version}.zip`))
		.pipe(dest('../packages/app/dist'));
}

exports.default = series(cleanOutput, buildWeb, buildApp, packResource);
