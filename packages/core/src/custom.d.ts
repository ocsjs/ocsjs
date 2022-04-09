import * as ocs from "../index";

export {};

declare global {
    interface Window {
        OCS: typeof import("../index");
    }

    const OCS = ocs;
}
