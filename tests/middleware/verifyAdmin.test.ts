import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { verifyAdmin } from "../../src/middleware/verifyAdmin";
import { sampleUser } from "../utils/fixtures";

describe("verifyAdmin middleware", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    resetPrismaMocks();
    req = {} as any;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    next = jest.fn();
  });

  it("returns 401 when no email in decoded", async () => {
    req.decoded = {};

    await verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user not found in DB", async () => {
    req.decoded = { email: "unknown@example.com" };
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when user role is not admin", async () => {
    req.decoded = { email: "user@example.com" };
    mockPrisma.users.findUnique.mockResolvedValue({
      ...sampleUser,
      email: "user@example.com",
      role: "free_user",
    });

    await verifyAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Unauthorized Access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when user role is admin", async () => {
    req.decoded = { email: "admin@example.com" };
    mockPrisma.users.findUnique.mockResolvedValue({
      ...sampleUser,
      email: "admin@example.com",
      role: "admin",
    });

    await verifyAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
