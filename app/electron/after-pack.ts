

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// 打包文件
export default function AfterAllPack() {
    var output = fs.createWriteStream(path.resolve('../resource/ocs-app-resource.zip'));
    var archive = archiver('zip');

    archive.on('error', function (err: any) {
        throw err;
    });
    archive.directory(path.resolve('./dist/win-unpacked/resources/app/'), false);
    archive.pipe(output);
    archive.finalize();
 
    if (fs.existsSync(path.resolve('./dist/latest.yml'))) {
        fs.copyFileSync(path.resolve('./dist/latest.yml'), path.resolve('../resource/latest.yml'))
    }


    console.log("打包完毕!");
}