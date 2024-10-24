import { Router } from "express";
import {
  createUser,
  retrieveUser,
  fetchUsersQuizzes,

  updateUser,
} from "../controllers/userController";
import authenticateJWT from "../middleware/authenticateJWT";

const userRouter = Router();

userRouter.post("/register", createUser);
userRouter.get("/:userId/quizzes/", fetchUsersQuizzes);
userRouter
  .route("/retrieve/:id")
  .get(authenticateJWT, retrieveUser)
  .put(authenticateJWT, updateUser);

export default userRouter;
