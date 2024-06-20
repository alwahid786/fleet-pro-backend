import { config as dotEnvConfig } from "dotenv";
import { Config } from "../types/globalTypes.js";
dotEnvConfig();

export const config = {
    getEnv: (key: string): string => {
        const value: string | undefined = process.env[key];
        if (!value) throw new Error(`Missing environment variable ${key}`);
        return value;
    },
};
