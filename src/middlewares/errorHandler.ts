import { HttpError } from "http-errors";
import { config } from "../config/config.js";
import { NextFunction, Request, Response } from "express";

export const Errorhandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    // console.log(err);
    return res.status(statusCode).json({
        success: false,
        message: err.message,
        // stack: config.getEnv("NODE_ENV") == "development" ? err.stack : "",
    });
};
