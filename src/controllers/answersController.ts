import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { CustomRequest } from "../types";

// Add answers for a question
export const addAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as CustomRequest).user;
  const questionId = Number(req.params.id);
  const answers = req.body;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const question = await prisma.question.findFirst({
      where: { id: questionId },
      include: { quiz: true },
    });
    if (question?.quiz.creatorId !== (user.id as number)) {
      res.status(403).json({ message: "Not allowed" });
    }
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }
    await prisma.answer.createMany({ data: answers });
    res.status(201).json({ message: "Answers created successfully" });
  } catch (error) {
    next(error);
  }
};

// Fetch Answers belonging to a Question
export const fetchQuestionAnwers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const questionID = Number(req.params.id);
  try {
    const question = await prisma.question.findFirst({
      where: { id: questionID },
    });
    if (!question) {
      res.status(404).json({ message: "Question does not exist" });
      return;
    }
    const answers = await prisma.answer.findMany({
      where: { questionId: questionID },
    });
    res.status(200).json({ answers });
  } catch (error) {
    next(error);
  }
};
