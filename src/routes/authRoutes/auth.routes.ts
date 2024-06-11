import {
    forgetPassword,
    login,
    logout,
    register,
    resetPassword,
    verifyRegistration,
} from "../../controllers/auth/authController.js";
import { auth } from "../../middlewares/auth.js";

export const authRoutes = (app: any) => {
    // register user
    app.post("/api/user/register", register);

    // verify registration
    app.get("/api/user/verify", verifyRegistration);

    // verify registration
    app.put("/api/user/forget-password", forgetPassword);

    // verify registration
    app.post("/api/user/reset-password", resetPassword);

    // login user
    app.post("/api/user/login", login);

    // logout user
    app.get("/api/user/logout", auth, logout);
};
