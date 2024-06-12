import { model, Schema, Types } from "mongoose";

const imageSchema = new Schema({
    url: { type: String, required: true },
    public_id: { type: String, required: true },
});

const driverSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    fleetNumber: { type: String, required: true },
    image: { type: imageSchema, required: true },
    phoneNumber: { type: String, required: true },
    assignedTruck: { type: Types.ObjectId, ref: "Truck" },
});

export const Driver = model("Driver", driverSchema);
