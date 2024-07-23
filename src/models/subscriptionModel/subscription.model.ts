import { Schema, model } from "mongoose";
import SubscriberTypes from "../../types/subscriberTypes.js";

const subscriptionSchema = new Schema<SubscriberTypes>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        stripeCustomerId: { type: String, unique: true },
        stripeSubscriptionId: { type: String },
        paymentMethod: { type: [] },
        priceId: { type: String },
        subscriptionStatus: {
            type: String,
            enum: ["paid", "past_due", "canceled", "unpaid", "active"],
        },
        billingAddress: { type: Map, of: String },
        subscriptionStartDate: { type: Date, default: Date.now },
        subscriptionEndDate: { type: Date },
    },
    { timestamps: true }
);

const Subscriber = model("Subscriber", subscriptionSchema);

export default Subscriber;
