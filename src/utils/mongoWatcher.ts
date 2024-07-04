import mongoose from "mongoose";
import { emitEvent } from "./socket.js";
import { socketEvent } from "../constants/costants.js";

const sensorWatcher = () => {
    const sensorsCollection = mongoose.connection.collection("sensors");
    const changeStream = sensorsCollection.watch();
    changeStream.on("change", (change: any) => {
        if (change.operationType === "insert") {
            console.log("New document inserted:", change.fullDocument);
            const document = change.fullDocument;
            const user = JSON.parse(document?.payload).ownerId;
            emitEvent(socketEvent.SENSORS_DATA, user, document);
        }
    });
};

export { sensorWatcher };
