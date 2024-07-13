import mongoose from "mongoose";
import { socketEvent, watchPolygonTrucksData } from "../constants/socketState.js";
import { Truck } from "../models/truckModel/truck.model.js";
import { emitEvent } from "./socket.js";

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
            if (watchPolygonTrucksData.has(String(truckId))) {
                await Truck.findByIdAndUpdate(
                    truckId,
                    { latitude: truckLatitude, longitude: truckLongitude },
                    { new: true }
                );
                emitEvent(socketEvent.GEOFENCE_TRUCKS_DATA, ownerId, "get single truck data data again");
            }
        }
    });
};

export { sensorWatcher };
