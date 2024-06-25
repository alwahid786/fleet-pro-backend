import {
    assignTruckToDriver,
    createNewTruck,
    deleteTruck,
    getAllTrucks,
    getSingleTruck,
    removeTruckAssignment,
    updateTruck,
} from "../../controllers/truck/truckController.js";
import { auth } from "../../middlewares/auth.js";
import { singleUpload } from "../../middlewares/multer.js";
import handleValidatorError from "../../middlewares/validationHandler.js";
import {
    createTruckSanitizer,
    singleTruckSanitizer,
    updateTruckSanitizer,
} from "../../validation/truck.validation.js";

export const truckRoutes = (app: any) => {
    // create new truck
    app.post(
        "/api/truck/create",
        auth,
        createTruckSanitizer,
        handleValidatorError,
        singleUpload,
        createNewTruck
    );

    // update and delete truck
    app.route("/api/truck/single/:truckId")
        .get(auth, singleTruckSanitizer, handleValidatorError, getSingleTruck)
        .put(auth, singleUpload, updateTruckSanitizer, handleValidatorError, updateTruck)
        .delete(auth, singleTruckSanitizer, handleValidatorError, deleteTruck);

    // get all trucks
    app.get("/api/truck/all", auth, getAllTrucks);

    // // assigned truck to driver
    // app.put("/api/truck/assign/:truckId", auth, assignTruckToDriver);

    // // remove assignment from driver
    // app.put("/api/truck/remove-assignment/:truckId", auth, removeTruckAssignment);
};
