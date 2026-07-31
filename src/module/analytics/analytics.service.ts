import { prisma } from '../../lib/prisma.js'

const getUserStatus = async (userId: string) => {
  const [
    subscription,
    usageQuota,
    streak,
    cvCount,
    analysisCount,
    roadmapCount,
    quizTotal,
    quizCorrect,
    behavioralCount,
    latestReadiness,
  ] = await Promise.all([
    prisma.subscriptions.findFirst({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    }),

    prisma.usageQuotas.findUnique({ where: { user_id: userId } }),

    prisma.streaks.findUnique({ where: { user_id: userId } }),

    prisma.cVs.count({ where: { user_id: userId } }),

    prisma.analyses.count({
      where: { cv: { user_id: userId } },
    }),

    prisma.roadmaps.count({ where: { user_id: userId } }),

    prisma.quizAttempts.count({ where: { user_id: userId } }),

    prisma.quizAttempts.count({
      where: { user_id: userId, is_correct: true },
    }),

    prisma.behavioralAnswers.count({ where: { user_id: userId } }),

    prisma.readinessScores.findFirst({
      where: { user_id: userId },
      orderBy: { calculated_at: 'desc' },
    }),
  ])

  const planLimit = subscription?.plan === 'premium' ? 100 : 5

  return {
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          startedAt: subscription.started_at,
        }
      : null,
    usage: {
      analysesUsedThisMonth: usageQuota?.analyses_used_this_month ?? 0,
      analysesLimit: planLimit,
      resetDate: usageQuota?.reset_date ?? null,
    },
    streak: streak
      ? {
          current: streak.current_streak,
          longest: streak.longest_streak,
          lastActive: streak.last_active_date,
        }
      : null,
    content: {
      totalCvs: cvCount,
      totalAnalyses: analysisCount,
      totalRoadmaps: roadmapCount,
      totalQuizAttempts: quizTotal,
      quizAccuracy: quizTotal > 0 ? Math.round((quizCorrect / quizTotal) * 100) : 0,
      totalBehavioralAnswers: behavioralCount,
    },
    readinessScore: latestReadiness?.composite_score ?? null,
  }
}

const getAdminAnalytics = async () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLast30 = new Date(now.getTime() - 30 * 86400000)

  const [
    activeSubscribers,
    totalRevenue,
    mrr,
    userSplit,
    newSignupsThisMonth,
    newSubscriptionsThisMonth,
    cancelledLast30,
    totalUsers,
    totalAnalyses,
    totalCvs,
    totalRoadmaps,
    allRevenueTx,
  ] = await Promise.all([
    prisma.subscriptions.count({ where: { status: 'active' } }),

    prisma.transactions.aggregate({
      where: { status: 'success' },
      _sum: { amount: true },
    }),

    prisma.transactions.aggregate({
      where: { status: 'success', created_at: { gte: startOfMonth } },
      _sum: { amount: true },
    }),

    prisma.users.groupBy({
      by: ['role'],
      _count: true,
    }),

    prisma.users.count({ where: { created_at: { gte: startOfMonth } } }),

    prisma.subscriptions.count({ where: { created_at: { gte: startOfMonth } } }),

    prisma.subscriptions.count({
      where: {
        status: { in: ['cancelled', 'expired'] },
        created_at: { gte: startOfLast30 },
      },
    }),

    prisma.users.count(),

    prisma.analyses.count(),

    prisma.cVs.count(),

    prisma.roadmaps.count(),

    prisma.transactions.findMany({
      where: { status: 'success' },
      select: { amount: true, created_at: true },
      orderBy: { created_at: 'asc' },
    }),
  ])

  const churnRate = activeSubscribers > 0 ? cancelledLast30 / activeSubscribers : 0

  const revenueByMonthMap = new Map<string, number>()
  for (const tx of allRevenueTx) {
    const key = `${tx.created_at.getFullYear()}-${String(tx.created_at.getMonth() + 1).padStart(2, '0')}`
    revenueByMonthMap.set(key, (revenueByMonthMap.get(key) ?? 0) + Number(tx.amount))
  }
  const revenueByMonth = Array.from(revenueByMonthMap.entries()).map(([month, revenue]) => ({
    month,
    revenue,
  }))

  return {
    mrr: Number(mrr._sum.amount ?? 0),
    activeSubscribers,
    totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    churnRate: Math.round(churnRate * 100) / 100,
    totalUsers,
    userSplit: Object.fromEntries(userSplit.map((g) => [g.role, g._count])),
    revenueByMonth,
    newSignupsThisMonth,
    newSubscriptionsThisMonth,
    totalAnalyses,
    totalCvs,
    totalRoadmaps,
  }
}

const getPublicAnalytics = async () => {
  const [cvsAnalyzed, starRewrites, careerRoadmaps, mockInterviews, totalUsers] =
    await Promise.all([
      prisma.analyses.count(),
      prisma.$queryRaw<{ total: number }[]>`SELECT COALESCE(SUM(jsonb_array_length(rewrite_suggestions)), 0)::int AS "total" FROM "analyses"`,
      prisma.roadmaps.count(),
      prisma.behavioralAnswers.count(),
      prisma.users.count(),
    ])

  return {
    cvsAnalyzed,
    starRewrites: Number(starRewrites[0]?.total ?? 0),
    careerRoadmaps,
    mockInterviews,
    totalUsers,
  }
}

export const analyticsService = { getUserStatus, getAdminAnalytics, getPublicAnalytics }
