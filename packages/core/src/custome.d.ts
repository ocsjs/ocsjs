import * as ocs from "./browser.entry";

export {};

declare global {
    interface Window {
        OCS: typeof import("./browser.entry");
    }

    const OCS = ocs;
}
