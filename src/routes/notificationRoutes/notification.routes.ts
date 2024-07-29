import {
    getMyAllPresentNotifications,
    getSingleNotification,
    readTheNotification,
} from "../../controllers/notification/notificationController.js";
import { auth } from "../../middlewares/auth.js";

export const notificationRoutes = (app: any) => {
    // get my all present notifications
    app.get("/api/notification/all", auth, getMyAllPresentNotifications);

    // get single notification
    app.get("/api/notification/single/:notificationId", auth, getSingleNotification);

    // read the notification
    app.put("/api/notification/read/:notificationId", auth, readTheNotification);
};
