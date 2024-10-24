import prisma from "../prisma/client";
import { NextFunction, Request, Response } from "express";
import slugify from "slugify";
import { CustomRequest, UpdateQuiz } from "../types";

export const createQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    title,
    description,
    deadline,
  }: { title: string; description: string; deadline: string } = req.body;
  let slug = slugify(title).toLowerCase();
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const user = (req as CustomRequest).user;

  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Unathorized" });
    return;
  }

  if (today > deadlineDate) {
    res.status(400).json({ message: "Deadline is a past date" });
    return;
  }

  try {
    // Check if slug exists - Add the count if slug exists
    const slugExists = await prisma.quiz.count({ where: { slug: slug } });
    if (slugExists > 0) {
      slug = `${slug}-${slugExists}`;
    }
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        slug,
        deadline: deadlineDate,
        creatorId: user.id as number,
      },
    });
    res.status(201).json({ message: "Quiz created successfully", quiz });
    return;
  } catch (error) {
    next(error);
  }
};

// Update Quiz
export const updateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const quizId = Number(req.params.id);
  const quizData: UpdateQuiz = req.body.data;
  const user = (req as CustomRequest).user;

  if (typeof user === "string" || !user) {
    res.status(401).json({ message: "Unathorized" });
    return;
  }

  try {
    const quiz = await prisma.quiz.findFirst({ where: { id: quizId } });
    // When quiz not found
    if (!quiz) {
      res.status(404).json({ message: "Not Found" });
      return;
    }

    // When user making update is not owner
    if (quiz.creatorId !== (user.id as number)) {
      res.status(403).json({ message: "Not allowed" });
      return;
    }

    // Check deadline is not a past date
    const deadlineDate = new Date(quizData.deadline);
    quizData.deadline = deadlineDate;

    // Update Quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: quizData,
    });

    res
      .status(200)
      .json({ message: "Quiz updated succesfully", quiz: updatedQuiz });
  } catch (error) {
    next(error);
  }
};

// Retrieve Quiz
export const retrieveQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const quizId = Number(req.params.id);
  try {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId },
      include: { questions: {include: {answers: true}}, responses: { include: { user: true } } },
    });
    if (!quiz) {
      res.status(404).json({ message: "Not Found" });
      return;
    }
    res.status(200).json(quiz);
  } catch (error) {
    next(error);
  }
};

// Delete quiz
export const deleteQuiz = async (
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
    const quiz = await prisma.quiz.findFirst({ where: { id: quizId } });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }
    if (quiz.creatorId !== (user.id as number)) {
      res.status(403).json({ message: "Not allowed" });
      return;
    }
    // FIXME: Add check to restrict deletion if the quiz has responses already
    await prisma.quiz.delete({ where: { id: quizId } });
    res.status(200).json({ message: "Quiz deleted" });
  } catch (error) {
    next(error);
  }
};
