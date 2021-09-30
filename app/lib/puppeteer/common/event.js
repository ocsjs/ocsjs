"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptEvent = void 0;
var status_types_1 = require("./status.types");
var events_1 = __importDefault(require("events"));
var log_1 = require("./log");
var main_1 = require("../../electron/main");
var ScriptEvent = /** @class */ (function (_super) {
    __extends(ScriptEvent, _super);
    function ScriptEvent(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.log = new log_1.Logger(_this.name);
        return _this;
    }
    ScriptEvent.prototype.info = function (status, msg) {
        if (msg === void 0) { msg = ''; }
        this.log.info({ status: status_types_1.Status[status], msg: msg });
        this.emit('info', status_types_1.Status[status], msg);
        main_1.CurrentWindow === null || main_1.CurrentWindow === void 0 ? void 0 : main_1.CurrentWindow.webContents.send('info', status_types_1.Status[status], msg);
    };
    ScriptEvent.prototype.success = function (status, msg) {
        if (msg === void 0) { msg = ''; }
        this.log.info({ status: status_types_1.Status[status], msg: msg });
        this.emit('success', status_types_1.Status[status], msg);
        main_1.CurrentWindow === null || main_1.CurrentWindow === void 0 ? void 0 : main_1.CurrentWindow.webContents.send('success', status_types_1.Status[status], msg);
    };
    ScriptEvent.prototype.error = function (status, msg) {
        if (msg === void 0) { msg = ''; }
        this.log.error({ status: status_types_1.Status[status], msg: msg });
        this.emit('error', status_types_1.Status[status], msg);
        main_1.CurrentWindow === null || main_1.CurrentWindow === void 0 ? void 0 : main_1.CurrentWindow.webContents.send('error', status_types_1.Status[status], msg);
    };
    ScriptEvent.prototype.warn = function (status, msg) {
        if (msg === void 0) { msg = ''; }
        this.log.warn({ status: status_types_1.Status[status], msg: msg });
        this.emit('warning', status_types_1.Status[status], msg);
        main_1.CurrentWindow === null || main_1.CurrentWindow === void 0 ? void 0 : main_1.CurrentWindow.webContents.send('warning', status_types_1.Status[status], msg);
    };
    ScriptEvent.prototype.onInfo = function (listener) {
        this.on('info', listener);
    };
    ScriptEvent.prototype.onError = function (listener) {
        this.on('error', listener);
    };
    ScriptEvent.prototype.onSuccess = function (listener) {
        this.on('success', listener);
    };
    ScriptEvent.prototype.onWarning = function (listener) {
        this.on('warning', listener);
    };
    return ScriptEvent;
}(events_1.default));
exports.ScriptEvent = ScriptEvent;
