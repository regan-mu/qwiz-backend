import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../types";

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const SECRET = process.env.ACCESS_TOKEN_SECRET!;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const jwtToken = authHeader.split(" ")[1];

  // If token is not present, respond with Unauthorized
  if (!jwtToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload: JwtPayload | string = jwt.verify(jwtToken, SECRET);
    (req as CustomRequest).user = payload;
    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
};

export default authenticateJWT;
