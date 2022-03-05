import { ITerminalOptions, Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { debounce } from "../../utils";
const { clipboard } = require("electron");
const fitAddon = new FitAddon();

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
        this.loadAddon(fitAddon);
        this.onKey((key) => {
            const char = key.domEvent.key;
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
        debounce(this.fit, 500)();
    }

    writeln(data: string | Uint8Array, callback?: () => void): void {
        super.writeln(data, callback);
        debounce(this.fit, 500)();
    }
}
