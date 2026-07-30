import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
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

import { notificationRouter } from "../../src/module/notification/notification.route";

const app = createTestApp("/api/notification", notificationRouter);

describe("POST /api/notification/reminder", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 and sends reminder", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });
    mockPrisma.streaks.findUnique.mockResolvedValue({
      current_streak: 5,
      longest_streak: 10,
    });

    const res = await request(app)
      .post("/api/notification/reminder")
      .send({ user_id: "user-1" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Study reminder sent successfully");
  });

  it("returns 400 when user_id is missing", async () => {
    const res = await request(app)
      .post("/api/notification/reminder")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/notification/expiry", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 and sends expiry email", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      plan: "premium",
    });

    const res = await request(app)
      .post("/api/notification/expiry")
      .send({ user_id: "user-1", days_left: 7 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Subscription expiry email sent successfully");
  });

  it("returns 400 when user_id is missing", async () => {
    const res = await request(app)
      .post("/api/notification/expiry")
      .send({ days_left: 7 });

    expect(res.status).toBe(400);
  });
});
