import { app } from "./app.js";
import { config } from "./config/config.js";
import { connectDB } from "./database/connection.js";
import { configureCloudinary } from "./utils/cloudinary.js";
import { watchSensorsCollection } from "./utils/watchSensors.js";

// server listen and database connection
(async () => {
    const PORT = config.getEnv("PORT") || 8090;
    await configureCloudinary();
    const server = app.listen(PORT, () => console.log(`server running at port ${PORT}`));
    //database connection
    await connectDB(config.getEnv("DATABASE_URL"));
    watchSensorsCollection();
    process.on("unhandledRejection", (err) => {
        console.log(`Error ${err}`);
        console.log("shutting down the server");
        server.close(() => process.exit(1));
    });
})();
