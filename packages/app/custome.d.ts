import * as ocs from "@ocsjs/scripts/lib/browser.entry";

export {};

declare global {
    interface Window {
        OCS: typeof import("@ocsjs/scripts/lib/browser.entry");
        $: any;
    }

    const OCS = ocs;
    const $: any = {};
}
