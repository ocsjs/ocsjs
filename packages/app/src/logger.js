//@ts-check
const { Logger } = require("./logger.core");
const { app } = require("electron");

module.exports = function logger(...name) {
    return new Logger(app.getPath("logs"), true, ...name);
};
