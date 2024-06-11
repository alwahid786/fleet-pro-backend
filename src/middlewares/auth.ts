import { Request } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { TryCatch } from "../utils/tryCatch.js";

export interface AuthType {
    userId: string;
}

export const auth = TryCatch(async (req: Request<{}, {}, AuthType>, res, next) => {
    const token = req.cookies.token;
    if (!token) return next(createHttpError(401, "Unauthorized user please login"));
    const verifyToken = jwt.verify(token, config.getEnv("JWT_KEY")!);
    req.body.userId = verifyToken as string;
    next();
});
