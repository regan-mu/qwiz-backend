import { NextFunction, Request, Response } from "express";

import hashPassword from "../services/hashPassword";

import prisma from "../prisma/client";
import { CustomRequest, SignupUser } from "../types";

// Register user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userData: SignupUser = req.body;
  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Hash password
    userData.password = await hashPassword(userData.password);
    // Create a new user
    const newUser = await prisma.user.create({ data: userData });
    res.status(201).json({
      message: "Signup Successful",
      user: { email: newUser.email, username: newUser.username },
    });
  } catch (error) {
    next(error);
  }
};

// Fetch single User
export const retrieveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.id);
  const authenticatedUser = (req as CustomRequest).user;
  if (typeof authenticatedUser === "string" || !authenticatedUser) {
    res.status(401).json({ message: "Unathorized" });
    return;
  }
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, email: true, username: true, quizzes: true, responses: {include: {quiz: true}} },
    });
    if (!user) {
      res.status(404).json({ message: "User doesn't exist" });
      return;
    }
    if (user?.id != (authenticatedUser?.id as number)) {
      res.status(400).json({ message: "Not allowed" });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Update User
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.id);
  const userInfo: SignupUser = req.body;
  // Enforce user can only update their own info

  try {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "Not found" });
      return;
    }

    // Check email is taken
    const emailExists = await prisma.user.findFirst({
      where: { email: userInfo.email },
    });
    
    if (emailExists && emailExists.id !== user.id) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: userInfo.email, username: userInfo.username },
    });
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const fetchUsersQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = Number(req.params.userId);
  try {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const quizzes = await prisma.quiz.findMany({
      where: { creatorId: userId },
      orderBy: [{ created_at: "desc" }],
    });
    res.status(200).json(quizzes);
  } catch (error) {
    next(error);
  }
};
