import Stripe from 'stripe'
import { Prisma } from '../../../generated/prisma/client'
import { stripe } from '../../lib/stripe.js'
import { prisma } from '../../lib/prisma.js'
import env from '../../config/env.js'
import { handleCheckOutComplete, handleChangeSubcription } from './payment.utils.js'
import AppError from '../../utils/AppError.js'

const createCheckOutSession = async (userId: string) => {
  const activeSub = await prisma.subscriptions.findFirst({
    where: { user_id: userId, status: 'active' },
  })

  if (activeSub) {
    throw new AppError('User already has an active subscription', 400)
  }

  const checkoutTransaction = await prisma.$transaction(async (tx) => {
    const user = await tx.users.findUniqueOrThrow({
      where: { id: userId },
    })

    const pastSub = await tx.subscriptions.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    })

    let stripeCustomerId = pastSub?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      })
      stripeCustomerId = customer.id
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
      success_url: `${env.FRONTEND_URL}/dashboard/subscription?success`,
      cancel_url: `${env.FRONTEND_URL}/dashboard/subscription?cancel`,
      metadata: { userId: user.id },
    })

    return session.url
  })

  return { paymentURL: checkoutTransaction }
}

const webhookService = async (payload: Buffer, signature: string) => {
  const event = stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckOutComplete(event.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.created':
      await handleChangeSubcription(event.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted':
      await handleChangeSubcription(event.data.object as Stripe.Subscription)
      break
    default:
      console.log(`Unhandled event type ${event.type}.`)
      break
  }
}

const getSubscriptionStatus = async (userId: string) => {
  const subscription = await prisma.subscriptions.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  })

  if (!subscription) {
    return { status: null, isSubscribed: false, currentPeriodEnd: null }
  }

  const isActive = subscription.status === 'active' && subscription.currentPeriodEnd > new Date()

  return {
    status: subscription.status,
    isSubscribed: isActive,
    currentPeriodEnd: subscription.currentPeriodEnd,
  }
}

const getAllPaymentsFromDB = async ({
  page,
  limit,
  search,
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  const safePage = Math.max(1, Number(page) || 1)
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 10))

  const where: Prisma.SubscriptionsWhereInput =
    search && search.trim().length > 0
      ? {
          OR: [
            { user: { name: { contains: search.trim(), mode: 'insensitive' } } },
            { user: { email: { contains: search.trim(), mode: 'insensitive' } } },
            { stripeCustomerId: { contains: search.trim() } },
            { stripeSubscriptionId: { contains: search.trim() } },
          ],
        }
      : {}

  const [payments, totalItems] = await Promise.all([
    prisma.subscriptions.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            photoURL: true,
          },
        },
      },
    }),
    prisma.subscriptions.count({ where }),
  ])

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit)

  return {
    payments,
    pagination: {
      currentPage: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  }
}

const getPaymentHistory = async (userId: string) => {
  const subscriptions = await prisma.subscriptions.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  })

  return subscriptions.map((sub) => ({
    id: sub.id,
    plan: sub.plan,
    status: sub.status,
    startedAt: sub.started_at,
    currentPeriodEnd: sub.currentPeriodEnd,
    stripeSubscriptionId: sub.stripeSubscriptionId,
    createdAt: sub.created_at,
  }))
}

export const subscriptionService = {
  createCheckOutSession,
  webhookService,
  getSubscriptionStatus,
  getPaymentHistory,
  getAllPaymentsFromDB,
}
