import { mockPrisma, resetPrismaMocks } from "../__mocks__/prisma";

jest.mock("../../src/lib/prisma", () => ({
  prisma: mockPrisma,
}));
jest.mock("../../src/config/groq", () => ({
  groqChatCompletion: jest.fn(),
}));
jest.mock("../../src/utils/tokenUtils", () => ({
  prepareCV: jest.fn((s: string) => s),
  prepareJD: jest.fn((s: string) => s),
}));

import { analysisService } from "../../src/module/analysis/analysis.service";

const { groqChatCompletion } = jest.requireMock("../../src/config/groq");

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

const mockCV = { id: "cv-1", user_id: "user-1", raw_text: "CV text" };
const mockJD = { id: "jd-1", user_id: "user-1", raw_text: "JD text" };
const mockUser = { role: "free_user" };
const mockPremiumUser = { role: "premium_user" };
const mockResetDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
const mockQuota = {
  analyses_used_this_month: 0,
  reset_date: mockResetDate,
};
const mockQuotaAtLimit = {
  analyses_used_this_month: 5,
  reset_date: mockResetDate,
};
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
  created_at: new Date(),
};
const mockAnalysisListItem = {
  id: "analysis-1",
  cv_id: "cv-1",
  jd_id: "jd-1",
  ats_score: 85,
  created_at: new Date(),
};

describe("analysisService.createAnalysisInDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("throws 400 when cv_id is missing", async () => {
    await expect(
      analysisService.createAnalysisInDB("user-1", { cv_id: "", jd_id: "jd-1" }),
    ).rejects.toThrow("cv_id and jd_id are required");
    await expect(
      analysisService.createAnalysisInDB("user-1", { cv_id: undefined as any, jd_id: "jd-1" }),
    ).rejects.toThrow("cv_id and jd_id are required");
  });

  it("throws 400 when jd_id is missing", async () => {
    await expect(
      analysisService.createAnalysisInDB("user-1", { cv_id: "cv-1", jd_id: "" }),
    ).rejects.toThrow("cv_id and jd_id are required");
  });

  it("throws 404 when CV is not found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(null);
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJD);

    await expect(
      analysisService.createAnalysisInDB("user-1", { cv_id: "cv-missing", jd_id: "jd-1" }),
    ).rejects.toThrow("CV not found or not owned by you");
  });

  it("throws 404 when JD is not found", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(null);

    await expect(
      analysisService.createAnalysisInDB("user-1", { cv_id: "cv-1", jd_id: "jd-missing" }),
    ).rejects.toThrow("Job description not found or not owned by you");
  });

  it("creates quota for free_user with no existing quota and succeeds", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJD);
    mockPrisma.users.findUnique.mockResolvedValue(mockUser);
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(null);
    groqChatCompletion.mockResolvedValue(mockGroqResponse);
    mockPrisma.usageQuotas.create.mockResolvedValue({
      analyses_used_this_month: 0,
      reset_date: mockResetDate,
      user_id: "user-1",
    });
    mockPrisma.usageQuotas.update.mockResolvedValue({
      analyses_used_this_month: 1,
      reset_date: mockResetDate,
      user_id: "user-1",
    });
    mockPrisma.analyses.create.mockResolvedValue(mockAnalysis);

    const result = await analysisService.createAnalysisInDB("user-1", {
      cv_id: "cv-1",
      jd_id: "jd-1",
    });

    expect(result.ats_score).toBe(85);
    expect(mockPrisma.usageQuotas.create).toHaveBeenCalled();
    expect(mockPrisma.usageQuotas.update).toHaveBeenCalled();
  });

  it("throws 429 when free_user is at the monthly limit", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJD);
    mockPrisma.users.findUnique.mockResolvedValue(mockUser);
    mockPrisma.usageQuotas.findUnique.mockResolvedValue(mockQuotaAtLimit);

    await expect(
      analysisService.createAnalysisInDB("user-1", {
        cv_id: "cv-1",
        jd_id: "jd-1",
      }),
    ).rejects.toThrow("Free tier limit reached");
  });

  it("bypasses quota check for premium user and succeeds", async () => {
    mockPrisma.cVs.findFirst.mockResolvedValue(mockCV);
    mockPrisma.jobDescriptions.findFirst.mockResolvedValue(mockJD);
    mockPrisma.users.findUnique.mockResolvedValue(mockPremiumUser);
    groqChatCompletion.mockResolvedValue(mockGroqResponse);
    mockPrisma.analyses.create.mockResolvedValue(mockAnalysis);

    const result = await analysisService.createAnalysisInDB("user-1", {
      cv_id: "cv-1",
      jd_id: "jd-1",
    });

    expect(result.ats_score).toBe(85);
    expect(mockPrisma.usageQuotas.findUnique).not.toHaveBeenCalled();
  });
});

describe("analysisService.getAllAnalysesFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns a list of analyses", async () => {
    mockPrisma.analyses.findMany.mockResolvedValue([mockAnalysisListItem]);

    const result = await analysisService.getAllAnalysesFromDB("user-1");

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("analysis-1");
    expect(mockPrisma.analyses.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { cv: { user_id: "user-1" } },
        orderBy: { created_at: "desc" },
      }),
    );
  });
});

describe("analysisService.getAnalysisFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns an analysis when found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(mockAnalysis);

    const result = await analysisService.getAnalysisFromDB("user-1", "analysis-1");

    expect(result.id).toBe("analysis-1");
    expect(result.ats_score).toBe(85);
  });

  it("throws 404 when analysis is not found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);

    await expect(
      analysisService.getAnalysisFromDB("user-1", "nonexistent"),
    ).rejects.toThrow("Analysis not found");
  });
});

describe("analysisService.deleteAnalysisFromDB", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("deletes an analysis when found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue({ id: "analysis-1" });
    mockPrisma.analyses.delete.mockResolvedValue({ id: "analysis-1" });

    await analysisService.deleteAnalysisFromDB("user-1", "analysis-1");

    expect(mockPrisma.analyses.delete).toHaveBeenCalledWith({
      where: { id: "analysis-1" },
    });
  });

  it("throws 404 when analysis is not found", async () => {
    mockPrisma.analyses.findFirst.mockResolvedValue(null);

    await expect(
      analysisService.deleteAnalysisFromDB("user-1", "nonexistent"),
    ).rejects.toThrow("Analysis not found");
  });
});
