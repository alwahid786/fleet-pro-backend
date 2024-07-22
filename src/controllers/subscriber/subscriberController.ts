import createHttpError from "http-errors";
import {
    myStripe,
    stripeCancelUrl,
    stripeReturnUrl,
    stripeSuccessUrl,
    stripeWebhookSecret,
    subscriptionTrialPeriodDays,
    stripeMonthlyPrice,
    stripeYearlyPrice,
    stripeLifetimePrice,
} from "../../constants/costants.js";
import Subscriber from "../../models/subscriptionModel/subscription.model.js";
import { User } from "../../models/userModel/user.model.js";
import { TryCatch } from "../../utils/tryCatch.js";

// http://localhost:8000/api/v1/subscription/create-session  Add New Subscription
// -----------------------------------------------------------------------------

export const createStripeSession = TryCatch(async (req, res, next) => {
    const { email, _id: userId } = req.user;
    const { plan } = req.body; // Get the plan from the request body
    if (!email || !userId) return next(createHttpError(400, "Please Login to create Subscription"));
    if (!plan) return next(createHttpError(400, "Please select a subscription plan"));

    let priceId;
    if (plan === "monthly") {
        priceId = stripeMonthlyPrice;
    } else if (plan === "yearly") {
        priceId = stripeYearlyPrice;
    } else if (plan === "lifetime") {
        priceId = stripeLifetimePrice;
    } else {
        return next(createHttpError(400, "Invalid subscription plan selected"));
    }

    let customer;
    // Check existing customer and retrieve if exist
    const isCustomerExist = await myStripe.customers.list({
        email,
        limit: 1,
    });
    if (isCustomerExist?.data?.length > 0) {
        customer = isCustomerExist.data[0];
        // Check if any subscription exist for this customer
        const subscription = await myStripe.subscriptions.list({
            customer: customer?.id,
            status: "active",
            limit: 1,
        });
        if (subscription?.data?.length > 0) {
            const stripeSession = await myStripe.billingPortal.sessions.create({
                customer: customer?.id,
                return_url: stripeReturnUrl,
            });
            return res.status(200).json({ success: true, redirect_url: stripeSession.url });
        }
    } else {
        // Create a new customer if it does not exist
        customer = await myStripe.customers.create({
            email,
            metadata: { userId },
        });
        if (!customer) return next(createHttpError(500, "Error Occurred While Creating Customer"));
    }
    // Now create the Stripe checkout session with the customer ID
    const session = await myStripe.checkout.sessions.create({
        success_url: stripeSuccessUrl,
        cancel_url: stripeCancelUrl,
        payment_method_types: ["card"],
        mode: "subscription",
        billing_address_collection: "auto",
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        metadata: { userId },
        customer: customer.id,
    });
    res.status(200).json({ success: true, sessionId: session.id });
});

// http://localhost:8000/api/v1/subscription/subscribe  Add New Subscription
// -------------------------------------------------------------------------

export const addNewSubscription = TryCatch(async (req, res, next) => {
    console.log("i am called from stripe");
    const signature = req.headers["stripe-signature"];
    if (!signature) return next(createHttpError(400, "Signature Not Found"));
    let event;
    try {
        event = await myStripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
    } catch (err: any) {
        return next(createHttpError(400, `Webhook Error: ${err.message}`));
    }

    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object;
        const [subscription, customer] = await Promise.all([
            myStripe.subscriptions.retrieve(invoice.subscription),
            myStripe.customers.retrieve(invoice.customer),
        ]);
        if (!subscription) return next(createHttpError(404, "Subscription Not Found"));
        if (!customer) return next(createHttpError(404, "Customer Not Found"));

        const subscriptionData = {
            user: customer.metadata.userId,
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            paymentMethod: subscription.payment_method_types,
            priceId: subscription.items.data[0].price.id,
            subscriptionStatus: subscription.status,
            subscriptionStartDate: new Date(subscription.current_period_start * 1000),
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
            billingAddress: subscription.billing_reason,
        };

        if (invoice.billing_reason === "subscription_create") {
            const newSubscription = await Subscriber.create(subscriptionData);
            if (!newSubscription) {
                return next(createHttpError(500, "Error Occurred While Creating Subscription"));
            }
            const updateUser = await User.findByIdAndUpdate(customer.metadata.userId, {
                "subscription.paid_sub": true,
                "subscription.subscriptionCollectionId": newSubscription._id,
            });
            if (!updateUser) return next(createHttpError(500, "Error Occurred While Updating User"));
        } else if (
            invoice.billing_reason === "subscription_cycle" ||
            invoice.billing_reason === "subscription_update"
        ) {
            const updateSubscription = await Subscriber.updateOne(
                { user: customer.metadata.userId },
                {
                    subscriptionEndDate: subscriptionData.subscriptionEndDate,
                    subscriptionStartDate: subscriptionData.subscriptionStartDate,
                }
            );
            if (!updateSubscription)
                return next(createHttpError(500, "Error Occurred While Updating Subscription"));
        }
        return res.status(201).json({ success: true, message: "You Subscribed Successfully" });
    }

    if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object;
        if (subscription.cancel_at_period_end) {
            const [updateSubscription, updateUser] = await Promise.all([
                Subscriber.updateOne(
                    { stripeSubscriptionId: subscription.id },
                    { subscriptionStatus: "canceled" }
                ),
                User.findByIdAndUpdate(subscription.metadata.userId, {
                    "subscription.paid_sub": false,
                }),
            ]);
            if (!updateSubscription)
                return next(createHttpError(500, "Error Occurred While Canceling Subscription"));
            if (!updateUser)
                return next(createHttpError(500, "Error Occurred While Canceling User Subscription"));
            return res.status(200).json({ success: true, message: "Subscription Canceled" });
        } else {
            const [updateSubscription, updateUser] = await Promise.all([
                Subscriber.updateOne(
                    { stripeSubscriptionId: subscription.id },
                    { subscriptionStatus: "renewed" }
                ),
                User.findByIdAndUpdate(subscription.metadata.userId, {
                    "subscription.paid_sub": true,
                }),
            ]);
            if (!updateSubscription)
                return next(createHttpError(500, "Error Occurred While Renewing Subscription"));
            if (!updateUser)
                return next(createHttpError(500, "Error Occurred While Renewing User Subscription"));
            return res.status(200).json({ success: true, message: "Subscription Restarted" });
        }
    }
});
