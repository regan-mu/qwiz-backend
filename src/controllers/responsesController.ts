import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types";
import prisma from "../prisma/client";
import markQuiz from "../services/markQuiz";

// Fetch Quiz Responses
export const fetchQuizResponses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const quizId = Number(req.params.id);
  const user = (req as CustomRequest).user;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId },
      include: { responses: true },
    });
    if (!quiz) {
      res.status(404).json({ message: "Quiz does not exist" });
      return;
    }
    res.status(200).json(quiz.responses);
  } catch (error) {
    next(error);
  }
};

// Respond to Quiz
export const respondQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as CustomRequest).user;
  const quizId = Number(req.params.id);
  const responses = req.body.responses;

  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId },
      include: { questions: { include: { answers: true } }, responses: true },
    });
    
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    if (quiz.creatorId === (user.id as number)) {
      res.status(403).json({ message: "You cannot respond to your own Quiz" });
      return;
    }

    const filterResponses = quiz.responses.filter(
      (response) =>
        response.quizId === quizId && response.userId === (user.id as number)
    );

    if (filterResponses.length > 0) {
      res.status(400).json({ message: "You've already answered this quiz" });
      return;
    }

    const score = markQuiz(responses, quiz.questions);
    await prisma.response.create({
      data: { quizId, userId: user.id as number, score },
    });
    res.status(200).json({ score: score, totalQns: quiz.questions.length });
  } catch (error) {
    next(error);
  }
};
