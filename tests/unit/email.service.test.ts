import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("../../src/config/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

import { sendEmail } from "../../src/config/email";
import {
  sendPaymentReceipt,
  sendStudyReminder,
  sendSubscriptionExpiry,
} from "../../src/module/notification/email.service";

describe("sendPaymentReceipt", () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.clearAllMocks();
  });

  it("sends email with receipt template", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });
    mockPrisma.transactions.findUnique.mockResolvedValue({
      amount: 999,
      currency: "BDT",
      created_at: new Date("2025-01-15"),
    });

    await sendPaymentReceipt("user-1", "txn-1");

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Payment Receipt — CareerForge BD",
      expect.stringContaining("BDT 999"),
    );
  });

  it("throws AppError(404) when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      sendPaymentReceipt("nonexistent", "txn-1"),
    ).rejects.toThrow("User not found");

    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe("sendStudyReminder", () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.clearAllMocks();
  });

  it("sends email with streak info", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });
    mockPrisma.streaks.findUnique.mockResolvedValue({
      current_streak: 7,
      longest_streak: 14,
    });

    await sendStudyReminder("user-1");

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Don't lose your streak — CareerForge BD",
      expect.stringContaining("7-day"),
    );
  });
});

describe("sendSubscriptionExpiry", () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.clearAllMocks();
  });

  it("sends expiry email", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });
    mockPrisma.subscriptions.findFirst.mockResolvedValue({
      plan: "premium",
    });

    await sendSubscriptionExpiry("user-1", 7);

    expect(sendEmail).toHaveBeenCalledWith(
      "test@example.com",
      "Subscription expiring in 7 day(s) — CareerForge BD",
      expect.stringContaining("premium"),
    );
  });

  it("does not send email when no active subscription exists", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({
      name: "Test User",
      email: "test@example.com",
    });
    mockPrisma.subscriptions.findFirst.mockResolvedValue(null);

    await sendSubscriptionExpiry("user-1", 7);

    expect(sendEmail).not.toHaveBeenCalled();
  });
});
