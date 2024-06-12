import mongoose from "mongoose";
import { User } from "../../types/userTypes.js";

const authSchema = new mongoose.Schema<User>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: "admin" },
    },
    { timestamps: true }
);

// auth model
export const Auth = mongoose.model<User>("Auth", authSchema);
