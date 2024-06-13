import { Schema, model } from "mongoose";
import { UserSchemaTypes } from "../../types/usersTypes.js";

const imageSchema = new Schema({
    url: { type: String, required: true },
    public_id: { type: String, required: true },
});

const userSchema = new Schema<UserSchemaTypes>(
    {
        ownerId: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        image: { type: imageSchema, required: true },
    },
    { timestamps: true }
);

export const User = model<UserSchemaTypes>("User", userSchema);
