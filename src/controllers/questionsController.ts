import { NextFunction, Request, Response } from "express";
import prisma from "../prisma/client";
import { Answer } from "@prisma/client";
import { CustomRequest } from "../types";

export const createQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const quizId = Number(req.params.id);
  const question = req.body;
  const user = (req as CustomRequest).user;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }
  try {
    const quiz = await prisma.quiz.findFirst({ where: { id: quizId } });
    if (!quiz) {
      res.status(404).json({ message: "Quiz Not Found" });
      return;
    }

    if (quiz.creatorId !== (user.id as number)) {
      res.status(403).json({ message: "Not Allowed" });
      return;
    }
    const { question_text, answers } = question;
    // Create Question
    const createdQuestion = await prisma.question.create({
      data: { question_text, quizId: quizId },
    });
    const answersWithQuizId = answers.map((ans: Answer) => ({
      ...ans,
      questionId: createdQuestion.id,
    }));
    // Add the Answers
    await prisma.answer.createMany({ data: answersWithQuizId });
    res.status(201).json({ message: "Question has been added" });
  } catch (error) {
    next(error);
  }
};

export const fetchQuizQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const quizId = Number(req.params.id);
  const user = (req as CustomRequest).user;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }
  try {
    const quiz = await prisma.quiz.findFirst({ where: { id: quizId } });
    if (!quiz) {
      res.status(404).json({ message: "Quiz Not Found" });
      return;
    }
    const questions = await prisma.question.findMany({
      where: { quizId: quizId },
    });
    res.status(201).json({ questions: questions, quiz: quiz.title });
  } catch (error) {
    next(error);
  }
};

export const retrieveQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const questionId = Number(req.params.id);
  const user = (req as CustomRequest).user;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }
  try {
    const question = await prisma.question.findFirst({
      where: { id: questionId },
      include: { answers: true },
    });
    if (!question) {
      res.status(404).json({ message: "Quiz Not Found" });
      return;
    }
    res.status(201).json({ ...question });
  } catch (error) {
    next(error);
  }
};

// Update Question
export const updateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const questionId = Number(req.params.id);
  const updateData = req.body;
  const user = (req as CustomRequest).user;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }

  try {
    const question = await prisma.question.findFirst({
      where: { id: questionId },
      include: { quiz: true },
    });
    if (!question) {
      res.status(404).json({ message: "Question Not Found" });
      return;
    }
    if (question.quiz.creatorId !== (user.id as number)) {
      res.status(403).json({ message: "Not Allowed" });
      return;
    }
    await prisma.question.update({
      where: { id: questionId },
      data: {
        question_text: updateData.data.question_text,
        answers: {
          update: updateData.data.answers.map((ans: Answer) => ({
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
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const questionId = Number(req.params.id);
  const user = (req as CustomRequest).user;
  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Not logged in" });
    return;
  }
  try {
    const question = await prisma.question.findFirst({
      where: { id: questionId },
      include: { quiz: true },
    });
    if (!question) {
      res.status(404).json({ message: "Question Not Found" });
      return;
    }
    if (question.quiz.creatorId !== (user.id as number)) {
      res.status(403).json({ message: "Not Allowed" });
      return;
    }
    // TODO: Add a checkto avoid deletion if the quiz has responses
    await prisma.question.delete({ where: { id: questionId } });
    res.status(200).json({ message: "Question has been deleted" });
  } catch (error) {
    next(error);
  }
};
