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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CXLogin = void 0;
var common_1 = require("@pioneerjs/common");
var core_1 = require("@pioneerjs/core");
var ocr_1 = require("../common/ocr");
var status_types_1 = require("../common/status.types");
var CXLogin = /** @class */ (function (_super) {
    __extends(CXLogin, _super);
    function CXLogin() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CXLogin.prototype.login = function (scriptEvent, loginConfig, ocrOptions) {
        return __awaiter(this, void 0, void 0, function () {
            // 查看页面是否有错误信息
            function checkPageError() {
                return __awaiter(this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                waitFor.nextTick('request', function () { return __awaiter(_this, void 0, void 0, function () {
                                    var errs;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, waitFor.documentReady()];
                                            case 1:
                                                _a.sent();
                                                return [4 /*yield*/, page.evaluate(function () { return Array.from(document.querySelectorAll('[class*=err]')).map(function (e) { return e.innerText; }).filter(function (e) { return e && e !== ''; }); })];
                                            case 2:
                                                errs = _a.sent();
                                                resolve(errs);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            })];
                    });
                });
            }
            var page, utils, waitFor, loginTimes, breakCode, check;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        page = this.page;
                        utils = new core_1.Utils(this);
                        waitFor = new core_1.WaitForScript(this);
                        loginTimes = this.context.store.get('login-times');
                        if (loginTimes > 3) {
                            scriptEvent.error(status_types_1.Status['自动登录运行超过限制次数'], '请自行输入账号密码登录！');
                            this.context.store.set('login-times', 0);
                            return [2 /*return*/];
                        }
                        else {
                            this.context.store.set('login-times', loginTimes + 1 || 0);
                        }
                        breakCode = function (ocrOptions) { return __awaiter(_this, void 0, void 0, function () {
                            var clip, buffer, code;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.getElementClip('#numVerCode')];
                                    case 1:
                                        clip = _a.sent();
                                        if (!clip) return [3 /*break*/, 7];
                                        return [4 /*yield*/, page.screenshot({ clip: clip })];
                                    case 2:
                                        buffer = _a.sent();
                                        if (!buffer) return [3 /*break*/, 7];
                                        return [4 /*yield*/, ocr_1.OCR.resolve(ocrOptions, buffer)];
                                    case 3:
                                        code = _a.sent();
                                        if (!(code && code.trim() !== '')) return [3 /*break*/, 7];
                                        return [4 /*yield*/, utils.value('#vercode', code)];
                                    case 4:
                                        _a.sent();
                                        return [4 /*yield*/, page.click('#loginBtn')];
                                    case 5:
                                        _a.sent();
                                        return [4 /*yield*/, waitFor.documentReady()];
                                    case 6:
                                        _a.sent();
                                        return [2 /*return*/, true];
                                    case 7: return [2 /*return*/, false];
                                }
                            });
                        }); };
                        check = function () { return __awaiter(_this, void 0, void 0, function () {
                            var errs;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, checkPageError()];
                                    case 1:
                                        errs = _a.sent();
                                        if (!(errs.length !== 0)) return [3 /*break*/, 7];
                                        if (!errs.some(function (e) { return /验证码/.test(e); })) return [3 /*break*/, 4];
                                        scriptEvent.error(status_types_1.Status['验证码破解失败'], "即将重新破解验证码");
                                        return [4 /*yield*/, waitFor.sleep(2000)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, this.login(scriptEvent, loginConfig, ocrOptions)];
                                    case 3:
                                        _a.sent();
                                        return [3 /*break*/, 6];
                                    case 4:
                                        scriptEvent.error(status_types_1.Status['登录失败'], errs + " , 请在页面上输入登录信息，并自行点击登录");
                                        return [4 /*yield*/, this.waitForLogin()];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6: return [3 /*break*/, 11];
                                    case 7: return [4 /*yield*/, this.islogin()];
                                    case 8:
                                        if (!!(_a.sent())) return [3 /*break*/, 10];
                                        return [4 /*yield*/, this.waitForLogin()];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10:
                                        scriptEvent.success(status_types_1.Status['登录成功']);
                                        _a.label = 11;
                                    case 11: return [2 /*return*/];
                                }
                            });
                        }); };
                        if (!(loginConfig.type === 1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, utils.value('#phone', loginConfig.phone)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, utils.value('#pwd', loginConfig.password)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, page.click('#loginBtn')];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, waitFor.documentReady()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, check()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 20];
                    case 6:
                        if (!(loginConfig.type === 2)) return [3 /*break*/, 9];
                        return [4 /*yield*/, utils.value('#phone', loginConfig.phone)];
                    case 7:
                        _a.sent();
                        scriptEvent.warn(status_types_1.Status['等待用户自行登录中'], '请在页面上输入您的手机验证码，并自行点击登录');
                        return [4 /*yield*/, this.waitForLogin()];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 20];
                    case 9:
                        if (!(loginConfig.type === 3)) return [3 /*break*/, 20];
                        return [4 /*yield*/, utils.value("#inputunitname", loginConfig.unitname)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, utils.value('#uname', loginConfig.uname)];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, utils.value('#password', loginConfig.password)];
                    case 12:
                        _a.sent();
                        if (!ocrOptions) return [3 /*break*/, 18];
                        return [4 /*yield*/, breakCode(ocrOptions)];
                    case 13:
                        if (!_a.sent()) return [3 /*break*/, 15];
                        return [4 /*yield*/, check()];
                    case 14:
                        _a.sent();
                        return [3 /*break*/, 17];
                    case 15:
                        scriptEvent.error(status_types_1.Status['等待用户自行登录中'], '验证码破解失败！请在页面上输入验证码，并自行点击登录');
                        return [4 /*yield*/, this.waitForLogin()];
                    case 16:
                        _a.sent();
                        _a.label = 17;
                    case 17: return [3 /*break*/, 20];
                    case 18: return [4 /*yield*/, this.waitForLogin()];
                    case 19:
                        _a.sent();
                        scriptEvent.warn(status_types_1.Status['等待用户自行登录中'], '请在页面上输入验证码，并自行点击登录');
                        _a.label = 20;
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    // 检测是否登录
    CXLogin.prototype.islogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.page.url().startsWith('http://i.mooc.chaoxing.com/space/index')];
            });
        });
    };
    // 获取元素的位置信息
    CXLogin.prototype.getElementClip = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.page.evaluate(function (selector) {
                            var target = document.querySelector(selector);
                            if (target) {
                                var _a = target.getBoundingClientRect() || {}, x = _a.x, y = _a.y, width = _a.width, height = _a.height;
                                return { x: x, y: y, width: width, height: height };
                            }
                        }, selector)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // 等待用户自己输入信息登录
    CXLogin.prototype.waitForLogin = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var lis = function (event) {
                            if (event.resourceType() === 'document' && _this.islogin()) {
                                _this.page.off('request', lis);
                                resolve();
                            }
                        };
                        _this.page.on('request', lis);
                    })];
            });
        });
    };
    CXLogin = __decorate([
        common_1.Injectable()
    ], CXLogin);
    return CXLogin;
}(core_1.InjectableScript));
exports.CXLogin = CXLogin;
