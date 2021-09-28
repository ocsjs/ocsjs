"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var archiver = require('archiver');
// 打包文件
function AfterPack(context) {
    var output = fs_1.default.createWriteStream('./dist/ocs-win-x64.zip');
    var archive = archiver('zip');
    archive.on('error', function (err) {
        throw err;
    });
    archive.pipe(output);
    archive.directory('./dist/win-unpacked', false);
    archive.finalize();
    console.log("打包完毕!");
}
exports.default = AfterPack;
