import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { groqChatCompletion } from "../../config/groq.js";
import { atsAnalysisPrompt } from "./analysis.prompts.js";
import type {
  CreateAnalysisPayload,
  GeminiAtsResponse,
  AnalysisListItem,
  AnalysisResponse,
} from "./analysis.interface.js";

const FREE_TIER_ANALYSIS_LIMIT = Number(
  process.env.FREE_TIER_ANALYSIS_LIMIT || 5,
);

const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;


const rewriteSuggestionSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  explanation: z.string(),
});

const atsResponseSchema = z.object({
  ats_score: z.number().int().min(0).max(100),
  keyword_match_breakdown: z.object({
    matched_keywords: z.array(z.string()),
    missing_keywords: z.array(z.string()),
    formatting_issues: z.array(z.string()),
    missing_sections: z.array(z.string()),
  }),
  gap_skills: z.array(z.string()),
  rewrite_suggestions: z.array(rewriteSuggestionSchema),
});


const extractJsonObject = (raw: string): unknown => {
  const cleaned = raw.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through
  }

  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch {
      // fall through
    }
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    } catch {
      // fall through
    }
  }

  throw new AppError("AI returned a non-JSON response", 502);
};


const callGroqForAts = async (
  cvText: string,
  jdText: string,
): Promise<GeminiAtsResponse> => {
  let raw: string;
  try {
    raw = await groqChatCompletion(
      [
        {
          role: "user",
          content: atsAnalysisPrompt(cvText, jdText),
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 4096,
      },
    );
  } catch (error: any) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: error?.message ?? "Groq request failed",
          metadata: { stage: "analysis.create", provider: "groq" },
        },
      })
      .catch(() => {
        // Logging must never mask the original error.
      });
    throw new AppError(
      "AI service is unavailable. Please try again in a moment.",
      502,
    );
  }

  const parsed = extractJsonObject(raw);
  const validated = atsResponseSchema.safeParse(parsed);
  if (!validated.success) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: "Groq returned malformed JSON for ATS analysis",
          metadata: {
            stage: "analysis.create",
            provider: "groq",
            issues: JSON.parse(JSON.stringify(validated.error.issues)),
          },
        },
      })
      .catch(() => {});
    throw new AppError(
      "AI returned an unexpected response shape. Please try again.",
      502,
    );
  }

  return validated.data;
};


const loadOrInitQuota = async (userId: string) => {
  const now = new Date();
  const existing = await prisma.usageQuotas.findUnique({
    where: { user_id: userId },
  });

  if (!existing) {
    const reset_date = new Date(now.getTime() + MONTH_IN_MS);
    return prisma.usageQuotas.create({
      data: {
        user_id: userId,
        analyses_used_this_month: 0,
        reset_date,
      },
    });
  }

  if (existing.reset_date <= now) {
    return prisma.usageQuotas.update({
      where: { user_id: userId },
      data: {
        analyses_used_this_month: 0,
        reset_date: new Date(now.getTime() + MONTH_IN_MS),
      },
    });
  }

  return existing;
};


const createAnalysisInDB = async (
  userId: string,
  payload: CreateAnalysisPayload,
): Promise<AnalysisResponse> => {
  const { cv_id, jd_id } = payload;

  if (!cv_id || !jd_id) {
    throw new AppError("cv_id and jd_id are required", 400);
  }


  const [cv, jd] = await Promise.all([
    prisma.cVs.findFirst({ where: { id: cv_id, user_id: userId } }),
    prisma.jobDescriptions.findFirst({ where: { id: jd_id, user_id: userId } }),
  ]);

  if (!cv) {
    throw new AppError("CV not found or not owned by you", 404);
  }
  if (!jd) {
    throw new AppError("Job description not found or not owned by you", 404);
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role === "free_user") {
    const quota = await loadOrInitQuota(userId);
    if (quota.analyses_used_this_month >= FREE_TIER_ANALYSIS_LIMIT) {
      throw new AppError(
        `Free tier limit reached (${FREE_TIER_ANALYSIS_LIMIT} analyses/month). Upgrade to premium for unlimited analyses.`,
        429,
      );
    }
  }

  const aiResult = await callGroqForAts(cv.raw_text, jd.raw_text);

  const analysis = await prisma.analyses.create({
    data: {
      cv_id,
      jd_id,
      ats_score: aiResult.ats_score,
      keyword_match_breakdown: aiResult.keyword_match_breakdown,
      gap_skills: aiResult.gap_skills,
      rewrite_suggestions: aiResult.rewrite_suggestions,
    },
  });

  if (user?.role === "free_user") {
    await prisma.usageQuotas
      .update({
        where: { user_id: userId },
        data: { analyses_used_this_month: { increment: 1 } },
      })
      .catch(() => {
        // Counter failure shouldn't undo the analysis; just log it.
        console.error("⚠️ Failed to increment usage quota for", userId);
      });
  }

  return analysis as unknown as AnalysisResponse;
};


const getAllAnalysesFromDB = async (
  userId: string,
): Promise<AnalysisListItem[]> => {
  const rows = await prisma.analyses.findMany({
    where: { cv: { user_id: userId } },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      cv_id: true,
      jd_id: true,
      ats_score: true,
      created_at: true,
    },
  });
  return rows;
};


const getAnalysisFromDB = async (
  userId: string,
  id: string,
): Promise<AnalysisResponse> => {
  const analysis = await prisma.analyses.findFirst({
    where: { id, cv: { user_id: userId } },
  });
  if (!analysis) {
    throw new AppError("Analysis not found", 404);
  }
  return analysis as unknown as AnalysisResponse;
};

const deleteAnalysisFromDB = async (userId: string, id: string) => {
  const existing = await prisma.analyses.findFirst({
    where: { id, cv: { user_id: userId } },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Analysis not found", 404);
  }
  await prisma.analyses.delete({ where: { id } });
};

export const analysisService = {
  createAnalysisInDB,
  getAllAnalysesFromDB,
  getAnalysisFromDB,
  deleteAnalysisFromDB,
};
