import express from "express";
import { Errorhandler } from "./middlewares/errorHandler.js";
import { allApiRoutes } from "./routes/index.routes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { __dirName } from "./constants/costants.js";
import path from "node:path";
import cors from "cors";
import { config } from "./config/config.js";

export const corsOptions = {
    origin: [config.getEnv("FRONTEND_URL")],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};

export const app = express();

// middleware
app.use(cors(corsOptions));
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
