"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondQuiz = exports.fetchQuizResponses = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const markQuiz_1 = __importDefault(require("../services/markQuiz"));
// Fetch Quiz Responses
const fetchQuizResponses = async (req, res, next) => {
    const quizId = Number(req.params.id);
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const quiz = await client_1.default.quiz.findFirst({
            where: { id: quizId },
            include: { responses: true },
        });
        if (!quiz) {
            res.status(404).json({ message: "Quiz does not exist" });
            return;
        }
        res.status(200).json(quiz.responses);
    }
    catch (error) {
        next(error);
    }
};
exports.fetchQuizResponses = fetchQuizResponses;
// Respond to Quiz
const respondQuiz = async (req, res, next) => {
    const user = req.user;
    const quizId = Number(req.params.id);
    const responses = req.body.responses;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const quiz = await client_1.default.quiz.findFirst({
            where: { id: quizId },
            include: { questions: { include: { answers: true } }, responses: true },
        });
        if (!quiz) {
            res.status(404).json({ message: "Quiz not found" });
            return;
        }
        if (quiz.creatorId === user.id) {
            res.status(403).json({ message: "You cannot respond to your own Quiz" });
            return;
        }
        const filterResponses = quiz.responses.filter((response) => response.quizId === quizId && response.userId === user.id);
        if (filterResponses.length > 0) {
            res.status(400).json({ message: "You've already answered this quiz" });
            return;
        }
        const score = (0, markQuiz_1.default)(responses, quiz.questions);
        await client_1.default.response.create({
            data: { quizId, userId: user.id, score },
        });
        res.status(200).json({ score: score, totalQns: quiz.questions.length });
    }
    catch (error) {
        next(error);
    }
};
exports.respondQuiz = respondQuiz;
