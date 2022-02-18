/**
 * Browser API.
 *
 * this file is entry of webpack.
 *
 * includes all the function of web script.
 */

export * from "./browser";
export * from "./tampermonkey";

import json from "../package.json";
import { logger } from "./browser";

(() => {
    logger("info", "OCS-v" + json.version + " 载入成功");
})();
