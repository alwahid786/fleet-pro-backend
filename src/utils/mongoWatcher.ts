import mongoose from "mongoose";
import { emitEvent } from "./socket.js";
import { socketEvent } from "../constants/costants.js";

const sensorWatcher = () => {
    const sensorsCollection = mongoose.connection.collection("sensors");
    const changeStream = sensorsCollection.watch();
    changeStream.on("change", (change: any) => {
        if (change.operationType === "insert") {
            const document = change.fullDocument;
            const payload = JSON.parse(document?.payload);
            const newDocument = {
                _id: document?._id,
                topic: document.topic,
                payload,
            };
            const user = payload.ownerId;
            console.log("New document inserted:", newDocument);
            emitEvent(socketEvent.SENSORS_DATA, user, newDocument);
        }
    });
};

export { sensorWatcher };
