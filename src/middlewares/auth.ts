import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { TryCatch } from "../utils/tryCatch.js";
import { User } from "../models/userModel/user.model.js";
import { JWTService } from "../services/jwtToken.js";
import { accessTokenOptions, refreshTokenOptions } from "../constants/costants.js";

declare module "express-serve-static-core" {
    interface Request {
        user?: { _id: string; role: string };
    }
}

export const auth = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies?.accessToken;
        let verifyToken: any;
        let receivedUser: any;
        if (accessToken) {
            verifyToken = jwt.verify(accessToken, config.getEnv("ACCESS_TOKEN_SECRET")!);
            const user = await User.findById(verifyToken._id).select(["_id", "role"]);
            if (!user) return next(createHttpError(401, "Unauthorized user please login"));
            receivedUser = { _id: String(user._id), role: user?.role };
        } else {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) return next(createHttpError(401, "Unauthorized user please login"));
            verifyToken = await JWTService().verifyRefreshToken(refreshToken);
            if (verifyToken) {
                const user = await User.findById(verifyToken._id).select(["_id", "role"]);
                if (!user) return next(createHttpError(401, "Unauthorized user please login"));
                // create new access and refresh token
                const [newAccessToken, newRefreshToken] = await Promise.all([
                    JWTService().accessToken(String(user._id)),
                    JWTService().refreshToken(String(user._id)),
                ]);
                // remove old Refresh Token and save new refresh token
                await Promise.all([
                    JWTService().removeRefreshToken(String(refreshToken)),
                    JWTService().storeRefreshToken(String(newRefreshToken)),
                ]);
                res.cookie("accessToken", newAccessToken, accessTokenOptions);
                res.cookie("refreshToken", newRefreshToken, refreshTokenOptions);
                receivedUser = { _id: String(user._id), role: user?.role };
            }
        }
        req.user = receivedUser;
        next();
    } catch (error) {
        next(createHttpError(401, "Unauthorized user please login"));
    }
});

export const isAdmin = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin")
        return next(createHttpError(403, "You are not authorized for this operation"));
    next();
});
