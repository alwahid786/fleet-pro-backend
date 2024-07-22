import { createStripeSession } from "../../controllers/subscriber/subscriberController.js";
import { auth } from "../../middlewares/auth.js";

export const subscriptionRoutes = (app: any) => {
    app.post("/api/subscription/create-session", auth, createStripeSession);
};
