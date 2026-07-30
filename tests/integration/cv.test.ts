import request from "supertest";
import type { Request, Response, NextFunction } from "express";
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
    _req.decoded = { email: "test@example.com" };
    next();
  },
}));
jest.mock("../../src/lib/cv.upload", () => ({
  uploadCV: (req: any, _res: any, next: any) => {
    req.file = {
      buffer: Buffer.from("test"),
      mimetype: "application/pdf",
      originalname: "test.pdf",
    };
    next();
  },
}));
jest.mock("../../src/lib/cv.parser", () => ({
  parseCVText: jest.fn(),
}));
jest.mock("../../src/config/cloudinary", () => ({
  uploadCVBuffer: jest.fn(),
  deleteCVFile: jest.fn(),
  publicIdFromUrl: jest.fn(),
}));

const { parseCVText } = jest.requireMock("../../src/lib/cv.parser");
const { uploadCVBuffer, deleteCVFile, publicIdFromUrl } = jest.requireMock("../../src/config/cloudinary");

import { cvRouter } from "../../src/module/cv/cv.route";

const app = createTestApp("/api/cv", cvRouter);
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message });
};
app.use(errorHandler);

const mockCreatedCV = {
  id: "cv-1",
  user_id: "user-1",
  version_number: 1,
  file_url: "",
  raw_text: "Parsed CV text",
  uploaded_at: new Date("2025-01-01").toISOString(),
};

const mockUpdatedCV = {
  ...mockCreatedCV,
  file_url: "https://cloudinary.com/test.pdf",
};

const mockCVList = [
  {
    id: "cv-1",
    version_number: 1,
    file_url: "https://cloudinary.com/test.pdf",
    uploaded_at: new Date("2025-01-01").toISOString(),
  },
];

const mockSingleCV = {
  id: "cv-1",
  user_id: "user-1",
  version_number: 1,
  file_url: "https://cloudinary.com/test.pdf",
  raw_text: "Parsed CV text",
  uploaded_at: new Date("2025-01-01").toISOString(),
};

describe("POST /api/cv", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 201 when CV is created successfully", async () => {
    parseCVText.mockResolvedValue("Parsed CV text");
    mockPrisma.cVs.findFirst.mockResolvedValue(null);
    mockPrisma.cVs.create.mockResolvedValue(mockCreatedCV);
    uploadCVBuffer.mockResolvedValue("https://cloudinary.com/test.pdf");
    mockPrisma.cVs.update.mockResolvedValue(mockUpdatedCV);
    mockPrisma.cVs.findMany.mockResolvedValue([mockUpdatedCV]);

    const res = await request(app).post("/api/cv");

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_url).toBe("https://cloudinary.com/test.pdf");
  });

  it("returns 502 when cloudinary upload fails", async () => {
    parseCVText.mockResolvedValue("Parsed CV text");
    mockPrisma.cVs.findFirst.mockResolvedValue(null);
    mockPrisma.cVs.create.mockResolvedValue(mockCreatedCV);
    uploadCVBuffer.mockRejectedValue(new Error("Upload failed"));
    mockPrisma.cVs.delete.mockResolvedValue({ id: "cv-1" });

    const res = await request(app).post("/api/cv");

    expect(res.status).toBe(502);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Failed to upload CV file");
  });
});

describe("GET /api/cv", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a list of CVs", async () => {
    mockPrisma.cVs.findMany.mockResolvedValue(mockCVList);

    const res = await request(app).get("/api/cv");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe("GET /api/cv/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a single CV", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockSingleCV);

    const res = await request(app).get("/api/cv/cv-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("cv-1");
  });

  it("returns 404 when CV is not found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(null);

    const res = await request(app).get("/api/cv/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/cv/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 when CV is deleted", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockSingleCV);
    publicIdFromUrl.mockReturnValue("public-id-123");
    deleteCVFile.mockResolvedValue(undefined);
    mockPrisma.cVs.delete.mockResolvedValue({ id: "cv-1" });

    const res = await request(app).delete("/api/cv/cv-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 when CV to delete is not found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(null);

    const res = await request(app).delete("/api/cv/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
