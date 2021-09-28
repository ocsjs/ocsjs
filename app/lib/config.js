"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserConfig = void 0;
var mode = ((_b = (_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV) === null || _b === void 0 ? void 0 : _b.startsWith("dev")) ? 'dev' : 'prod';
exports.BrowserConfig = {
    width: 800,
    height: 540,
    minWidth: 800,
    minHeight: 540,
    maximizable: false,
    frame: false,
    center: true,
    autoHideMenuBar: true,
    show: false,
    alwaysOnTop: mode === 'dev',
    webPreferences: {
        webSecurity: false,
        // 开启node
        nodeIntegration: true,
        contextIsolation: false,
    },
};
