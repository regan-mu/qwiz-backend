"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = (req, res, next) => {
    const SECRET = process.env.ACCESS_TOKEN_SECRET;
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    const jwtToken = authHeader.split(" ")[1];
    // If token is not present, respond with Unauthorized
    if (!jwtToken) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(jwtToken, SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Forbidden" });
        return;
    }
};
exports.default = authenticateJWT;
