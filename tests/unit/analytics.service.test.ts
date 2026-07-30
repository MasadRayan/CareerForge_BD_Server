import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { analyticsService } from "../../src/module/analytics/analytics.service";

describe("analyticsService.getUserStatus", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns full status with subscription, usage, streak, content counts, readiness", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      plan: "premium",
      status: "active",
      currentPeriodEnd: new Date("2025-12-31"),
      started_at: new Date("2025-01-01"),
    });
    mockPrisma.usageQuotas.findUnique.mockResolvedValue({
      analyses_used_this_month: 3,
      reset_date: new Date("2025-02-01"),
    });
    mockPrisma.streaks.findUnique.mockResolvedValue({
      current_streak: 5,
      longest_streak: 10,
      last_active_date: new Date("2025-01-15"),
    });
    mockPrisma.cVs.count.mockResolvedValue(2);
    mockPrisma.analyses.count.mockResolvedValue(4);
    mockPrisma.roadmaps.count.mockResolvedValue(3);
    mockPrisma.quizAttempts.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(7);
    mockPrisma.behavioralAnswers.count.mockResolvedValue(5);
    mockPrisma.readinessScores.findFirst.mockResolvedValue({
      composite_score: 85,
    });

    const result = await analyticsService.getUserStatus("user-1");

    expect(result.subscription).toEqual({
      plan: "premium",
      status: "active",
      currentPeriodEnd: expect.any(Date),
      startedAt: expect.any(Date),
    });
    expect(result.usage).toEqual({
      analysesUsedThisMonth: 3,
      analysesLimit: 100,
      resetDate: expect.any(Date),
    });
    expect(result.streak).toEqual({
      current: 5,
      longest: 10,
      lastActive: expect.any(Date),
    });
    expect(result.content).toEqual({
      totalCvs: 2,
      totalAnalyses: 4,
      totalRoadmaps: 3,
      totalQuizAttempts: 10,
      quizAccuracy: 70,
      totalBehavioralAnswers: 5,
    });
    expect(result.readinessScore).toBe(85);
  });

  it("returns defaults (null/0) when no data exists", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue(null);
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(null);
    mockPrisma.streaks.findUnique.mockResolvedValue(null);
    mockPrisma.cVs.count.mockResolvedValue(0);
    mockPrisma.analyses.count.mockResolvedValue(0);
    mockPrisma.roadmaps.count.mockResolvedValue(0);
    mockPrisma.quizAttempts.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockPrisma.behavioralAnswers.count.mockResolvedValue(0);
    mockPrisma.readinessScores.findFirst.mockResolvedValue(null);

    const result = await analyticsService.getUserStatus("user-1");

    expect(result.subscription).toBeNull();
    expect(result.usage).toEqual({
      analysesUsedThisMonth: 0,
      analysesLimit: 5,
      resetDate: null,
    });
    expect(result.streak).toBeNull();
    expect(result.content.quizAccuracy).toBe(0);
    expect(result.readinessScore).toBeNull();
  });

  it("premium plan has limit of 100", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      plan: "premium",
      status: "active",
      currentPeriodEnd: new Date("2025-12-31"),
      started_at: new Date("2025-01-01"),
    });
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(null);
    mockPrisma.streaks.findUnique.mockResolvedValue(null);
    mockPrisma.cVs.count.mockResolvedValue(0);
    mockPrisma.analyses.count.mockResolvedValue(0);
    mockPrisma.roadmaps.count.mockResolvedValue(0);
    mockPrisma.quizAttempts.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockPrisma.behavioralAnswers.count.mockResolvedValue(0);
    mockPrisma.readinessScores.findFirst.mockResolvedValue(null);

    const result = await analyticsService.getUserStatus("user-1");

    expect(result.usage.analysesLimit).toBe(100);
  });

  it("calculates quiz accuracy correctly", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue(null);
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(null);
    mockPrisma.streaks.findUnique.mockResolvedValue(null);
    mockPrisma.cVs.count.mockResolvedValue(0);
    mockPrisma.analyses.count.mockResolvedValue(0);
    mockPrisma.roadmaps.count.mockResolvedValue(0);
    mockPrisma.quizAttempts.count
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1);
    mockPrisma.behavioralAnswers.count.mockResolvedValue(0);
    mockPrisma.readinessScores.findFirst.mockResolvedValue(null);

    const result = await analyticsService.getUserStatus("user-1");

    expect(result.content.totalQuizAttempts).toBe(4);
    expect(result.content.quizAccuracy).toBe(25);
  });
});

describe("analyticsService.getAdminAnalytics", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns aggregated analytics with mrr, subscribers, churn, etc.", async () => {
    mockPrisma.subscriptions.count
      .mockResolvedValueOnce(200)
      .mockResolvedValueOnce(30)
      .mockResolvedValueOnce(5);
    mockPrisma.transactions.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 100000 } })
      .mockResolvedValueOnce({ _sum: { amount: 10000 } });
    mockPrisma.users.groupBy.mockResolvedValue([
      { role: "free_user", _count: 800 },
      { role: "premium", _count: 200 },
    ]);
    mockPrisma.users.count
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(1000);
    mockPrisma.analyses.count.mockResolvedValue(5000);
    mockPrisma.cVs.count.mockResolvedValue(2000);
    mockPrisma.roadmaps.count.mockResolvedValue(1000);
    mockPrisma.transactions.findMany.mockResolvedValue([
      { amount: 5000, created_at: new Date("2025-01-15") },
      { amount: 5000, created_at: new Date("2025-02-15") },
    ]);

    const result = await analyticsService.getAdminAnalytics();

    expect(result.mrr).toBe(10000);
    expect(result.activeSubscribers).toBe(200);
    expect(result.totalRevenue).toBe(100000);
    expect(result.totalUsers).toBe(1000);
    expect(result.newSignupsThisMonth).toBe(50);
    expect(result.newSubscriptionsThisMonth).toBe(30);
    expect(result.totalAnalyses).toBe(5000);
    expect(result.totalCvs).toBe(2000);
    expect(result.totalRoadmaps).toBe(1000);
    expect(result.userSplit).toEqual({ free_user: 800, premium: 200 });
    expect(result.revenueByMonth).toHaveLength(2);
  });

  it("handles empty data (zero counts)", async () => {
    mockPrisma.subscriptions.count.mockResolvedValue(0);
    mockPrisma.transactions.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });
    mockPrisma.users.groupBy.mockResolvedValue([]);
    mockPrisma.users.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockPrisma.analyses.count.mockResolvedValue(0);
    mockPrisma.cVs.count.mockResolvedValue(0);
    mockPrisma.roadmaps.count.mockResolvedValue(0);
    mockPrisma.transactions.findMany.mockResolvedValue([]);

    const result = await analyticsService.getAdminAnalytics();

    expect(result.mrr).toBe(0);
    expect(result.activeSubscribers).toBe(0);
    expect(result.totalRevenue).toBe(0);
    expect(result.totalUsers).toBe(0);
    expect(result.churnRate).toBe(0);
    expect(result.userSplit).toEqual({});
    expect(result.revenueByMonth).toEqual([]);
  });

  it("calculates churn rate correctly", async () => {
    mockPrisma.subscriptions.count
      .mockResolvedValueOnce(100)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(10);
    mockPrisma.transactions.aggregate
      .mockResolvedValueOnce({ _sum: { amount: null } })
      .mockResolvedValueOnce({ _sum: { amount: null } });
    mockPrisma.users.groupBy.mockResolvedValue([]);
    mockPrisma.users.count
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    mockPrisma.analyses.count.mockResolvedValue(0);
    mockPrisma.cVs.count.mockResolvedValue(0);
    mockPrisma.roadmaps.count.mockResolvedValue(0);
    mockPrisma.transactions.findMany.mockResolvedValue([]);

    const result = await analyticsService.getAdminAnalytics();

    expect(result.churnRate).toBe(0.1);
  });
});
