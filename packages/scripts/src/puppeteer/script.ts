import { chromium } from "playwright";
import { ScriptOptions } from "./types";

export interface ScriptConfig {}

export async function Script(options: ScriptOptions, config?: ScriptConfig) {
    const browser = await chromium.launch(options.launchOptions);

    const page = await browser.newPage();

    return page;
}
