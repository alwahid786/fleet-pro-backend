import mongoose from "mongoose";

const sensorWatcher = () => {
    const sensorsCollection = mongoose.connection.collection("sensors");
    const changeStream = sensorsCollection.watch();
    changeStream.on("change", (change) => {
        if (change.operationType === "insert") {
            console.log("New document inserted:", change.fullDocument);
        }
    });
};

export { sensorWatcher };
