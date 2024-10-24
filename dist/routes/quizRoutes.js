"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quizController_1 = require("../controllers/quizController");
const questionsController_1 = require("../controllers/questionsController");
const responsesController_1 = require("../controllers/responsesController");
const authenticateJWT_1 = __importDefault(require("../middleware/authenticateJWT"));
const quizRouter = (0, express_1.Router)();
quizRouter.post("/", authenticateJWT_1.default, quizController_1.createQuiz);
quizRouter
    .route("/quiz/:id")
    .put(authenticateJWT_1.default, quizController_1.updateQuiz)
    .delete(authenticateJWT_1.default, quizController_1.deleteQuiz)
    .get(authenticateJWT_1.default, quizController_1.retrieveQuiz);
quizRouter
    .route("/quiz/:id/questions")
    .post(authenticateJWT_1.default, questionsController_1.createQuestions)
    .get(authenticateJWT_1.default, questionsController_1.fetchQuizQuestions);
quizRouter.post("/quiz/:id/responses", authenticateJWT_1.default, responsesController_1.respondQuiz);
exports.default = quizRouter;
