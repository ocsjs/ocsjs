const { Store } = require("electron-store");
const { app } = require("electron");

/**
 *
 * @param {Store<Record<string, unknown>>} store
 */
module.exports = function (store) {
    store.set("version", app.getVersion());
    store.set("path", app.getAppPath());
    store.set("name", app.getName());
    store.set("user-data-path", app.getPath("userData"));
    store.set("exe-path", app.getPath("exe"));
    store.set("logs-path", app.getPath("logs"));
};
