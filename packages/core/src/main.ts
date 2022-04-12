import { store } from "./script/index";
import { CommonScript } from "./script/common";
import { ZHSScript } from "./script/zhs";
import { CXScript } from "./script/cx";
import { start } from "./start";

export * from "./core/index";

/** 默认脚本列表 */
export const definedScripts = [CommonScript, ZHSScript, CXScript];

// @ts-ignore vite.define
const VERSION = process.env._VERSION_;

/**
 * ocsjs
 */
export { store, start, VERSION };
