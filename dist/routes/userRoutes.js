"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authenticateJWT_1 = __importDefault(require("../middleware/authenticateJWT"));
const userRouter = (0, express_1.Router)();
userRouter.post("/register", userController_1.createUser);
userRouter.get("/:userId/quizzes/", userController_1.fetchUsersQuizzes);
userRouter
    .route("/retrieve/:id")
    .get(authenticateJWT_1.default, userController_1.retrieveUser)
    .put(authenticateJWT_1.default, userController_1.updateUser);
exports.default = userRouter;
