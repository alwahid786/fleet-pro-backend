import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { TryCatch } from "../utils/tryCatch.js";
import { User } from "../models/userModel/user.model.js";

declare module "express-serve-static-core" {
    interface Request {
        user?: { _id: string; role: string };
    }
}
export const auth = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.accessToken;
    if (!accessToken) return next(createHttpError(401, "Unauthorized user please login"));
    let verifyToken: any;
    try {
        verifyToken = jwt.verify(accessToken, config.getEnv("ACCESS_TOKEN_SECRET")!);
    } catch (err) {
        return next(createHttpError(401, "Unauthorized user please login"));
    }
    if (verifyToken) {
        const user = await User.findById(verifyToken._id).select(["_id", "role"]);
        if (!user) return next(createHttpError(401, "Unauthorized user please login"));
        // Set user information in req.user
        req.user = { _id: String(user._id), role: user?.role };
        next();
    } else {
        return next(createHttpError(401, "Unauthorized user please login"));
    }
});

export const isAdmin = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin")
        return next(createHttpError(403, "You are not authorized for this operation"));
    next();
});
