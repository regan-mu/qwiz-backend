"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogout = exports.handleRefreshToken = exports.loginUser = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// User Login
const loginUser = async (req, res, next) => {
    const userInfo = req.body;
    try {
        const user = await client_1.default.user.findFirst({
            where: { email: userInfo.email },
        });
        if (!user) {
            res.status(401).json({ message: "Invalid Email/Password" });
            return;
        }
        const isCorrectPassword = await bcryptjs_1.default.compare(userInfo.password, user.password);
        if (!isCorrectPassword) {
            res.status(401).json({ message: "Invalid Email/Password" });
            return;
        }
        // Sign access & refresh tokens
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
        // Save refresh token to db
        await client_1.default.user.update({
            where: { id: user.id },
            data: { refresh_token: refreshToken },
        });
        // Send refresh token in cookie
        res.cookie("refreshToken", refreshToken, {
            maxAge: 24 * 60 * 60 * 100,
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        const { password, refresh_token, ...rest } = user;
        res.status(200).json({ accessToken, user: rest });
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
// Refresh Token
const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        res.status(401).json({ message: "Refresh Token Not provided" });
        return;
    }
    const refreshToken = cookies?.refreshToken;
    const foundUser = await client_1.default.user.findFirst({
        where: { refresh_token: refreshToken },
    });
    if (!foundUser) {
        res.status(403).json({ message: "Refresh token invalid" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (typeof payload === "string" || payload?.email !== foundUser.email) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        const { id, username, email } = payload;
        const accessToken = jsonwebtoken_1.default.sign({ id, username, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });
        res.status(200).json({ accessToken });
    }
    catch (error) {
        res.status(401).json({ message: "Invalid Token" });
    }
};
exports.handleRefreshToken = handleRefreshToken;
// Logout
const handleLogout = async (req, res, next) => {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
        res.sendStatus(204);
        return;
    }
    const refreshToken = cookies?.refreshToken;
    try {
        // Check the token owner exists
        const foundUser = await client_1.default.user.findFirst({
            where: { refresh_token: refreshToken },
        });
        if (!foundUser) {
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
            });
            res.sendStatus(204);
            return;
        }
        // Update the user to remove the refresh token.
        await client_1.default.user.update({
            where: { refresh_token: refreshToken },
            data: { refresh_token: null },
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.sendStatus(204);
    }
    catch (error) {
        next(error);
    }
};
exports.handleLogout = handleLogout;
