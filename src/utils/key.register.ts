import { Remote } from "./remote";

export function RegisterKey(el: any, key: string, handler: () => void) {
    let keys = "";
    function handleKeyPress(e: any) {
        // You can put code here to handle the keypress.
        keys += e.key;
        if (RegExp(key).test(keys)) {
            handler();
            keys = "";
        }
    }
    el.addEventListener("keyup", handleKeyPress, true);
}

export function RegisterKeys(window: any) {
    // 键入 ocsdev 打开软件开发者工具
    RegisterKey(window, "ocsdev", () => {
        Remote.webContents.call("openDevTools");
    });
}
