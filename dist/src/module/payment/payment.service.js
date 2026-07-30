import { stripe } from '../../lib/stripe.js';
import { prisma } from '../../lib/prisma.js';
import env from '../../config/env.js';
import { handleCheckOutComplete, handleChangeSubcription } from './payment.utils.js';
import AppError from '../../utils/AppError.js';
const createCheckOutSession = async (userId) => {
    const activeSub = await prisma.subscriptions.findFirst({
        where: { user_id: userId, status: 'active' },
    });
    if (activeSub) {
        throw new AppError('User already has an active subscription', 400);
    }
    const checkoutTransaction = await prisma.$transaction(async (tx) => {
        const user = await tx.users.findUniqueOrThrow({
            where: { id: userId },
        });
        const pastSub = await tx.subscriptions.findFirst({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        let stripeCustomerId = pastSub?.stripeCustomerId;
        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id },
            });
            stripeCustomerId = customer.id;
        }
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            success_url: `${env.FRONTEND_URL}/premium?success`,
            cancel_url: `${env.FRONTEND_URL}/payment?cancel`,
            metadata: { userId: user.id },
        });
        return session.url;
    });
    return { paymentURL: checkoutTransaction };
};
const webhookService = async (payload, signature) => {
    const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
    switch (event.type) {
        case 'checkout.session.completed':
            await handleCheckOutComplete(event.data.object);
            break;
        case 'customer.subscription.created':
            await handleChangeSubcription(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleChangeSubcription(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}.`);
            break;
    }
};
const getSubscriptionStatus = async (userId) => {
    const subscription = await prisma.subscriptions.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
    });
    if (!subscription) {
        return { status: null, isSubscribed: false, currentPeriodEnd: null };
    }
    const isActive = subscription.status === 'active' && subscription.currentPeriodEnd > new Date();
    return {
        status: subscription.status,
        isSubscribed: isActive,
        currentPeriodEnd: subscription.currentPeriodEnd,
    };
};
const getPaymentHistory = async (userId) => {
    const subscriptions = await prisma.subscriptions.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
    });
    return subscriptions.map((sub) => ({
        id: sub.id,
        plan: sub.plan,
        status: sub.status,
        startedAt: sub.started_at,
        currentPeriodEnd: sub.currentPeriodEnd,
        stripeSubscriptionId: sub.stripeSubscriptionId,
        createdAt: sub.created_at,
    }));
};
export const subscriptionService = {
    createCheckOutSession,
    webhookService,
    getSubscriptionStatus,
    getPaymentHistory,
};
//# sourceMappingURL=payment.service.js.map