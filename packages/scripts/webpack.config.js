const path = require("path");

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
    entry: "./lib/src/index.js",
    mode: "production",
    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "./"),
        library: "OCS",
    },
    optimization: {
        minimize: true,
    },
};
