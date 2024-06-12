import { model, Schema } from "mongoose";
import { truckStatusEnum } from "../../constants/costants.js";
import { Types } from "mongoose";

const imageSchema = new Schema({
    url: { type: String, required: true },
    public_id: { type: String, required: true },
});

const truckSchema = new Schema({
    truckName: { type: String, required: true },
    fleatNumber: { type: Number, required: true },
    plateNumber: { type: Number, required: true },
    deviceId: { type: String, required: true },
    image: { type: imageSchema, required: true },
    status: { type: String, enum: truckStatusEnum, default: "notConnected" },
    assignedTo: { type: Types.ObjectId, ref: "Driver" },
});

export const Truck = model("Truck", truckSchema);
