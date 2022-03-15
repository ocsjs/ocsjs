/**
 * Browser API.
 *
 * this file is entry of webpack.
 *
 * includes all the function of web script.
 */

import { logger } from "./logger";
export * from "./browser";

(() => {
    logger("info", "OCS 载入成功");
})();
