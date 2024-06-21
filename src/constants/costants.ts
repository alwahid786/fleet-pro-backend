import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/config.js";
import { CookiesOptionTypes } from "../types/globalTypes.js";
import { CookieOptions } from "express";

export const __dirName = fileURLToPath(import.meta.url);
export const __fileName = path.dirname(__dirName);

export const truckStatusEnum = ["notConnected", "connected"];

export const accessTokenOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: config.getEnv("NODE_ENV") !== "development",
    maxAge: parseInt(config.getEnv("ACCESS_TOKEN_MAX_AGE")),
};

export const refreshTokenOptions: CookieOptions = {
    httpOnly: true,
    sameSite: "none",
    secure: config.getEnv("NODE_ENV") !== "development",
    maxAge: Number(config.getEnv("REFRESH_TOKEN_MAX_AGE")),
};
