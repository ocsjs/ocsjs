"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var archiver = require('archiver');
// 打包文件
function AfterPack(context) {
    setTimeout(function () {
        var output = fs_1.default.createWriteStream('./resource/ocs-app-resources.zip');
        var archive = archiver('zip');
        archive.on('error', function (err) {
            throw err;
        });
        archive.pipe(output);
        archive.directory('./dist/win-unpacked/resources/app/', false);
        archive.finalize();
        console.log("打包完毕!");
    }, 10 * 1000);
}
exports.default = AfterPack;
