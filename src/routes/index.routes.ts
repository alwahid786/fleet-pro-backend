import { userRoutes } from "./authRoutes/user.routes.js";
import { driverRoutes } from "./driverRoutes/driver.routes.js";
import { employRoutes } from "./employRoutes/employ.routes.js";
import { truckRoutes } from "./truckRoutes/truck.routes.js";

export const allApiRoutes = (app: any) => {
    userRoutes(app);

    // driver routes
    driverRoutes(app);

    // create new truck
    truckRoutes(app);

    // user routes
    employRoutes(app);
};
