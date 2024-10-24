"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuestion = exports.updateQuestion = exports.retrieveQuestion = exports.fetchQuizQuestions = exports.createQuestions = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const createQuestions = async (req, res, next) => {
    const quizId = Number(req.params.id);
    const question = req.body;
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }
    try {
        const quiz = await client_1.default.quiz.findFirst({ where: { id: quizId } });
        if (!quiz) {
            res.status(404).json({ message: "Quiz Not Found" });
            return;
        }
        if (quiz.creatorId !== user.id) {
            res.status(403).json({ message: "Not Allowed" });
            return;
        }
        const { question_text, answers } = question;
        // Create Question
        const createdQuestion = await client_1.default.question.create({
            data: { question_text, quizId: quizId },
        });
        const answersWithQuizId = answers.map((ans) => ({
            ...ans,
            questionId: createdQuestion.id,
        }));
        // Add the Answers
        await client_1.default.answer.createMany({ data: answersWithQuizId });
        res.status(201).json({ message: "Question has been added" });
    }
    catch (error) {
        next(error);
    }
};
exports.createQuestions = createQuestions;
const fetchQuizQuestions = async (req, res, next) => {
    const quizId = Number(req.params.id);
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }
    try {
        const quiz = await client_1.default.quiz.findFirst({ where: { id: quizId } });
        if (!quiz) {
            res.status(404).json({ message: "Quiz Not Found" });
            return;
        }
        const questions = await client_1.default.question.findMany({
            where: { quizId: quizId },
        });
        res.status(201).json({ questions: questions, quiz: quiz.title });
    }
    catch (error) {
        next(error);
    }
};
exports.fetchQuizQuestions = fetchQuizQuestions;
const retrieveQuestion = async (req, res, next) => {
    const questionId = Number(req.params.id);
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }
    try {
        const question = await client_1.default.question.findFirst({
            where: { id: questionId },
            include: { answers: true },
        });
        if (!question) {
            res.status(404).json({ message: "Quiz Not Found" });
            return;
        }
        res.status(201).json({ ...question });
    }
    catch (error) {
        next(error);
    }
};
exports.retrieveQuestion = retrieveQuestion;
// Update Question
const updateQuestion = async (req, res, next) => {
    const questionId = Number(req.params.id);
    const updateData = req.body;
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }
    try {
        const question = await client_1.default.question.findFirst({
            where: { id: questionId },
            include: { quiz: true },
        });
        if (!question) {
            res.status(404).json({ message: "Question Not Found" });
            return;
        }
        if (question.quiz.creatorId !== user.id) {
            res.status(403).json({ message: "Not Allowed" });
            return;
        }
        await client_1.default.question.update({
            where: { id: questionId },
            data: {
                question_text: updateData.data.question_text,
                answers: {
                    update: updateData.data.answers.map((ans) => ({
                        where: { id: ans.id },
                        data: {
                            answer_text: ans.answer_text,
                            isCorrect: ans.isCorrect,
                        },
                    })),
                },
            },
        });
        res.status(200).json({ message: "Update Successful" });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
    const questionId = Number(req.params.id);
    const user = req.user;
    if (typeof user === "string" || !user) {
        res.status(401).json({ message: "Not logged in" });
        return;
    }
    try {
        const question = await client_1.default.question.findFirst({
            where: { id: questionId },
            include: { quiz: true },
        });
        if (!question) {
            res.status(404).json({ message: "Question Not Found" });
            return;
        }
        if (question.quiz.creatorId !== user.id) {
            res.status(403).json({ message: "Not Allowed" });
            return;
        }
        // TODO: Add a checkto avoid deletion if the quiz has responses
        await client_1.default.question.delete({ where: { id: questionId } });
        res.status(200).json({ message: "Question has been deleted" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuestion = deleteQuestion;
