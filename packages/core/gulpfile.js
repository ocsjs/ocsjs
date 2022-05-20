const { series } = require('gulp');
const del = require('del');
const { execOut } = require('../../scripts/utils');

function cleanOutput() {
  return del(['./dist']);
}

exports.default = series(
  cleanOutput,
  series(
    () => execOut('vue-tsc --noEmit && vite build  --emptyOutDir false  -c vite.config.ts'),
    () => execOut('vue-tsc --noEmit && vite build  --emptyOutDir false  -c vite.config.min.ts')
  )
);
