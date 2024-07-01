import mongoose from "mongoose";

const watchSensorsCollection = async () => {
    const sensorCollection = mongoose.connection.collection("sensors");

    const changeStream = sensorCollection.watch([{ $match: { operationType: "insert" } }]);

    changeStream.on("change", (change: any) => {
        const parsedPayload = JSON.parse(change.fullDocument.payload);
        console.log("New sensor document added:", parsedPayload);
        // Perform any additional processing here
    });

    console.log("Change stream set up for the sensors collection.");
};

export { watchSensorsCollection };
