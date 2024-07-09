import mongoose from "mongoose";
import { emitEvent } from "./socket.js";
import { socketEvent } from "../constants/costants.js";
import { WantTrucksTrackingData } from "../constants/socketState.js";
import { Truck } from "../models/truckModel/truck.model.js";

const sensorWatcher = () => {
    const sensorsCollection = mongoose.connection.collection("sensors");
    const changeStream = sensorsCollection.watch();
    changeStream.on("change", async (change: any) => {
        if (change.operationType === "insert") {
            const document = change.fullDocument;
            const payload = JSON.parse(document?.payload);
            const truckId = payload.truckId;
            const ownerId = payload.ownerId;
            const truckLatitude = payload.gps.latitude;
            const truckLongitude = payload.gps.longitude;

            console.log("data while live tracking", truckId, ownerId, truckLatitude, truckLongitude);
            if (WantTrucksTrackingData.has(truckId)) {
                const updatedTruck = await Truck.findByIdAndUpdate(
                    truckId,
                    { latitude: truckLatitude, longitude: truckLongitude },
                    { new: true }
                );
                // console.log("New document inserted:", updatedTruck);
                emitEvent(socketEvent.SENSORS_DATA, ownerId, updatedTruck);
            }
        }
    });
};

export { sensorWatcher };
