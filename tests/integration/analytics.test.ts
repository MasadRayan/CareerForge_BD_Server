import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/middleware/verifyFBToken", () => ({
  verifyFBToken: (_req: any, _res: any, next: any) => {
    _req.user = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "free_user",
    };
    next();
  },
}));
jest.mock("../../src/middleware/verifyAdmin", () => ({
  verifyAdmin: (_req: any, _res: any, next: any) => next(),
}));

import { analyticsRouter } from "../../src/module/analytics/analytics.route";

const app = createTestApp("/api/analytics", analyticsRouter);

describe("GET /api/analytics/status", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with user status", async () => {
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

    const res = await request(app).get("/api/analytics/status");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("usage");
    expect(res.body.data).toHaveProperty("content");
  });

  it("returns correct usage shape with default values", async () => {
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

    const res = await request(app).get("/api/analytics/status");

    expect(res.body.data.usage).toEqual({
      analysesUsedThisMonth: 0,
      analysesLimit: 5,
      resetDate: null,
    });
  });
});

describe("GET /api/analytics/admin", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with admin analytics", async () => {
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

    const res = await request(app).get("/api/analytics/admin");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("mrr");
    expect(res.body.data).toHaveProperty("activeSubscribers");
    expect(res.body.data).toHaveProperty("churnRate");
  });

  it("returns analytics with user role split", async () => {
    mockPrisma.subscriptions.count.mockResolvedValue(10);
    mockPrisma.transactions.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 50000 } })
      .mockResolvedValueOnce({ _sum: { amount: 5000 } });
    mockPrisma.users.groupBy.mockResolvedValue([
      { role: "free_user", _count: 80 },
      { role: "premium", _count: 20 },
    ]);
    mockPrisma.users.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(100);
    mockPrisma.analyses.count.mockResolvedValue(100);
    mockPrisma.cVs.count.mockResolvedValue(50);
    mockPrisma.roadmaps.count.mockResolvedValue(25);
    mockPrisma.transactions.findMany.mockResolvedValue([
      { amount: 5000, created_at: new Date("2025-01-15") },
    ]);

    const res = await request(app).get("/api/analytics/admin");

    expect(res.body.data.userSplit).toEqual({ free_user: 80, premium: 20 });
    expect(res.body.data.totalUsers).toBe(100);
    expect(res.body.data.totalAnalyses).toBe(100);
  });
});
