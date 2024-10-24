"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchQuestionAnwers = exports.addAnswers = void 0;
const client_1 = __importDefault(require("../prisma/client"));
// Add answers for a question
const addAnswers = async (req, res, next) => {
    const user = req.user;
    const questionId = Number(req.params.id);
    const answers = req.body;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const question = await client_1.default.question.findFirst({
            where: { id: questionId },
            include: { quiz: true },
        });
        if (question?.quiz.creatorId !== user.id) {
            res.status(403).json({ message: "Not allowed" });
        }
        if (!question) {
            res.status(404).json({ message: "Question not found" });
            return;
        }
        await client_1.default.answer.createMany({ data: answers });
        res.status(201).json({ message: "Answers created successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.addAnswers = addAnswers;
// Fetch Answers belonging to a Question
const fetchQuestionAnwers = async (req, res, next) => {
    const questionID = Number(req.params.id);
    try {
        const question = await client_1.default.question.findFirst({
            where: { id: questionID },
        });
        if (!question) {
            res.status(404).json({ message: "Question does not exist" });
            return;
        }
        const answers = await client_1.default.answer.findMany({
            where: { questionId: questionID },
        });
        res.status(200).json({ answers });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchQuestionAnwers = fetchQuestionAnwers;
