import { model, Schema } from "mongoose";

const driverSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    licenseExpiry: { type: Date, required: true },
    fleatNumber: { type: String, required: true },
    truckId: { type: Schema.Types.ObjectId, ref: "Truck" },
    image: {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    phoneNumber: { type: String, required: true },
});

// auth model
export const Driver = model("Driver", driverSchema);
