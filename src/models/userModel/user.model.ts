import mongoose from "mongoose";
import { UserSchemaTypes } from "../../types/userTypes.js";

const userSchema = new mongoose.Schema<UserSchemaTypes>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true, default: "admin" },
    },
    { timestamps: true }
);

export const User = mongoose.model<UserSchemaTypes>("User", userSchema);
