import * as ocs from "../index";

export {};

declare global {
    interface Window {
        OCS: typeof import("../index");
    }
    const unsafeWindow: Window | null;
    const OCS = ocs;
}
