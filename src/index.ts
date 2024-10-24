import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";

import userRouter from "./routes/userRoutes";
import quizRouter from "./routes/quizRoutes";
import authRouter from "./routes/authRoutes";
import questionsRouter from "./routes/questionRoutes";
import { logger } from "./middleware/logRequests";
import errorHandler from "./middleware/errorHandler";
import notFound from "./routes/404";

dotenv.config();
const PORT = process.env.PORT || '3000';
const app = express();

// middleware
// Custom Logger Middleware
app.use(logger);

// CORS
const whitelist = ["https://qwiz-backend.onrender.com"];
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: null | Error, allowed?: boolean) => void
  ) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Origin Not allowed"));
    }
  },
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Cookie Parser
app.use(cookieParser());

// Body parser
app.use(bodyParser.json());

// Cookies
app.use(
  cookieSession({
    name: "session",
    keys: ["qwiz-app"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/quizzes", quizRouter);
app.use("/questions", questionsRouter);
app.use("*", notFound);

// Error handler middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
