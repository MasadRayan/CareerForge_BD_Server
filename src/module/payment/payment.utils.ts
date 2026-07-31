import Stripe from 'stripe'
import { prisma } from '../../lib/prisma.js'
import { stripe } from '../../lib/stripe.js'

const getPeriodEnd = (payload: Stripe.Subscription) => {
  const currentPeriodEndInSeconds = payload.items.data[0]?.current_period_end!
  return new Date(currentPeriodEndInSeconds * 1000)
}

export const handleCheckOutComplete = async (session: Stripe.Checkout.Session) => {
  const userId = session.metadata?.userId
  const stripeCustomerId = session.customer as string
  const stripeSubscriptionId = session.subscription as string

  if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
    console.log('Webhook: Missing required data')
    return
  }

  const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const currentPeriodEnd = getPeriodEnd(stripeSubscription)

  await prisma.$transaction(async (tx) => {
    await tx.subscriptions.updateMany({
      where: { user_id: userId, status: 'active' },
      data: { status: 'expired' },
    })

    await tx.subscriptions.upsert({
      where: { stripeSubscriptionId },
      update: {
        plan: 'premium',
        status: 'active',
        currentPeriodEnd,
      },
      create: {
        user_id: userId,
        plan: 'premium',
        status: 'active',
        started_at: new Date(),
        currentPeriodEnd,
        stripeCustomerId,
        stripeSubscriptionId,
      },
    })

    await tx.users.updateMany({
      where: { id: userId, role: { not: 'admin' } },
      data: { role: 'premium_user' },
    })
  })
}

export const handleChangeSubcription = async (payload: Stripe.Subscription) => {
  const stripeSubscriptionId = payload.id
  const status = payload.status === 'active' || payload.status === 'trialing'
    ? 'active'
    : payload.status === 'canceled'
      ? 'cancelled'
      : 'expired'

  const currentPeriodEnd = getPeriodEnd(payload)

  const existing = await prisma.subscriptions.findUnique({
    where: { stripeSubscriptionId },
  })

  if (!existing) {
    console.log(`Subscription not found: ${stripeSubscriptionId}`)
    return
  }

  await prisma.subscriptions.update({
    where: { stripeSubscriptionId },
    data: { status, currentPeriodEnd },
  })

  if (status === 'active') {
    await prisma.users.updateMany({
      where: { id: existing.user_id, role: { not: 'admin' } },
      data: { role: 'premium_user' },
    })
    return
  }

  const activeCount = await prisma.subscriptions.count({
    where: { user_id: existing.user_id, status: 'active' },
  })

  if (activeCount === 0) {
    await prisma.users.updateMany({
      where: { id: existing.user_id, role: 'premium_user' },
      data: { role: 'free_user' },
    })
  }
}
