import {
    createNewEmploy,
    deleteSingleEmploy,
    getAllEmployees,
    getSingleEmploy,
    updateSingleEmploy,
} from "../../controllers/employs/employsController.js";
import { auth } from "../../middlewares/auth.js";
import { singleUpload } from "../../middlewares/multer.js";

export const employRoutes = (app: any) => {
    // create new user
    app.post("/api/employ/create", auth, singleUpload, createNewEmploy);

    // get all users
    app.get("/api/employ/all", auth, getAllEmployees);

    // get single user
    app.route("/api/employ/single/:employId")
        .get(auth, getSingleEmploy)
        .put(auth, singleUpload, updateSingleEmploy)
        .delete(auth, deleteSingleEmploy);
};
