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
    next();
  },
}));
jest.mock("../../src/config/groq", () => ({
  groqChatCompletion: jest.fn(),
}));
jest.mock("../../src/utils/tokenUtils", () => ({
  prepareCV: jest.fn((s: string) => s),
  prepareJD: jest.fn((s: string) => s),
}));

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");

import { analysisRouter } from "../../src/module/analysis/analysis.route";

const app = createTestApp("/api/analysis", analysisRouter);
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  res.status(status).json({ success: false, message: err.message });
};
app.use(errorHandler);

const mockGroqResponse = JSON.stringify({
  ats_score: 85,
  keyword_match_breakdown: {
    matched_keywords: ["resume", "python"],
    missing_keywords: ["java"],
    formatting_issues: [],
    missing_sections: ["summary"],
  },
  gap_skills: ["docker"],
  rewrite_suggestions: [
    { original: "old", suggested: "new", explanation: "better" },
  ],
});

const mockAnalysis = {
  id: "analysis-1",
  cv_id: "cv-1",
  jd_id: "jd-1",
  ats_score: 85,
  keyword_match_breakdown: {
    matched_keywords: ["resume", "python"],
    missing_keywords: ["java"],
    formatting_issues: [],
    missing_sections: ["summary"],
  },
  gap_skills: ["docker"],
  rewrite_suggestions: [
    { original: "old", suggested: "new", explanation: "better" },
  ],
  created_at: new Date().toISOString(),
};

const mockAnalysesList = [
  { id: "analysis-1", cv_id: "cv-1", jd_id: "jd-1", ats_score: 85, created_at: new Date().toISOString() },
];

describe("POST /api/analysis", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 201 and creates an analysis", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue({ id: "cv-1", user_id: "user-1", raw_text: "CV text" });
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue({ id: "jd-1", user_id: "user-1", raw_text: "JD text" });
    mockPrisma.users.findUnique.mockResolvedValue({ role: "free_user" });
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(null);
    groqChatCompletion.mockResolvedValue(mockGroqResponse);
    mockPrisma.usageQuotas.create.mockResolvedValue({ analyses_used_this_month: 0, reset_date: new Date(), user_id: "user-1" });
    mockPrisma.analyses.create.mockResolvedValue(mockAnalysis);

    const res = await request(app)
      .post("/api/analysis")
      .send({ cv_id: "cv-1", jd_id: "jd-1" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ats_score).toBe(85);
  });

  it("returns 400 when cv_id or jd_id is missing", async () => {
    const res = await request(app)
      .post("/api/analysis")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 429 when free tier limit is reached", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue({ id: "cv-1", user_id: "user-1", raw_text: "CV text" });
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue({ id: "jd-1", user_id: "user-1", raw_text: "JD text" });
    mockPrisma.users.findUnique.mockResolvedValue({ role: "free_user" });
    mockPrisma.usageQuotas.findUnique.mockResolvedValue({
      analyses_used_this_month: 5,
      reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const res = await request(app)
      .post("/api/analysis")
      .send({ cv_id: "cv-1", jd_id: "jd-1" });

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/analysis", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a list of analyses", async () => {
    mockPrisma.analyses.findMany.mockResolvedValue(mockAnalysesList);

    const res = await request(app).get("/api/analysis");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});

describe("GET /api/analysis/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 with a single analysis", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(mockAnalysis);

    const res = await request(app).get("/api/analysis/analysis-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("analysis-1");
  });

  it("returns 404 when analysis not found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);

    const res = await request(app).get("/api/analysis/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("DELETE /api/analysis/:id", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns 200 when analysis is deleted", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({ id: "analysis-1" });
    mockPrisma.analyses.delete.mockResolvedValue({ id: "analysis-1" });

    const res = await request(app).delete("/api/analysis/analysis-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 404 when analysis to delete is not found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);

    const res = await request(app).delete("/api/analysis/nonexistent");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
