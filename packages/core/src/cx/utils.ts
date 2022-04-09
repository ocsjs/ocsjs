// @ts-nocheck

import { logger } from "../logger";

/**
 * 屏蔽倍速限制
 */
export function rateHack() {
    try {
        hack();
        window.document.addEventListener("readystatechange", hack);
        window.addEventListener("load", hack);
    } catch (e) {
        console.error(e.message);
    }
}

function hack() {
    if (videojs && Ext) {
        logger("debug", "倍速破解启动");

        Ext.define("ans.VideoJs", {
            override: "ans.VideoJs",
            constructor: function (b) {
                b = b || {};
                var e = this;
                e.addEvents(["seekstart"]);
                e.mixins.observable.constructor.call(e, b);
                var c = videojs(b.videojs, e.params2VideoOpt(b.params), function () {});
                Ext.fly(b.videojs).on("contextmenu", function (f) {
                    f.preventDefault();
                });
                Ext.fly(b.videojs).on("keydown", function (f) {
                    if (f.keyCode == 32 || f.keyCode == 37 || f.keyCode == 39 || f.keyCode == 107) {
                        f.preventDefault();
                    }
                });
                if (c.videoJsResolutionSwitcher) {
                    c.on("resolutionchange", function () {
                        var g = c.currentResolution(),
                            f = g.sources ? g.sources[0].res : false;
                        Ext.setCookie("resolution", f);
                    });
                }
            },
        });
    }
}
