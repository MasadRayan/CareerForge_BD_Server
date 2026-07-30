import request from "supertest";
import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { createTestApp } from "../utils/createTestApp";
import { sampleUser } from "../utils/fixtures";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/firebase", () => ({
  firebaseAuth: { verifyIdToken: jest.fn() },
}));
jest.mock("../../src/middleware/verifyFBToken", () => ({
  verifyFBToken: (_req: any, _res: any, next: any) => {
    _req.user = { id: "user-1", name: "Test User", email: "test@example.com", role: "free_user" };
    next();
  },
}));
jest.mock("../../src/middleware/verifyAdmin", () => ({
  verifyAdmin: (_req: any, _res: any, next: any) => next(),
}));

import { userRouter } from "../../src/module/user/user.route";

const app = createTestApp("/api/users", userRouter);

describe("POST /api/users/register", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("creates a new user", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);
    mockPrisma.users.create.mockResolvedValue(sampleUser);

    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      target_role: "fullstack",
      experience_level: "mid",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("returns existing user on duplicate", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);

    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("test@example.com");
  });
});

describe("GET /api/users/me/:email", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns user when found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);

    const res = await request(app).get("/api/users/me/test@example.com");

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("test@example.com");
  });

  it("returns 404 when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/api/users/me/nonexistent@example.com");

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/users/update/:email", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("updates user when found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);
    mockPrisma.users.update.mockResolvedValue({
      ...sampleUser,
      name: "Updated Name",
    });

    const res = await request(app)
      .patch("/api/users/update/test@example.com")
      .send({ name: "Updated Name", experience_level: "senior" });

    expect(res.status).toBe(200);
  });

  it("returns 404 when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/users/update/nonexistent@example.com")
      .send({ name: "Test" });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/users/delete/:email", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("deletes user when found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);
    mockPrisma.users.delete.mockResolvedValue(sampleUser);

    const res = await request(app).delete(
      "/api/users/delete/test@example.com",
    );

    expect(res.status).toBe(200);
  });

  it("returns 404 when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    const res = await request(app).delete(
      "/api/users/delete/nonexistent@example.com",
    );

    expect(res.status).toBe(404);
  });
});
