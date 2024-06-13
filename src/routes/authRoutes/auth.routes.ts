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
    app.post("/api/auth/register", register);

    // verify registration
    app.get("/api/auth/verify", verifyRegistration);

    // verify registration
    app.put("/api/auth/forget-password", forgetPassword);

    // verify registration
    app.post("/api/auth/reset-password", resetPassword);

    // login user
    app.post("/api/auth/login", login);

    // logout user
    app.get("/api/auth/logout", auth, logout);
};
