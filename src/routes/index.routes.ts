import { userRoutes } from "./userRoutes/user.routes.js";
import { driverRoutes } from "./driverRoutes/driver.routes.js";
import { employRoutes } from "./employRoutes/employ.routes.js";
import { truckRoutes } from "./truckRoutes/truck.routes.js";
import { adminRoutes } from "./adminRoutes/admin.routes.js";

export const allApiRoutes = (app: any) => {
    // user routes
    userRoutes(app);

    // driver routes
    driverRoutes(app);

    // create new truck
    truckRoutes(app);

    // user routes
    employRoutes(app);

    // admin routes
    adminRoutes(app);
};
