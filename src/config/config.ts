import { config as dotEnvConfig } from "dotenv";
import { Config } from "../types/globalTypes.js";
dotEnvConfig();

const _config: Config = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL,
    env: process.env.NODE_ENV,
    SIGN_ACCESS_TOKEN: process.env.SIGN_ACCESS_TOKEN,
    SERVER_URL: process.env.SERVER_URL,
    NODEMAILER_HOST: process.env.NODEMAILER_HOST,
    NODEMAILER_PORT: process.env.NODEMAILER_PORT,
    NODEMAILER_USER: process.env.NODEMAILER_USER,
    NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  
};

export const config = {
  getEnv: (key: string): string => {
    const value: string | undefined = _config[key];
    if (!value) throw new Error(`Missing environment variable ${key}`);
    return value;
  },
};
