import { Schema, model } from "mongoose";
import SubscriberTypes from "../../types/subscriberTypes.js";

const subscriptionSchema = new Schema<SubscriberTypes>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        stripeCustomerId: { type: String, required: true, unique: true },
        stripeSubscriptionId: { type: String, required: true },
        paymentMethod: { type: [], required: true },
        priceId: { type: String, required: true },
        subscriptionStatus: {
            type: String,
            enum: ["paid", "past_due", "canceled", "unpaid", "active"],
        },
        billingAddress: { type: Map, of: String },
        subscriptionStartDate: { type: Date, default: Date.now },
        subscriptionEndDate: { type: Date, required: true },
    },
    { timestamps: true }
);

const Subscriber = model("Subscriber", subscriptionSchema);

export default Subscriber;
