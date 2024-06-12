import { createNewDriver } from "../../controllers/driver/driverController.js";
import { auth } from "../../middlewares/auth.js";
import { singleUpload } from "../../middlewares/multer.js";

export const driverRoutes = (app: any) => {
    // register user
    app.post("/api/driver/create", auth, singleUpload, createNewDriver);
};
