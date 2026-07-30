import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";

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

import { stripe } from "../../src/lib/stripe";
import { subscriptionRouter } from "../../src/module/payment/payment.route";

const app = createTestApp("/api/subscription", subscriptionRouter);

describe("POST /api/subscription/checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMocks();
  });

  it("returns 200 with checkout session URL", async () => {
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

    const res = await request(app).post("/api/subscription/checkout");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentURL).toBe(
      "https://checkout.stripe.com/pay/cs_xxx",
    );
  });
});

describe("POST /api/subscription/webhook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPrismaMocks();
  });

  it("returns 200 and processes webhook", async () => {
    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: "checkout.session.completed",
      data: { object: {} },
    });

    const res = await request(app)
      .post("/api/subscription/webhook")
      .set("stripe-signature", "test_sig")
      .send({ type: "checkout.session.completed" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Webhook processed successfully");
  });
});

describe("GET /api/subscription/status", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with subscription status", async () => {
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 86400000),
    });

    const res = await request(app).get("/api/subscription/status");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isSubscribed).toBe(true);
  });
});

describe("GET /api/subscription/history", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with payment history", async () => {
    mockPrisma.subscriptions.findMany.mockResolvedValue([]);

    const res = await request(app).get("/api/subscription/history");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });
});
