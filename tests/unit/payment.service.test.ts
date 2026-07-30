import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("../../src/lib/stripe", () => ({
  stripe: {
    customers: { create: jest.fn() },
    checkout: { sessions: { create: jest.fn() } },
    webhooks: { constructEvent: jest.fn() },
    subscriptions: { retrieve: jest.fn() },
  },
}));

import { stripe } from "../../src/lib/stripe";
import { subscriptionService } from "../../src/module/payment/payment.service";

describe("subscriptionService.createCheckOutSession", () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.clearAllMocks();
  });

  it("creates checkout URL when no existing active subscription", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue(null);

    const txMock = {
      users: {
        ...mockPrisma.users,
        findUniqueOrThrow: jest.fn().mockResolvedValue({
          id: "user-1",
          email: "test@example.com",
          name: "Test User",
        }),
      },
      subscriptions: mockPrisma.subscriptions,
    };
    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof txMock) => Promise<string>) => cb(txMock),
    );

    (stripe.customers.create as jest.Mock).mockResolvedValue({
      id: "cus_xxx",
    });
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: "https://checkout.stripe.com/pay/cs_xxx",
    });

    const result = await subscriptionService.createCheckOutSession("user-1");

    expect(result).toEqual({
      paymentURL: "https://checkout.stripe.com/pay/cs_xxx",
    });
    expect(stripe.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "test@example.com" }),
    );
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        customer: "cus_xxx",
      }),
    );
  });

  it("throws 400 when active subscription exists", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      id: "sub-1",
      status: "active",
    });

    await expect(
      subscriptionService.createCheckOutSession("user-1"),
    ).rejects.toThrow("User already has an active subscription");

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});

describe("subscriptionService.getSubscriptionStatus", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns isSubscribed: true for active subscription", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 86400000),
    });

    const result = await subscriptionService.getSubscriptionStatus("user-1");

    expect(result.isSubscribed).toBe(true);
    expect(result.status).toBe("active");
    expect(result.currentPeriodEnd).toEqual(expect.any(Date));
  });

  it("returns isSubscribed: false for expired subscription", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      status: "expired",
      currentPeriodEnd: new Date(Date.now() - 86400000),
    });

    const result = await subscriptionService.getSubscriptionStatus("user-1");

    expect(result.isSubscribed).toBe(false);
    expect(result.status).toBe("expired");
  });

  it("returns null status when no subscription exists", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue(null);

    const result = await subscriptionService.getSubscriptionStatus("user-1");

    expect(result.status).toBeNull();
    expect(result.isSubscribed).toBe(false);
    expect(result.currentPeriodEnd).toBeNull();
  });
});

describe("subscriptionService.getPaymentHistory", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns mapped subscription list", async () => {
    const subs = [
      {
        id: "sub-1",
        plan: "premium",
        status: "active",
        started_at: new Date("2025-01-01"),
        currentPeriodEnd: new Date("2025-12-31"),
        stripeSubscriptionId: "sub_xxx",
        created_at: new Date("2025-01-01"),
      },
    ];
    mockPrisma.subscriptions.findMany.mockResolvedValue(subs);

    const result = await subscriptionService.getPaymentHistory("user-1");

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: "sub-1",
      plan: "premium",
      status: "active",
      startedAt: subs[0].started_at,
      currentPeriodEnd: subs[0].currentPeriodEnd,
      stripeSubscriptionId: "sub_xxx",
      createdAt: subs[0].created_at,
    });
  });
});
