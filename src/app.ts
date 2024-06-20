import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { __dirName } from "./constants/costants.js";
import { Errorhandler } from "./middlewares/errorHandler.js";
import { allApiRoutes } from "./routes/index.routes.js";
import { config } from "./config/config.js";

export const app = express();

// middleware
app.use(
    cors({
        origin: config.getEnv("FRONTEND_URL"),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Fleet Backend",
    });
});

app.use(express.static(path.join(__dirName, "../../../public")));
// all api routes
allApiRoutes(app);

// global error handler middleware
app.use(Errorhandler);
