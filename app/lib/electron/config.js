"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserConfig = void 0;
var electron_1 = require("electron");
var mode = electron_1.app.isPackaged ? 'prod' : 'dev';
exports.BrowserConfig = {
    width: 800,
    height: 540,
    minWidth: 800,
    minHeight: 540,
    maximizable: false,
    icon: './public/favicon.ico',
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
