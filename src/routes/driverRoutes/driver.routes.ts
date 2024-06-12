import {
    createNewDriver,
    deleteDriver,
    getAllDrivers,
    getSingleDriver,
    updateDriver,
} from "../../controllers/driver/driverController.js";
import { auth } from "../../middlewares/auth.js";
import { singleUpload } from "../../middlewares/multer.js";

export const driverRoutes = (app: any) => {
    // register user
    app.post("/api/driver/create", auth, singleUpload, createNewDriver);

    // update drivers and delete
    app.route("/api/driver/single/:driverId")
        .get(auth, getSingleDriver)
        .put(auth, singleUpload, updateDriver)
        .delete(auth, deleteDriver);

    // get all drivers
    app.get("/api/driver/all", auth, getAllDrivers);
};
