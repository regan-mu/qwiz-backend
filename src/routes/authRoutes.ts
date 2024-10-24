import { Router } from "express";
import {
  loginUser,
  handleRefreshToken,
  handleLogout,
} from "../controllers/authController";

const authRouter = Router();
authRouter.post("/login", loginUser);
authRouter.get("/refresh", handleRefreshToken);
authRouter.post("/logout", handleLogout);

export default authRouter;
