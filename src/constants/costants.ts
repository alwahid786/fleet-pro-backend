import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/config.js";
import { CookiesOptionTypes } from "../types/globalTypes.js";
import { CookieOptions } from "express";

export const __dirName = fileURLToPath(import.meta.url);
export const __fileName = path.dirname(__dirName);

export const truckStatusEnum = ["not-connected", "connected"];

export const accessTokenOptions: CookieOptions = {
    httpOnly: true,
    sameSite: config.getEnv("NODE_ENV") !== "development" ? "none" : "lax",
    secure: config.getEnv("NODE_ENV") !== "development",
    maxAge: parseInt(config.getEnv("ACCESS_TOKEN_MAX_AGE")),
};

export const refreshTokenOptions: CookieOptions = {
    httpOnly: true,
    sameSite: config.getEnv("NODE_ENV") !== "development" ? "none" : "lax",
    secure: config.getEnv("NODE_ENV") !== "development",
    maxAge: Number(config.getEnv("REFRESH_TOKEN_MAX_AGE")),
};

export const socketEvent = {
    SENSORS_DATA: "SENSORS_DATA",
};
