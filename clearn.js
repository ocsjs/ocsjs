const fs = require('fs');

fs.rmSync('./node_modules/.vite', { force: true, recursive: true })

console.log("缓存清除完毕!");