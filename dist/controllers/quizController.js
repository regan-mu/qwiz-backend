"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.retrieveQuiz = exports.updateQuiz = exports.createQuiz = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const slugify_1 = __importDefault(require("slugify"));
const createQuiz = async (req, res, next) => {
    const { title, description, deadline, } = req.body;
    let slug = (0, slugify_1.default)(title).toLowerCase();
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Unathorized" });
        return;
    }
    if (today > deadlineDate) {
        res.status(400).json({ message: "Deadline is a past date" });
        return;
    }
    try {
        // Check if slug exists - Add the count if slug exists
        const slugExists = await client_1.default.quiz.count({ where: { slug: slug } });
        if (slugExists > 0) {
            slug = `${slug}-${slugExists}`;
        }
        const quiz = await client_1.default.quiz.create({
            data: {
                title,
                description,
                slug,
                deadline: deadlineDate,
                creatorId: user.id,
            },
        });
        res.status(201).json({ message: "Quiz created successfully", quiz });
        return;
    }
    catch (error) {
        next(error);
    }
};
exports.createQuiz = createQuiz;
// Update Quiz
const updateQuiz = async (req, res, next) => {
    const quizId = Number(req.params.id);
    const quizData = req.body.data;
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Unathorized" });
        return;
    }
    try {
        const quiz = await client_1.default.quiz.findFirst({ where: { id: quizId } });
        // When quiz not found
        if (!quiz) {
            res.status(404).json({ message: "Not Found" });
            return;
        }
        // When user making update is not owner
        if (quiz.creatorId !== user.id) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        // Check deadline is not a past date
        const deadlineDate = new Date(quizData.deadline);
        quizData.deadline = deadlineDate;
        // Update Quiz
        const updatedQuiz = await client_1.default.quiz.update({
            where: { id: quizId },
            data: quizData,
        });
        res
            .status(200)
            .json({ message: "Quiz updated succesfully", quiz: updatedQuiz });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuiz = updateQuiz;
// Retrieve Quiz
const retrieveQuiz = async (req, res, next) => {
    const quizId = Number(req.params.id);
    try {
        const quiz = await client_1.default.quiz.findFirst({
            where: { id: quizId },
            include: { questions: { include: { answers: true } }, responses: { include: { user: true } } },
        });
        if (!quiz) {
            res.status(404).json({ message: "Not Found" });
            return;
        }
        res.status(200).json(quiz);
    }
    catch (error) {
        next(error);
    }
};
exports.retrieveQuiz = retrieveQuiz;
// Delete quiz
const deleteQuiz = async (req, res, next) => {
    const quizId = Number(req.params.id);
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const quiz = await client_1.default.quiz.findFirst({ where: { id: quizId } });
        if (!quiz) {
            res.status(404).json({ message: "Quiz not found" });
            return;
        }
        if (quiz.creatorId !== user.id) {
            res.status(403).json({ message: "Not allowed" });
            return;
        }
        // FIXME: Add check to restrict deletion if the quiz has responses already
        await client_1.default.quiz.delete({ where: { id: quizId } });
        res.status(200).json({ message: "Quiz deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuiz = deleteQuiz;
