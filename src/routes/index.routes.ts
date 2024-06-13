import { authRoutes } from "./authRoutes/auth.routes.js";
import { driverRoutes } from "./driverRoutes/driver.routes.js";
import { truckRoutes } from "./truckRoutes/truck.routes.js";
import { userRoutes } from "./userRoutes/user.routes.js";

export const allApiRoutes = (app: any) => {
    // auth routes
    authRoutes(app);

    // driver routes
    driverRoutes(app);

    // create new truck
    truckRoutes(app);

    // user routes
    userRoutes(app);
};
