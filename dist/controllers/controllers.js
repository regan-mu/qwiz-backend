"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllUsers = exports.retrieveUser = exports.loginUser = exports.createUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword_1 = __importDefault(require("../services/hashPassword"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
// Register user
const createUser = async (req, res, next) => {
    const userData = req.body;
    try {
        // Check if the user already exists
        const existingUser = await client_1.default.user.findFirst({
            where: { email: userData.email },
        });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        // Hash password
        userData.password = await (0, hashPassword_1.default)(userData.password);
        // Create a new user
        const newUser = await client_1.default.user.create({ data: userData });
        res.status(201).json({
            message: "Signup Successful",
            user: { email: newUser.email, username: newUser.username },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
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
        // Sign token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, username: user.username }, process.env.SECRET, { expiresIn: "1d" });
        const { password, ...rest } = user;
        res.status(200).json({ token, user: rest });
    }
    catch (error) {
        next(error);
    }
};
exports.loginUser = loginUser;
// Fetch single User
const retrieveUser = async (req, res) => {
    const userId = Number(req.params.id);
    try {
        const user = await client_1.default.user.findFirst({ where: { id: userId } });
        if (user) {
            res.status(200).json(user);
        }
        else {
            res.status(404).json({ message: "User doesn't exist" });
        }
    }
    catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ message: "Something went wrong. Try Again" });
    }
};
exports.retrieveUser = retrieveUser;
const fetchAllUsers = async (req, res) => {
    try {
        const users = await client_1.default.user.findMany({
            orderBy: [{ username: "asc" }],
        });
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error); // Log the error for debugging purposes
        res.status(500).json({ message: "Something went wrong. Try Again" });
    }
};
exports.fetchAllUsers = fetchAllUsers;
