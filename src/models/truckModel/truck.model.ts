import { model, Schema } from "mongoose";
import { truckStatusEnum } from "../../constants/costants.js";
import { Types } from "mongoose";
import { SchemaTruckTypes } from "../../types/truckTypes.js";

const imageSchema = new Schema({
    url: { type: String, required: true },
    public_id: { type: String, required: true },
});

const truckSchema = new Schema<SchemaTruckTypes>(
    {
        ownerId: { type: String, required: true },
        truckName: { type: String, required: true },
        fleetNumber: { type: Number, required: true },
        plateNumber: { type: Number, required: true },
        deviceId: { type: String, required: true },
        image: { type: imageSchema, required: true },
        status: { type: String, enum: truckStatusEnum, default: "not-connected" },
        assignedTo: { type: Types.ObjectId, ref: "Driver" },
    },
    { timestamps: true }
);

export const Truck = model<SchemaTruckTypes>("Truck", truckSchema);
