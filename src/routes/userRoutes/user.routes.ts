import {
    createNewUser,
    deleteSingleUser,
    getAllUsers,
    getSingleUser,
    updateSingleUser,
} from "../../controllers/user/userController.js";
import { auth } from "../../middlewares/auth.js";
import { singleUpload } from "../../middlewares/multer.js";

export const userRoutes = (app: any) => {
    // create new user
    app.post("/api/user/create", auth, singleUpload, createNewUser);

    // get all users
    app.get("/api/user/all", auth, getAllUsers);

    // get single user
    app.route("/api/user/single/:userId")
        .get(auth, getSingleUser)
        .put(auth, singleUpload, updateSingleUser)
        .delete(auth, deleteSingleUser);
};
