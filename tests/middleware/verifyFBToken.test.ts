import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: {
    verifyIdToken: jest.fn(),
  },
}));

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { firebaseAuth } from "../../src/config/firebase";
import express from "express";
import request from "supertest";
import { verifyFBToken } from "../../src/middleware/verifyFBToken";
import { sampleUser } from "../utils/fixtures";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.get("/protected", verifyFBToken, (_req, res) => {
    res.json({ success: true, user: _req.user });
  });
  return app;
};

describe("verifyFBToken middleware", () => {
  beforeEach(() => {
    resetPrismaMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 401 when no auth header", async () => {
    const app = createApp();
    const res = await request(app).get("/protected");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized Access");
  });

  it("returns 401 when token is invalid", async () => {
    const mockVerify = firebaseAuth.verifyIdToken as jest.Mock;
    mockVerify.mockRejectedValue(new Error("Invalid token"));

    const app = createApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
  });

  it("returns 401 when user not found in DB", async () => {
    const mockVerify = firebaseAuth.verifyIdToken as jest.Mock;
    mockVerify.mockResolvedValue({ email: "test@example.com" });
    mockPrisma.users.findUnique.mockResolvedValue(null);

    const app = createApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("User not found");
  });

  it("calls next() when token is valid and user exists", async () => {
    const mockVerify = firebaseAuth.verifyIdToken as jest.Mock;
    mockVerify.mockResolvedValue({ email: "test@example.com" });
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);

    const app = createApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual(
      expect.objectContaining({
        id: "user-1",
        email: "test@example.com",
      }),
    );
  });
});
