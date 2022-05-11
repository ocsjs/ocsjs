import { message } from './components/utils';
import { CommonScript } from './script/common';
import { CXScript } from './script/cx';
import { store } from './script/index';
import { ZHSScript } from './script/zhs';
import { app, loaded, panel, start } from './start';

export * from './core/index';
/**
 * ocsjs
 */
export { store, start, app, panel, loaded, message };

// @ts-ignore vite.define
export const VERSION = process.env._VERSION_;

/** 默认脚本列表 */
export const definedScripts = [CommonScript, CXScript, ZHSScript];
