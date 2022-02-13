import { chromium } from "playwright";
import { ScriptOptions } from "./types";
 
export async function Script(options: ScriptOptions) {
    const browser = await chromium.launch(options);
    const page = await browser.newPage();
    return page;
}
