import path from "path";
import fs from "fs";
import { format } from "date-fns";
import { v4 } from "uuid";
import { Request, Response, NextFunction } from "express";

const fsPromises = fs.promises;

const logRequests = async (message: string, logName: string) => {
  const datetime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  const logItem = `${datetime}\t${v4()}\t${message}\n`;
  try {
    if (!fs.existsSync(path.join(__dirname, "..", "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "..", "logs", logName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (req: Request, res: Response, next: NextFunction) => {
  logRequests(
    `${req.method}\t${req.headers.origin}\t"${req.url}"`,
    "requestLogs.txt"
  );
  next();
};

export { logger, logRequests };
