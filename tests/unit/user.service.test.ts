import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";
import { sampleUser } from "../utils/fixtures";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { userService } from "../../src/module/user/user.service";

describe("userService.registerUserIntoDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("creates a new user when email does not exist", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);
    mockPrisma.users.create.mockResolvedValue(sampleUser);

    const result = await userService.registerUserIntoDB({
      name: "Test User",
      email: "test@example.com",
      experience_level: "mid",
      target_role: "fullstack",
      photoURL: "https://example.com/photo.jpg",
    });

    expect(result).toEqual(sampleUser);
    expect(mockPrisma.users.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "test@example.com",
        name: "Test User",
      }),
    });
  });

  it("returns existing user when email already exists", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);

    const result = await userService.registerUserIntoDB({
      name: "Test User",
      email: "test@example.com",
    });

    expect(result).toEqual(sampleUser);
    expect(mockPrisma.users.create).not.toHaveBeenCalled();
  });
});

describe("userService.getAllUserFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns paginated users", async () => {
    const users = Array.from({ length: 5 }, (_, i) => ({
      ...sampleUser,
      id: `user-${i + 1}`,
      email: `user${i + 1}@example.com`,
    }));
    mockPrisma.users.findMany.mockResolvedValue(users);

    const result = await userService.getAllUserFromDB(1);

    expect(result).toHaveLength(5);
    expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
      }),
    );
  });

  it("applies pagination skip correctly", async () => {
    mockPrisma.users.findMany.mockResolvedValue([]);

    await userService.getAllUserFromDB(3);

    expect(mockPrisma.users.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      }),
    );
  });
});

describe("userService.getASingleUser", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns user when found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);

    const result = await userService.getASingleUser("test@example.com");

    expect(result).toEqual(sampleUser);
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      userService.getASingleUser("nonexistent@example.com"),
    ).rejects.toThrow("User not found");
  });
});

describe("userService.updateASingleUserInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("updates user when found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);
    mockPrisma.users.update.mockResolvedValue({
      ...sampleUser,
      name: "Updated Name",
    });

    await userService.updateASingleUserInDB("test@example.com", {
      name: "Updated Name",
      experience_level: "senior",
    });

    expect(mockPrisma.users.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "test@example.com" },
        data: expect.objectContaining({
          name: "Updated Name",
          experience_level: "senior",
        }),
      }),
    );
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      userService.updateASingleUserInDB("nonexistent@example.com", {
        name: "Test",
      }),
    ).rejects.toThrow("User not found");
  });
});

describe("userService.deleteAUserFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("deletes user when found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(sampleUser);
    mockPrisma.users.delete.mockResolvedValue(sampleUser);

    await userService.deleteAUserFromDB("test@example.com");

    expect(mockPrisma.users.delete).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("throws 404 when user not found", async () => {
    mockPrisma.users.findUnique.mockResolvedValue(null);

    await expect(
      userService.deleteAUserFromDB("nonexistent@example.com"),
    ).rejects.toThrow("User not found");
  });
});

describe("userService.getRoleOfUserFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns user role", async () => {
    mockPrisma.users.findUnique.mockResolvedValue({ role: "admin" });

    const result = await userService.getRoleOfUserFromDB("user-1");

    expect(result).toEqual({ role: "admin" });
  });
});
