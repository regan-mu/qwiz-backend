"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const quizRoutes_1 = __importDefault(require("./routes/quizRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const questionRoutes_1 = __importDefault(require("./routes/questionRoutes"));
const logRequests_1 = require("./middleware/logRequests");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const _404_1 = __importDefault(require("./routes/404"));
dotenv_1.default.config();
const PORT = 8080;
const app = (0, express_1.default)();
// middleware
// Custom Logger Middleware
app.use(logRequests_1.logger);
// CORS
const whitelist = ["http://localhost:5173", "http://127.0.0.1:5173"];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Origin Not allowed"));
        }
    },
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
// Cookie Parser
app.use((0, cookie_parser_1.default)());
// Body parser
app.use(body_parser_1.default.json());
// Cookies
app.use((0, cookie_session_1.default)({
    name: "session",
    keys: ["qwiz-app"],
    maxAge: 24 * 60 * 60 * 100,
}));
// Routes
app.use("/auth", authRoutes_1.default);
app.use("/user", userRoutes_1.default);
app.use("/quizzes", quizRoutes_1.default);
app.use("/questions", questionRoutes_1.default);
app.use("*", _404_1.default);
// Error handler middleware
app.use(errorHandler_1.default);
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
