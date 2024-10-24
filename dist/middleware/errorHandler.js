"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logRequests_1 = require("./logRequests");
const errorHandler = (error, req, res) => {
    (0, logRequests_1.logRequests)(`${req?.method}\t${req?.headers?.origin}\t"${error?.name}: ${error?.message}"`, "errorLogs.txt");
    res.status(500).json({ message: error.message });
};
exports.default = errorHandler;
