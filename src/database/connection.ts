import mongoose from "mongoose";

export const connectDB = async (dbUrl: string) => {
    try {
        mongoose.connection.on("connected", () => console.log("Connect database successfully"));
        mongoose.connection.on("error", () => console.log("Error in connection to database"));
        await mongoose.connect(dbUrl);
    } catch (error) {
        console.log("Connection failed...");
        process.exit(1);
    }
};
