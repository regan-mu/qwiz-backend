"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword = async (password) => {
    try {
        const salt_rounds = Number(process.env.SALT_ROUNDS);
        const salt = await bcryptjs_1.default.genSalt(salt_rounds);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        return hashedPassword;
    }
    catch (err) {
        throw new Error("Error hashing the password");
    }
};
exports.default = hashPassword;
