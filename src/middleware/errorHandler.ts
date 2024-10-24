import { Response, Request} from "express";
import { logRequests } from "./logRequests";

const errorHandler = (error: Error, req: Request, res: Response) => {
  logRequests(
    `${req?.method}\t${req?.headers?.origin}\t"${error?.name}: ${error?.message}"`,
    "errorLogs.txt"
  );
  res.status(500).json({ message: error.message });
};

export default errorHandler;
