import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { TryCatch } from "../utils/tryCatch.js";
import { Auth } from "../models/authModel/auth.model.js";

declare module "express-serve-static-core" {
    interface Request {
        user?: { ownerId: string };
    }
}
export interface AuthType {
    ownerId?: string;
}
export const auth = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) return next(createHttpError(401, "Unauthorized user please login"));
    let verifyToken;
    try {
        verifyToken = jwt.verify(token, config.getEnv("SIGN_ACCESS_TOKEN")!);
    } catch (err) {
        return next(createHttpError(401, "Unauthorized user please login"));
    }
    if (verifyToken) {
        const userId = verifyToken;
        const user = await Auth.findById(userId);
        if (!user) return next(createHttpError(401, "Unauthorized user please login"));
        // Set user information in req.user
        req.user = { ownerId: String(user._id) };
        next();
    } else {
        return next(createHttpError(401, "Token does not contain user id"));
    }
});
