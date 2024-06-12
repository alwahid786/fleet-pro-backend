import { Schema } from "mongoose";

const deviceSchema = new Schema(
    {
        deviceId: { type: String, required: true },
        connectedWith: { type: String, required: true },
    },
    { timestamps: true }
);
