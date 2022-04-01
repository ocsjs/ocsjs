// @ts-check

const path = require("path");
const { BannerPlugin, DefinePlugin } = require("webpack");
const { name, license, author, version, homepage } = require("./package.json");
const TerserPlugin = require("terser-webpack-plugin");

const banner = `${name} ${version} (${homepage})
Copyright © ${author}
Licensed under ${license}`;

const plugins = [
    new BannerPlugin({ banner }),
    new DefinePlugin({
        "process.env.VERSION": JSON.stringify(version),
    }),
];

const optimization = (minimize) => ({
    minimize,
    minimizer: [
        new TerserPlugin({
            extractComments: false,
        }),
    ],
});

const output = (filename) =>
    /**
     * @type {import("webpack").Configuration}
     */
    ({
        mode: "production",
        entry: "./lib/index.js",
        output: {
            filename,
            path: path.resolve(__dirname, "dist/js"),
            library: "OCS",
        },
    });

/**
 * @type {import("webpack").Configuration[]}
 */
module.exports = [
    {
        ...output("index.min.js"),
        optimization: optimization(true),
        plugins,
    },
    {
        ...output("index.js"),
        optimization: optimization(false),
        plugins,
    },
];
