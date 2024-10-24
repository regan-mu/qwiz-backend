import { NextFunction, Request, Response } from "express";
import { JWTClaim, SignupUser } from "../types";
import prisma from "../prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// User Login
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userInfo: SignupUser = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { email: userInfo.email },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid Email/Password" });
      return;
    }

    const isCorrectPassword = await bcrypt.compare(
      userInfo.password,
      user.password
    );

    if (!isCorrectPassword) {
      res.status(401).json({ message: "Invalid Email/Password" });
      return;
    }

    // Sign access & refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "30s" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );

    // Save refresh token to db
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    // Send refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      maxAge: 24 * 60 * 60 * 100,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const { password, refresh_token, ...rest } = user;
    res.status(200).json({ accessToken, user: rest });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const handleRefreshToken = async (req: Request, res: Response) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    res.status(401).json({ message: "Refresh Token Not provided" });
    return;
  }
  const refreshToken = cookies?.refreshToken;
  const foundUser = await prisma.user.findFirst({
    where: { refresh_token: refreshToken },
  });
  if (!foundUser) {
    res.status(403).json({ message: "Refresh token invalid" });
    return;
  }
  try {
    const payload: JWTClaim | string = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    );
    if (typeof payload === "string" || payload?.email !== foundUser.email) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const { id, username, email } = payload;
    const accessToken = jwt.sign(
      { id, username, email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "30s" }
    );
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

// Logout
export const handleLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) {
    res.sendStatus(204);
    return;
  }
  const refreshToken: string = cookies?.refreshToken;
  try {
    // Check the token owner exists
    const foundUser = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });

    if (!foundUser) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      });
      res.sendStatus(204);
      return;
    }

    // Update the user to remove the refresh token.
    await prisma.user.update({
      where: { refresh_token: refreshToken },
      data: { refresh_token: null },
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
