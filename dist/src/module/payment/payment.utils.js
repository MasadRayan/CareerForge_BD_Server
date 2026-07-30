import { prisma } from '../../lib/prisma.js';
import { stripe } from '../../lib/stripe.js';
const getPeriodEnd = (payload) => {
    const currentPeriodEndInSeconds = payload.items.data[0]?.current_period_end;
    return new Date(currentPeriodEndInSeconds * 1000);
};
export const handleCheckOutComplete = async (session) => {
    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer;
    const stripeSubscriptionId = session.subscription;
    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        console.log('Webhook: Missing required data');
        return;
    }
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    const currentPeriodEnd = getPeriodEnd(stripeSubscription);
    await prisma.subscriptions.updateMany({
        where: { user_id: userId, status: 'active' },
        data: { status: 'expired' },
    });
    await prisma.subscriptions.create({
        data: {
            user_id: userId,
            plan: 'premium',
            status: 'active',
            started_at: new Date(),
            currentPeriodEnd,
            stripeCustomerId,
            stripeSubscriptionId,
        },
    });
};
export const handleChangeSubcription = async (payload) => {
    const stripeSubscriptionId = payload.id;
    const status = payload.status === 'active' || payload.status === 'trialing'
        ? 'active'
        : payload.status === 'canceled'
            ? 'cancelled'
            : 'expired';
    const currentPeriodEnd = getPeriodEnd(payload);
    const existing = await prisma.subscriptions.findUnique({
        where: { stripeSubscriptionId },
    });
    if (!existing) {
        console.log(`Subscription not found: ${stripeSubscriptionId}`);
        return;
    }
    await prisma.subscriptions.update({
        where: { stripeSubscriptionId },
        data: { status, currentPeriodEnd },
    });
};
//# sourceMappingURL=payment.utils.js.map