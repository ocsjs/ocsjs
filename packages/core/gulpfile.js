const { series } = require('gulp');
const del = require('del');
const { execOut } = require('../../scripts/utils');
const fs = require('fs');
const path = require('path');
const { version } = require('../../package.json');

function cleanOutput() {
  return del(['./dist']);
}

function buildUserJs(cb) {
  const template = fs.readFileSync(path.join(__dirname, './userjs.template')).toString();
  const script = fs.readFileSync('./dist/index.js').toString();
  const style = fs.readFileSync('./dist/style.css').toString();
  const userjs = template.replace(/{{version}}/g, version).replace(/{{script}}/g, script).replace(/{{style}}/g, style);
  fs.writeFileSync('./dist/ocs.user.js', userjs);
  cb();
}

exports.default = series(
  cleanOutput,
  series(
    () => execOut('vue-tsc --noEmit && vite build  --emptyOutDir false  -c vite.config.ts'),
    () => execOut('vue-tsc --noEmit && vite build  --emptyOutDir false  -c vite.config.min.ts'),
    buildUserJs
  )
);
