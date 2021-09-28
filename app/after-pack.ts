

import fs from 'fs';
const archiver = require('archiver');

// 打包文件
export default function AfterPack(context: any) {
    var output = fs.createWriteStream('./dist/ocs-win-x64.zip');
    var archive = archiver('zip');

    archive.on('error', function (err: any) {
        throw err;
    });

    archive.pipe(output);
    archive.directory('./dist/win-unpacked', false);

    archive.finalize();

    console.log("打包完毕!");
}