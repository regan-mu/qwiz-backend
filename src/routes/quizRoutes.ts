import { Router } from "express";
import {
  createQuiz,
  updateQuiz,
  retrieveQuiz,
  deleteQuiz,
} from "../controllers/quizController";
import {
  createQuestions,
  fetchQuizQuestions,
} from "../controllers/questionsController";
import { respondQuiz } from "../controllers/responsesController";
import authenticateJWT from "../middleware/authenticateJWT";

const quizRouter = Router();

quizRouter.post("/", authenticateJWT, createQuiz);
quizRouter
  .route("/quiz/:id")
  .put(authenticateJWT, updateQuiz)
  .delete(authenticateJWT, deleteQuiz)
  .get(authenticateJWT, retrieveQuiz);
quizRouter
  .route("/quiz/:id/questions")
  .post(authenticateJWT, createQuestions)
  .get(authenticateJWT, fetchQuizQuestions);

quizRouter.post("/quiz/:id/responses", authenticateJWT, respondQuiz);

export default quizRouter;
