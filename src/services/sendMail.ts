import nodemailer from "nodemailer";
import { config } from "../config/config.js";

export const transporter = nodemailer.createTransport({
    host: config.getEnv("NODEMAILER_HOST"),
    port: parseInt(config.getEnv("NODEMAILER_PORT")),
    service: "gmail",
    auth: {
        user: config.getEnv("NODEMAILER_USER"),
        pass: config.getEnv("NODEMAILER_PASSWORD"),
    },
    // logger: true,
    // debug: true,
    // connectionTimeout: 20000,
});

export const sendMail = async (to: string, subject: string, text: string) => {
    try {
        const from = config.getEnv("NODEMAILER_USER");
        if (!from || !to || !subject || !text) throw new Error("Please Provide To, Subject and Text");
        const myTransPorter = transporter;
        await myTransPorter.sendMail({
            from,
            to,
            subject,
            text,
        });
        return true;
    } catch (error) {
        return false;
    }
};
