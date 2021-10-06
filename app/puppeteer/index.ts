import { ScriptConstructor, RunnableScript, Pioneer } from "@pioneerjs/core";
import path from "path";
import puppeteer, { Browser } from "puppeteer-core";
import fs from 'fs';

// 获取 chrome 路径
export function getChromePath() {
    let paths = [process.env.ProgramFiles, process.env['ProgramFiles(x86)'], "C:\\Program Files", "C:\\Program Files (x86)"]
    let chromePath = paths
        .map(p => path.join(p || '', '\\Google\\Chrome\\Application\\chrome.exe'))
        .find(p => fs.existsSync(p))


    return chromePath
}



export function StartPuppeteer({ scripts, callback }: { scripts: ScriptConstructor<RunnableScript>[], callback: (browser: Browser, pioneer: Pioneer) => void }) {
    let chromePath = getChromePath()
    if (chromePath) {
        puppeteer.launch({
            // your chrome path
            executablePath: chromePath,
            defaultViewport: null,
            headless: false,
        }).then(async browser => {

            const pioneer = Pioneer.create(browser)



            await pioneer.startup({
                scripts,
                events: ['request', "response"],
                // methodProxy: {
                //     page: {
                //         keys: ['type'],
                //         handler(target: any, key: any, receiver: any) {
                //             console.log(`target method-${key}() is called`)
                //             // target method-goto() is called
                //             return Reflect.get(target, key, receiver);
                //         }
                //     }
                // }
            })
            callback(browser, pioneer)
        });
    } else {
        console.error('找不到 chrome 路径!!!');
    }
}