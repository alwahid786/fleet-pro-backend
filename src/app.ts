import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import morgan from "morgan";
import path from "path";
import { Server, Socket } from "socket.io";
import { __dirName } from "./constants/costants.js";
import { isSocketAuth } from "./middlewares/auth.js";
import { Errorhandler } from "./middlewares/errorHandler.js";
import { allApiRoutes } from "./routes/index.routes.js";

const app = express();
const corsOptions = {
    origin: ["http://localhost:5173", "https://fleat-frontend-aa7x.vercel.app", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
const liveSockets = new Map();

// middleware
app.use(cors(corsOptions));

const server = createServer(app);
const io = new Server(server, {
    cors: corsOptions,
});
app.set("io", io);

io.use(async (socket: any, next: (err?: Error) => void) => {
    cookieParser()(socket.request as any, socket.request.res as any, async (err) => {
        await isSocketAuth(err, socket, next);
    });
});

io.on("connection", (socket: Socket) => {
    console.log("connected successfully");
    liveSockets.set(String(socket.user?._id), socket.id);
    console.log("liveSockets", liveSockets);
    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});

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

export { app, io, liveSockets, server };
