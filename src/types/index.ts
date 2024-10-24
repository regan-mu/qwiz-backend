import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import {Question, Answer} from "@prisma/client";

export interface SignupUser {
  email: string,
  username: string,
  password: string,
}

export interface JWTClaim extends JwtPayload {
    id?: number,
    email?:string,
    username?: string
}

export interface CustomRequest extends Request {
  user: JWTClaim | string;
}

export interface UpdateQuiz {
    title: string,
    description: string
    deadline: string | Date
}

export interface QuestionInter extends Question {
  answers: Answer[]
}

