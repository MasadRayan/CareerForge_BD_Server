import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { usageQuota } from "../../src/middleware/usagesQuotas";

const now = new Date("2026-07-30T12:00:00Z");
const futureResetDate = new Date("2026-08-01T00:00:00Z");
const pastResetDate = new Date("2026-07-01T00:00:00Z");

describe("usageQuota middleware", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    resetPrismaMocks();
    jest.useFakeTimers();
    jest.setSystemTime(now);
    req = {} as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    next = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("skips quota check for premium user and calls next()", async () => {
    req.user = {
      id: "user-1",
      name: "Premium",
      email: "premium@test.com",
      role: "premium",
    };

    await usageQuota(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockPrisma.usageQuotas.findUnique).not.toHaveBeenCalled();
  });

  it("creates quota for free user with no existing quota, increments, and calls next()", async () => {
    req.user = {
      id: "user-1",
      name: "Free",
      email: "free@test.com",
      role: "free_user",
    };
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(null);
    mockPrisma.usageQuotas.create.mockResolvedValue({
      user_id: "user-1",
      analyses_used_this_month: 0,
      reset_date: futureResetDate,
    });

    await usageQuota(req, res, next);

    expect(mockPrisma.usageQuotas.findUnique).toHaveBeenCalledWith({
      where: { user_id: "user-1" },
    });
    expect(mockPrisma.usageQuotas.create).toHaveBeenCalledWith({
      data: {
        user_id: "user-1",
        analyses_used_this_month: 0,
        reset_date: expect.any(Date),
      },
    });
    expect(mockPrisma.usageQuotas.update).toHaveBeenCalledWith({
      where: { user_id: "user-1" },
      data: { analyses_used_this_month: { increment: 1 } },
    });
    expect(next).toHaveBeenCalled();
  });

  it("returns 429 when free user has reached the monthly limit", async () => {
    req.user = {
      id: "user-1",
      name: "Free",
      email: "free@test.com",
      role: "free_user",
    };
    mockPrisma.usageQuotas.findUnique.mockResolvedValue({
      user_id: "user-1",
      analyses_used_this_month: 1,
      reset_date: futureResetDate,
    });

    await usageQuota(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Free tier limit reached. You can only run 1 analysis per month. Upgrade to premium for unlimited access.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("resets expired quota, increments, and calls next()", async () => {
    req.user = {
      id: "user-1",
      name: "Free",
      email: "free@test.com",
      role: "free_user",
    };
    mockPrisma.usageQuotas.findUnique.mockResolvedValue({
      user_id: "user-1",
      analyses_used_this_month: 5,
      reset_date: pastResetDate,
    });
    mockPrisma.usageQuotas.update
      .mockResolvedValueOnce({
        user_id: "user-1",
        analyses_used_this_month: 0,
        reset_date: futureResetDate,
      })
      .mockResolvedValueOnce({
        user_id: "user-1",
        analyses_used_this_month: 1,
        reset_date: futureResetDate,
      });

    await usageQuota(req, res, next);

    expect(mockPrisma.usageQuotas.update).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalled();
  });

  it("increments usage when free user is under the limit and calls next()", async () => {
    req.user = {
      id: "user-1",
      name: "Free",
      email: "free@test.com",
      role: "free_user",
    };
    mockPrisma.usageQuotas.findUnique.mockResolvedValue({
      user_id: "user-1",
      analyses_used_this_month: 0,
      reset_date: futureResetDate,
    });

    await usageQuota(req, res, next);

    expect(mockPrisma.usageQuotas.update).toHaveBeenCalledWith({
      where: { user_id: "user-1" },
      data: { analyses_used_this_month: { increment: 1 } },
    });
    expect(next).toHaveBeenCalled();
  });

  it("calls next(error) when prisma throws", async () => {
    req.user = {
      id: "user-1",
      name: "Free",
      email: "free@test.com",
      role: "free_user",
    };
    const error = new Error("DB connection failed");
    mockPrisma.usageQuotas.findUnique.mockRejectedValue(error);

    await usageQuota(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
