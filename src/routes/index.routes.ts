import { authRoutes } from "./authRoutes/auth.routes.js";
import { driverRoutes } from "./driverRoutes/driver.routes.js";

export const allApiRoutes = (app: any) => {
    // auth routes
    authRoutes(app);

    // driver routes
    driverRoutes(app);
};
