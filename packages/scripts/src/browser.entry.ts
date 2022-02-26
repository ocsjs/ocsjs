/**
 * Browser API.
 *
 * this file is entry of webpack.
 *
 * includes all the function of web script.
 */

export * from "./browser";
export * from "./tampermonkey";
import { readFileSync } from "fs";
import { resolve } from "path";
import { logger } from "./browser";

const json = JSON.parse(readFileSync(resolve(__dirname, "../package.json")).toString());
(() => {
    logger("info", "OCS-v" + json.version + " 载入成功");
})();
