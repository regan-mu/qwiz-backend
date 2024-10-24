import { Request, Response } from "express";
const notFound = (req: Request, res: Response) => {
  res.status(405).json({ message: "Method not allowed or path doesn't exist" });
};

export default notFound;
