"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentWindow = void 0;
var index_1 = require("../puppeteer/cx/index");
var config_1 = require("../electron/config");
var path_1 = __importDefault(require("path"));
var types_1 = require("../puppeteer/cx/types");
var puppeteer_1 = require("../puppeteer");
// 在主进程中.
var electron_log_1 = require("electron-log");
var electron_1 = require("electron");
var mode = electron_1.app.isPackaged ? 'prod' : 'dev';
exports.CurrentWindow = undefined;
electron_1.app.disableHardwareAcceleration();
electron_1.app.whenReady().then(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // 注册协议
                electron_1.protocol.registerFileProtocol('app', function (req, callback) {
                    var url = req.url.replace('app://', '');
                    var resolve = path_1.default.normalize(path_1.default.resolve("./resources/app", url));
                    (0, electron_log_1.info)({ path: resolve });
                    callback({ path: resolve });
                });
                electron_1.app.on('activate', function () {
                    if (electron_1.BrowserWindow.getAllWindows().length === 0)
                        createWindow();
                });
                electron_1.app.on('window-all-closed', function () {
                    if (process.platform !== 'darwin')
                        electron_1.app.quit();
                });
                return [4 /*yield*/, createWindow()
                    // setTimeout(async () => {
                    //     await AutoUpdate()
                    // }, 10 * 1000);
                ];
            case 1:
                exports.CurrentWindow = _a.sent();
                return [2 /*return*/];
        }
    });
}); });
function createWindow() {
    return __awaiter(this, void 0, void 0, function () {
        function load() {
            // Load a remote URL  
            var promise = mode === 'dev' ? win.loadURL('http://localhost:3000') : win.loadURL('app://./public/index.html');
            promise.then(function (result) {
                win.show();
                if (mode.startsWith('dev')) {
                    win.webContents.openDevTools();
                }
                // 拦截页面跳转
                win.webContents.on('will-navigate', function (e, url) {
                    e.preventDefault();
                    electron_1.shell.openExternal(url);
                });
                win.webContents.setWindowOpenHandler(function (data) {
                    electron_1.shell.openExternal(data.url);
                    return {
                        action: 'deny'
                    };
                });
                electron_1.ipcMain.on('run-script', function () {
                    (0, puppeteer_1.StartPuppeteer)({
                        scripts: [index_1.CXScript],
                        callback: function (browser, pioneer) {
                            var _a;
                            return __awaiter(this, void 0, void 0, function () {
                                var s, cx;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            s = (_a = pioneer.runnableScripts) === null || _a === void 0 ? void 0 : _a.find(function (s) { return s.name === "cx"; });
                                            if (!s) return [3 /*break*/, 3];
                                            cx = s;
                                            return [4 /*yield*/, cx.index(types_1.LoginType["机构账号登录"])];
                                        case 1:
                                            _b.sent();
                                            return [4 /*yield*/, cx.login({
                                                    type: 3,
                                                    unitname: "广西大学行健文理学院",
                                                    uname: "18275719980",
                                                    password: "skeleton132525",
                                                }, {
                                                    username: "enncy",
                                                    password: "132525",
                                                })];
                                        case 2:
                                            _b.sent();
                                            _b.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        },
                    });
                });
                electron_1.ipcMain.on('get', function (event, arg) {
                    var property = arg[0];
                    event.returnValue = win[property];
                });
                electron_1.ipcMain.on('set', function (event, arg) {
                    var _a = [arg[0], arg[1]], property = _a[0], value = _a[1];
                    event.returnValue = win[property] = value;
                });
                electron_1.ipcMain.on('call', function (event, arg) {
                    var _a = __spreadArray([arg.shift()], arg, true), property = _a[0], value = _a.slice(1);
                    event.returnValue = win[property](value);
                });
                electron_1.ipcMain.on('on', function (event, eventName) {
                    win.on(eventName.split('-')[0], function () { return event.reply(eventName); });
                });
                electron_1.ipcMain.on('once', function (event, eventName) {
                    win.once(eventName.split('-')[0], function () { return event.reply(eventName); });
                });
            }).catch(function (err) {
                (0, electron_log_1.error)(err);
                setTimeout(function () {
                    load();
                }, 2000);
            });
        }
        var win;
        return __generator(this, function (_a) {
            win = new electron_1.BrowserWindow(config_1.BrowserConfig);
            load();
            return [2 /*return*/, win];
        });
    });
}
