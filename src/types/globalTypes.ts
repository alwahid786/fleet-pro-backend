import { NextFunction, Request, Response } from "express";

export type ControllerType = (
    req: Request | any,
    res: Response,
    next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export interface CustomRequest extends Request {
    userId: string;
}

export interface Config {
    [key: string]: string | undefined;
}

export interface CookiesOptionTypes {
    httpOnly: boolean;
    secure: boolean;
    sameSite: string;
    maxAge: number;
}
