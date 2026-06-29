import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { groqChatCompletion } from "../../config/groq.js";
import { roadmapPrompt, roadmapBatchPrompt } from "./roadmap.prompt.js";
import {
  roadmapResponseSchema,
  type CreateRoadmapPayload,
  type GroqRoadmapResponse,
  type UpdateRoadmapStatusPayload,
} from "./roadmap.interface.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;


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


const BATCH_SIZE = 2;        
const BATCH_DELAY_MS = 3_000; 

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const callGroqForRoadmap = async (
  gapSkills: string[],
  durationWeeks: number,
): Promise<GroqRoadmapResponse> => {
  if (durationWeeks <= 4) {
    return callGroqSingleBatch(gapSkills, 1, durationWeeks, durationWeeks);
  }

  const allWeeks: GroqRoadmapResponse["weeks"] = [];

  for (let start = 1; start <= durationWeeks; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, durationWeeks);

    if (start > 1) {
      await sleep(BATCH_DELAY_MS);
    }

    const batch = await callGroqSingleBatch(gapSkills, start, end, durationWeeks);
    allWeeks.push(...batch.weeks);
  }

  return { weeks: allWeeks };
};

const callGroqSingleBatch = async (
  gapSkills: string[],
  startWeek: number,
  endWeek: number,
  totalWeeks: number,
): Promise<GroqRoadmapResponse> => {
  const prompt =
    startWeek === 1 && endWeek === totalWeeks
      ? roadmapPrompt(gapSkills, totalWeeks)          
      : roadmapBatchPrompt(gapSkills, startWeek, endWeek, totalWeeks); 

  let raw: string;
  try {
    raw = await groqChatCompletion(
      [{ role: "user", content: prompt }],
      { temperature: 0.4, maxTokens: 4096 },
    );
  } catch (error: any) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: error?.message ?? "Groq request failed",
          metadata: { stage: `roadmap.batch.${startWeek}-${endWeek}`, provider: "groq" },
        },
      })
      .catch(() => {});
    throw new AppError(
      "AI service is unavailable. Please try again in a moment.",
      502,
    );
  }

  const parsed = extractJsonObject(raw);
  const validated = roadmapResponseSchema.safeParse(parsed);
  if (!validated.success) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: "Groq returned malformed JSON for roadmap generation",
          metadata: {
            stage: `roadmap.batch.${startWeek}-${endWeek}`,
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


const computeDurationWeeks = (
  interviewDate: Date | null,
  fallback = 4,
): number => {
  if (!interviewDate) return fallback;

  const now = new Date();
  const diffDays = Math.ceil(
    (interviewDate.getTime() - now.getTime()) / DAY_IN_MS,
  );
  if (diffDays <= 0) return fallback; 

  const weeks = Math.ceil(diffDays / 7);
  return Math.min(Math.max(weeks, 1), 12);
};


const weekDateRange = (weekNumber: number): { start: Date; end: Date } => {
  const start = new Date(Date.now() + (weekNumber - 1) * 7 * DAY_IN_MS);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 6 * DAY_IN_MS);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};


const updateStreak = async (userId: string): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.streaks.findUnique({
    where: { user_id: userId },
  });

  const lastActive = existing?.last_active_date
    ? new Date(existing.last_active_date)
    : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  let currentStreak: number;
  if (!existing || !lastActive) {
    currentStreak = 1;
  } else if (lastActive.getTime() === today.getTime()) {
    return; // already counted today
  } else if (today.getTime() - lastActive.getTime() === DAY_IN_MS) {
    currentStreak = existing.current_streak + 1; // consecutive day
  } else {
    currentStreak = 1; // streak broken
  }

  const longestStreak = Math.max(currentStreak, existing?.longest_streak ?? 0);

  await prisma.streaks.upsert({
    where: { user_id: userId },
    update: {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: today,
    },
    create: {
      user_id: userId,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_active_date: today,
    },
  });
};


const createRoadmapInDB = async (
  userId: string,
  payload: CreateRoadmapPayload,
) => {
  const { analysis_id, duration_weeks } = payload;

  if (!analysis_id) {
    throw new AppError("analysis_id is required", 400);
  }


  const analysis = await prisma.analyses.findFirst({
    where: { id: analysis_id, cv: { user_id: userId } },
    include: { jd: { select: { interview_date: true } } },
  });
  if (!analysis) {
    throw new AppError("Analysis not found or not owned by you", 404);
  }

  const durationWeeks =
    duration_weeks ?? computeDurationWeeks(analysis.jd.interview_date);

  const aiResult = await callGroqForRoadmap(
    analysis.gap_skills as string[],
    durationWeeks,
  );

  const roadmap = await prisma.roadmaps.create({
    data: {
      analysis_id,
      user_id: userId,
      duration_weeks: durationWeeks,
      weeks: {
        create: aiResult.weeks.map((week) => {
          const { start, end } = weekDateRange(week.week_number);
          return {
            week_number: week.week_number,
            topic_summary: week.topic_summary,
            start_date: start,
            end_date: end,
            resources: {
              create: week.resources.map((r) => ({
                title: r.title,
                url: r.url,
                type: r.type,
              })),
            },
            dailyTasks: {
              create: week.daily_tasks.map((description) => ({ description })),
            },
          };
        }),
      },
    },
    include: {
      weeks: {
        orderBy: { week_number: "asc" },
        include: { resources: true, dailyTasks: true },
      },
    },
  });

  return roadmap;
};

const getAllRoadmapsFromDB = async (userId: string) => {
  const roadmaps = await prisma.roadmaps.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      analysis_id: true,
      duration_weeks: true,
      status: true,
      created_at: true,
    },
  });
  return roadmaps;
};

const getRoadmapFromDB = async (userId: string, id: string) => {
  const roadmap = await prisma.roadmaps.findFirst({
    where: { id, user_id: userId },
    include: {
      weeks: {
        orderBy: { week_number: "asc" },
        include: { resources: true, dailyTasks: true },
      },
    },
  });
  if (!roadmap) {
    throw new AppError("Roadmap not found", 404);
  }
  return roadmap;
};


const completeTaskInDB = async (
  userId: string,
  roadmapId: string,
  taskId: string,
) => {
  const task = await prisma.dailyTasks.findFirst({
    where: {
      id: taskId,
      roadmapWeek: { roadmap_id: roadmapId, roadmap: { user_id: userId } },
    },
  });
  if (!task) {
    throw new AppError("Task not found or not owned by you", 404);
  }
  if (task.is_completed) {
    throw new AppError("Task is already completed", 409);
  }

  const updated = await prisma.dailyTasks.update({
    where: { id: taskId },
    data: { is_completed: true, completed_at: new Date() },
  });

  await updateStreak(userId);

  return updated;
};

const updateRoadmapStatusInDB = async (
  userId: string,
  id: string,
  payload: UpdateRoadmapStatusPayload,
) => {
  const existing = await prisma.roadmaps.findFirst({
    where: { id, user_id: userId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Roadmap not found", 404);
  }

  const updated = await prisma.roadmaps.update({
    where: { id },
    data: { status: payload.status },
  });
  return updated;
};

const deleteRoadmapFromDB = async (userId: string, id: string) => {
  const existing = await prisma.roadmaps.findFirst({
    where: { id, user_id: userId },
    select: { id: true },
  });
  if (!existing) {
    throw new AppError("Roadmap not found", 404);
  }
  await prisma.roadmaps.delete({ where: { id } });
};

export const roadmapService = {
  createRoadmapInDB,
  getAllRoadmapsFromDB,
  getRoadmapFromDB,
  completeTaskInDB,
  updateRoadmapStatusInDB,
  deleteRoadmapFromDB,
};
