//@ts-check

const { pino } = require("pino");
const { app } = require("electron");
const path = require("path");
const dayjs = require("dayjs");

module.exports = function logger(name) {
    const dest = path.join(app.getPath("logs"), "/", dayjs().format("YYYY-MM-DD"), "/", name + ".log");

    return pino(
        {
            base: null,
            formatters: {
                level(label, number) {
                    return { level: label };
                },
            },
            timestamp: () => `,"time":"${new Date(Date.now()).toLocaleString()}"`,
            level: "debug",
        },
        pino.destination({
            dest,
            append: true,
            mkdir: true,
            sync: false,
        })
    );
};
