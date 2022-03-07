import { ITerminalOptions, Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { debounce } from "../../utils";
const { clipboard } = require("electron");
const fitAddon = new FitAddon();

/**
 * xterm 终端
 *
 * @see https://github.com/xtermjs/xterm.js
 */
export class ITerminal extends Terminal {
    constructor(options?: ITerminalOptions) {
        super(
            Object.assign(
                {
                    cursorBlink: true,
                    convertEol: true,
                    fontFamily: "Consolas, 'Courier New', monospace",
                    fontSize: 12,
                    theme: { background: "#32302F" },
                    rows: 20,
                },
                options
            )
        );
        /** 载入窗口尺寸自适应插件 */
        this.loadAddon(fitAddon);
        this.onKey((key) => {
            const char = key.domEvent.key;
            /** 复制内容 */
            if (key.domEvent.ctrlKey && char === "c") {
                clipboard.writeText(this.getSelection());
            }
        });

        window.onresize = () => {
            this.fit();
        };
    }

    fit() {
        fitAddon.fit();
    }

    write(data: string) {
        super.write(data);
        /** 内容写入时，定时自适应界面 */
        debounce(this.fit, 500)();
    }

    writeln(data: string | Uint8Array, callback?: () => void): void {
        super.writeln(data, callback);
        /** 内容写入时，定时自适应界面 */
        debounce(this.fit, 500)();
    }
}
