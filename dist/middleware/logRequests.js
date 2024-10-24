"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logRequests = exports.logger = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const date_fns_1 = require("date-fns");
const uuid_1 = require("uuid");
const fsPromises = fs_1.default.promises;
const logRequests = async (message, logName) => {
    const datetime = `${(0, date_fns_1.format)(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
    const logItem = `${datetime}\t${(0, uuid_1.v4)()}\t${message}\n`;
    try {
        if (!fs_1.default.existsSync(path_1.default.join(__dirname, "..", "..", "logs"))) {
            await fsPromises.mkdir(path_1.default.join(__dirname, "..", "..", "logs"));
        }
        await fsPromises.appendFile(path_1.default.join(__dirname, "..", "..", "logs", logName), logItem);
    }
    catch (error) {
        console.log(error);
    }
};
exports.logRequests = logRequests;
const logger = (req, res, next) => {
    logRequests(`${req.method}\t${req.headers.origin}\t"${req.url}"`, "requestLogs.txt");
    next();
};
exports.logger = logger;
