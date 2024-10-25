"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUsersQuizzes = exports.updateUser = exports.retrieveUser = exports.createUser = void 0;
const hashPassword_1 = __importDefault(require("../services/hashPassword"));
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
// Fetch single User
const retrieveUser = async (req, res, next) => {
    const userId = Number(req.params.id);
    const authenticatedUser = req.user;
    if (typeof authenticatedUser === "string" || !authenticatedUser) {
        res.status(401).json({ message: "Unathorized" });
        return;
    }
    try {
        const user = await client_1.default.user.findFirst({
            where: { id: userId },
            select: { id: true, email: true, username: true, quizzes: true, responses: { include: { quiz: true } } },
        });
        if (!user) {
            res.status(404).json({ message: "User doesn't exist" });
            return;
        }
        if (user?.id != authenticatedUser?.id) {
            res.status(400).json({ message: "Not allowed" });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.retrieveUser = retrieveUser;
// Update User
const updateUser = async (req, res, next) => {
    const userId = Number(req.params.id);
    const userInfo = req.body;
    // Enforce user can only update their own info
    try {
        const user = await client_1.default.user.findFirst({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "Not found" });
            return;
        }
        // Check email is taken
        const emailExists = await client_1.default.user.findFirst({
            where: { email: userInfo.email },
        });
        if (emailExists && emailExists.id !== user.id) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        // Update the user
        const updatedUser = await client_1.default.user.update({
            where: { id: userId },
            data: { email: userInfo.email, username: userInfo.username },
        });
        res
            .status(200)
            .json({ message: "User updated successfully", user: updatedUser });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const fetchUsersQuizzes = async (req, res, next) => {
    const userId = Number(req.params.userId);
    try {
        const user = await client_1.default.user.findFirst({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const quizzes = await client_1.default.quiz.findMany({
            where: { creatorId: userId },
            orderBy: [{ created_at: "desc" }],
        });
        res.status(200).json(quizzes);
    }
    catch (error) {
        next(error);
    }
};
exports.fetchUsersQuizzes = fetchUsersQuizzes;
