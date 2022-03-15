const path = require("path");

/**
 * @type {import("webpack").Configuration[]}
 */
module.exports = [
    {
        mode: "production",
        entry: "./lib/browser.entry.js",
        output: {
            filename: "index.min.js",
            path: path.resolve(__dirname, "dist/js"),
            library: "OCS",
        },
    },
    {
        mode: "production",
        entry: "./lib/browser.entry.js",
        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "dist/js"),
            library: "OCS",
        },
        optimization: {
            minimize: false,
        },
    },
];
