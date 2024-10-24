import { Router } from "express";

import authenticateJWT from "../middleware/authenticateJWT";
import {
  deleteQuestion,
  retrieveQuestion,
  updateQuestion,
} from "../controllers/questionsController";
import {
  addAnswers,
  fetchQuestionAnwers,
} from "../controllers/answersController";

const questionsRouter = Router();
questionsRouter
  .route("/:id")
  .get(authenticateJWT, retrieveQuestion)
  .put(authenticateJWT, updateQuestion)
  .delete(authenticateJWT, deleteQuestion);
questionsRouter
  .route("/:id/answers")
  .post(authenticateJWT, addAnswers)
  .get(authenticateJWT, fetchQuestionAnwers);

export default questionsRouter;
