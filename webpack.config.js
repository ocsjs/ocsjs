const path = require("path");
const { BannerPlugin } = require("webpack");
const { name, license, author, version, homepage } = require("./package.json");
const TerserPlugin = require("terser-webpack-plugin");

const banner = `${name} ${version} (${homepage})
Copyright © ${author}
Licensed under ${license}`;

/**
 * @type {import("webpack").Configuration[]}
 */
module.exports = [
    {
        mode: "production",
        entry: "./lib/index.js",
        output: {
            filename: "index.min.js",
            path: path.resolve(__dirname, "dist/js"),
            library: "OCS",
            environment: {},
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ],
        },
        plugins: [new BannerPlugin({ banner })],
    },
    {
        mode: "production",
        entry: "./lib/index.js",
        output: {
            filename: "index.js",
            path: path.resolve(__dirname, "dist/js"),
            library: "OCS",
        },
        optimization: {
            minimize: false,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                }),
            ],
        },
        plugins: [new BannerPlugin({ banner })],
    },
];
