

import fs from 'fs';
const archiver = require('archiver');

// 打包文件
export default function AfterPack(context: any) {
    setTimeout(() => {
        var output = fs.createWriteStream('./dist/ocs-app-resource.zip');
        var archive = archiver('zip');

        archive.on('error', function (err: any) {
            throw err;
        });

        archive.pipe(output);
        archive.directory('./dist/win-unpacked/resources/app/', false);

        archive.finalize();

        console.log("打包完毕!");
    }, 10 * 1000);
}