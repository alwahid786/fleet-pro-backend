import { Types } from "mongoose";

interface SubscriberTypes {
    user: Types.ObjectId;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    paymentMethod: string[];
    priceId: string;
    subscriptionStatus: string;
    billingAddress: object;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
}
export default SubscriberTypes;
