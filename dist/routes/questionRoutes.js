"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateJWT_1 = __importDefault(require("../middleware/authenticateJWT"));
const questionsController_1 = require("../controllers/questionsController");
const answersController_1 = require("../controllers/answersController");
const questionsRouter = (0, express_1.Router)();
questionsRouter
    .route("/:id")
    .get(authenticateJWT_1.default, questionsController_1.retrieveQuestion)
    .put(authenticateJWT_1.default, questionsController_1.updateQuestion)
    .delete(authenticateJWT_1.default, questionsController_1.deleteQuestion);
questionsRouter
    .route("/:id/answers")
    .post(authenticateJWT_1.default, answersController_1.addAnswers)
    .get(authenticateJWT_1.default, answersController_1.fetchQuestionAnwers);
exports.default = questionsRouter;
