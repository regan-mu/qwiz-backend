"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashUserPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashUserPassword = (plainPassword) => {
    bcryptjs_1.default.genSalt(10, function (err, salt) {
        bcryptjs_1.default.hash(plainPassword, salt, function (err, hash) {
            if (err) {
                next(err);
            }
            return hash;
        });
    });
};
exports.hashUserPassword = hashUserPassword;
