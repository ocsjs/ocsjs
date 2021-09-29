"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var dayjs_1 = __importDefault(require("dayjs"));
var electron_1 = require("electron");
var Logger = /** @class */ (function () {
    function Logger(scriptName) {
        this.scriptName = scriptName;
        this.path = electron_1.app.getPath('userData');
    }
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.save.apply(this, __spreadArray(['info'], args));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.save.apply(this, __spreadArray(['warn'], args));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.save.apply(this, __spreadArray(['error'], args));
    };
    Logger.prototype.save = function (level) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var data = {
            script: this.scriptName,
            localTime: dayjs_1.default().format('YYYY-MM-DD HH-mm-ss'),
            data: __spreadArray([], args)
        };
        var folder = path_1.default.resolve(this.path, "./logs/" + this.getFolderName() + "/");
        var file = path_1.default.resolve(folder, level + "-" + this.scriptName + ".json");
        if (fs_1.default.existsSync(file)) {
            var logsJSON = JSON.parse(fs_1.default.readFileSync(file).toString());
            logsJSON.push(data);
            fs_1.default.writeFileSync(file, JSON.stringify(logsJSON, null, 4));
        }
        else {
            this.mkdirs(folder);
            fs_1.default.writeFileSync(file, JSON.stringify([data], null, 4));
        }
    };
    Logger.prototype.getFolderName = function () {
        return dayjs_1.default().format("YYYY-MM-DD");
    };
    Logger.prototype.mkdirs = function (url) {
        if (!fs_1.default.existsSync(url)) {
            this.mkdirs(path_1.default.resolve(url, "../"));
            fs_1.default.mkdirSync(url);
        }
    };
    return Logger;
}());
exports.Logger = Logger;
