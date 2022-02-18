const path = require("path");

/**
 * @type {import("webpack").Configuration[]}
 */
module.exports = [
    {
        mode: "production",
        entry: "./packages/scripts/lib/src/browser.entry.js",
        output: {
            filename: "index.min.js",
            path: path.resolve(__dirname, "dist"),
            library: "OCS",
        },
    },
    {
        mode: "production",
        entry: "./packages/scripts/lib/src/browser.entry.js",
        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "dist"),
            library: "OCS",
        },
        optimization: {
            minimize: false,
        },
    },
];
