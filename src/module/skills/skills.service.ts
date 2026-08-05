import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { groqChatCompletion } from "../../config/groq.js";
import { extractJsonObject } from "../../utils/json.js";
import { extractSkillsPrompt } from "./skills.prompts.js";

const skillsResponseSchema = z.object({
  skills: z.array(z.string()),
});

const MAX_SKILLS = 50;

const normalizeSkills = (skills: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of skills) {
    const skill = raw.trim();
    if (!skill) continue;
    if (seen.has(skill.toLowerCase())) continue;
    seen.add(skill.toLowerCase());
    result.push(skill);
    if (result.length >= MAX_SKILLS) break;
  }

  return result;
};

const extractSkillsFromCV = async (userId: string, cvId: string) => {
  const cv = await prisma.cVs.findFirst({
    where: { id: cvId, user_id: userId },
    select: { raw_text: true },
  });

  if (!cv) {
    throw new AppError("CV not found", 404);
  }

  let raw: string;
  try {
    raw = await groqChatCompletion(
      [
        {
          role: "user",
          content: extractSkillsPrompt(cv.raw_text),
        },
      ],
      {
        temperature: 0.2,
        maxTokens: 1024,
      },
    );
  } catch (error: any) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: error?.message ?? "Groq request failed",
          metadata: { stage: "skills.extract", provider: "groq" },
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
  const validated = skillsResponseSchema.safeParse(parsed);
  if (!validated.success) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: "Groq returned malformed JSON for skill extraction",
          metadata: {
            stage: "skills.extract",
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

  return { skills: normalizeSkills(validated.data.skills) };
};

export const skillsService = {
  extractSkillsFromCV,
};
