import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { __dirName } from "./constants/costants.js";
import { Errorhandler } from "./middlewares/errorHandler.js";
import { allApiRoutes } from "./routes/index.routes.js";

export const app = express();

// middleware
app.use(
    cors({
        origin: ["http://localhost:5173", "https://fleat-frontend-aa7x.vercel.app", "http://localhost:5174"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);
// console.log(config.getEnv("CORS_ORIGIN"));
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
