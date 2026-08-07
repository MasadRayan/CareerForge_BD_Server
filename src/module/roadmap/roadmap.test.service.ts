import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { groqChatCompletion } from "../../config/groq.js";
import { extractJsonObject } from "../../utils/extractJsonObject.js";
import { weekTestPrompt, finalExamPrompt } from "./roadmap.test.prompt.js";
import {
  testSetSchema,
  type StoredTestQuestion,
  type PublicTestQuestion,
  type WeekTestResponse,
  type FinalExamResponse,
  type SubmitResult,
  type AttemptAnswerResult,
} from "./roadmap.test.interface.js";

const WEEK_TEST_QUESTION_COUNT = 5;
const FINAL_EXAM_QUESTION_COUNT = 30;
const MAX_CONCURRENT_GENERATIONS = 2;
const MAX_GENERATION_ATTEMPTS = 3;
const MIN_COHERENT_QUESTIONS = 3;
const RATE_LIMIT_BACKOFF_MS = 2500;

// ─── AI question generation ───────────────────────────────────

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The model is asked to return `correct_answer` as the exact option TEXT
 * (more reliable than it typing a letter). Resolve that back to an option
 * letter so grading against what the user sees is always consistent.
 *
 * Handles three cases:
 *  - the value is already a letter (a/b/c/d)  → accept it
 *  - the value exactly matches one option      → use that option's letter
 *  - a fuzzy (one-sided contains) match        → use that option's letter
 * Returns null when no option can be determined (question is dropped, not fatal).
 */
const normalizeText = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[「"«"'’`”]+/g, "")
    .replace(/[\.,;:!?]+$/g, "")
    .replace(/\s+$/g, "");

const resolveCorrectLetter = (
  options: { a: string; b: string; c: string; d: string },
  correctAnswer: string,
): "a" | "b" | "c" | "d" | null => {
  const raw = correctAnswer.trim().toLowerCase();

  // 1) model fell back to a letter → trust it
  if (["a", "b", "c", "d"].includes(raw)) {
    return raw as "a" | "b" | "c" | "d";
  }

  const norm = normalizeText(correctAnswer);

  // 2) exact normalized match
  const exact = (["a", "b", "c", "d"] as const).filter(
    (k) => normalizeText(options[k]) === norm,
  );
  if (exact.length === 1) return exact[0];

  // 3) fuzzy match — the model's answer is a faithful substring/prefix
  //    of exactly one option (requires enough text to be meaningful).
  const fuzzy = (["a", "b", "c", "d"] as const).filter((k) => {
    const option = normalizeText(options[k]);
    return (
      option.length >= 6 &&
      (option.includes(norm) || norm.length >= 6 && norm.includes(option))
    );
  });
  if (fuzzy.length === 1) return fuzzy[0];

  return null;
};

const isRateLimited = (error: unknown): boolean =>
  /429|rate ?limit/i.test(error instanceof Error ? error.message : String(error));

const toStoredQuestions = (
  questions: {
    question_text: string;
    options: { a: string; b: string; c: string; d: string };
    correct_answer: string;
    difficulty?: "easy" | "medium" | "hard";
  }[],
): StoredTestQuestion[] => {
  const stored: StoredTestQuestion[] = [];
  for (const q of questions) {
    const correct_answer = resolveCorrectLetter(q.options, q.correct_answer);
    if (!correct_answer) continue; // drop incoherent questions, keep the rest
    stored.push({
      id: randomUUID(),
      question_text: q.question_text,
      options: q.options,
      correct_answer,
      difficulty: q.difficulty,
    });
  }
  return stored;
};

const callGroqForQuestions = async (
  prompt: string,
  stage: string,
): Promise<StoredTestQuestion[]> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    if (attempt > 1) {
      await sleep(isRateLimited(lastError) ? RATE_LIMIT_BACKOFF_MS * attempt : 1000);
    }

    let raw: string;
    try {
      raw = await groqChatCompletion(
        [{ role: "user", content: prompt }],
        { temperature: 0.3, maxTokens: 4096 },
      );
    } catch (error: unknown) {
      lastError = error;
      continue;
    }

    const parsed = extractJsonObject(raw);
    const validated = testSetSchema.safeParse(parsed);
    if (!validated.success) {
      lastError = new Error("Malformed JSON for test questions");
      continue;
    }

    const stored = toStoredQuestions(validated.data.questions);
    if (stored.length >= MIN_COHERENT_QUESTIONS) {
      return stored;
    }
    lastError = new Error(
      `Too few coherent questions generated (${stored.length}/${validated.data.questions.length})`,
    );
  }

  const message =
    lastError instanceof Error ? lastError.message : "Groq request failed";
  await prisma.systemLogs
    .create({
      data: {
        type: "ai_failure",
        message,
        metadata: { stage, provider: "groq" },
      },
    })
    .catch(() => {});
  throw new AppError(
    "AI service was unable to prepare this test. Please try again in a moment.",
    502,
  );
};

type WeekForTest = {
  id: string;
  week_number: number;
  topic_summary: string;
  resources: { title: string }[];
};

const generateWeekTestQuestions = (
  week: WeekForTest,
  skillGaps: string[],
): Promise<StoredTestQuestion[]> =>
  callGroqForQuestions(
    weekTestPrompt(week.week_number, week.topic_summary, week.resources, skillGaps),
    `weekTest.week${week.week_number}`,
  );

const generateFinalExamQuestions = (
  weeks: { week_number: number; topic_summary: string }[],
  skillGaps: string[],
): Promise<StoredTestQuestion[]> =>
  callGroqForQuestions(finalExamPrompt(weeks, skillGaps), "finalExam");

// ─── Persistence helpers ──────────────────────────────────────

const logGenerationFailure = async (
  weekNumber: number,
  error: unknown,
): Promise<void> => {
  try {
    await prisma.systemLogs.create({
      data: {
        type: "ai_failure",
        message:
          error instanceof Error ? error.message : "Test generation failed",
        metadata: { stage: `weekTest.generate.week${weekNumber}` },
      },
    });
  } catch {
    // logging must never break the caller
  }
};

/** Serialize a value into a Prisma-safe Json input (mirrors repo pattern). */
const toJson = (value: unknown): any => JSON.parse(JSON.stringify(value));

/**
 * Generates + persists tests for every week of a roadmap (and the final
 * exam) at roadmap creation time. Failures are logged, never fatal — a
 * missing test is generated lazily on first GET.
 */
const generateTestsForRoadmap = async (
  roadmapId: string,
  weeks: WeekForTest[],
  skillGaps: string[],
): Promise<void> => {
  const runPool = async <T>(
    items: T[],
    worker: (item: T) => Promise<void>,
  ): Promise<void> => {
    const queue = [...items];
    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_GENERATIONS, queue.length) },
      async () => {
        while (queue.length > 0) {
          const item = queue.shift()!;
          await worker(item);
        }
      },
    );
    await Promise.all(workers);
  };

  await runPool(weeks, async (week) => {
    try {
      const questions = await generateWeekTestQuestions(week, skillGaps);
      await prisma.roadmapWeekTests.upsert({
        where: { roadmap_week_id: week.id },
        update: {},
        create: {
          roadmap_week_id: week.id,
          questions: toJson(questions),
        },
      });
    } catch (error) {
      await logGenerationFailure(week.week_number, error);
    }
  });

  try {
    const questions = await generateFinalExamQuestions(
      weeks.map((w) => ({ week_number: w.week_number, topic_summary: w.topic_summary })),
      skillGaps,
    );
    await prisma.roadmapFinalExams.upsert({
      where: { roadmap_id: roadmapId },
      update: {},
      create: {
        roadmap_id: roadmapId,
        questions: toJson(questions),
      },
    });
  } catch (error) {
    await logGenerationFailure(0, error);
  }
};

// ─── Ownership / state guards ─────────────────────────────────

const findOwnedRoadmap = async (userId: string, roadmapId: string) => {
  const roadmap = await prisma.roadmaps.findFirst({
    where: { id: roadmapId, user_id: userId },
    include: {
      weeks: {
        orderBy: { week_number: "asc" },
        include: { dailyTasks: true, resources: true },
      },
      analysis: { select: { gap_skills: true } },
    },
  });
  if (!roadmap) {
    throw new AppError("Roadmap not found or not owned by you", 404);
  }
  return roadmap;
};

const assertWeekTestAccess = async (
  week: {
    week_number: number;
    is_unlocked: boolean;
    dailyTasks: { is_completed: boolean }[];
  },
): Promise<void> => {
  if (!week.is_unlocked) {
    throw new AppError(
      `Week ${week.week_number} is locked. Pass the previous week's test to unlock it.`,
      403,
    );
  }
  if (
    week.dailyTasks.length === 0 ||
    week.dailyTasks.some((t) => !t.is_completed)
  ) {
    throw new AppError(
      "Complete all daily tasks for this week before taking its test",
      409,
    );
  }
};

// ─── Shared grading ───────────────────────────────────────────

const gradeAnswers = (
  questions: StoredTestQuestion[],
  answers: { question_id: string; selected_answer: string }[],
): { perQuestion: AttemptAnswerResult[]; correctCount: number } => {
  const byId = new Map(questions.map((q) => [q.id, q]));
  let correctCount = 0;

  const perQuestion = answers.map((a) => {
    const q = byId.get(a.question_id);
    if (!q) {
      throw new AppError(
        `Question ${a.question_id} does not belong to this test`,
        400,
      );
    }
    const is_correct = q.correct_answer === a.selected_answer;
    if (is_correct) correctCount += 1;
    return {
      question_id: a.question_id,
      selected_answer: a.selected_answer,
      is_correct,
    };
  });

  return { perQuestion, correctCount };
};

const stripAnswer = (q: StoredTestQuestion): PublicTestQuestion => ({
  id: q.id,
  question_text: q.question_text,
  options: q.options,
  difficulty: q.difficulty,
});

// ─── Weekly test service functions ────────────────────────────

const getWeekTestFromDB = async (
  userId: string,
  roadmapId: string,
  weekId: string,
): Promise<WeekTestResponse> => {
  const roadmap = await findOwnedRoadmap(userId, roadmapId);
  const week = roadmap.weeks.find((w) => w.id === weekId);
  if (!week) {
    throw new AppError("Week not found in this roadmap", 404);
  }
  await assertWeekTestAccess(week);

  let test = await prisma.roadmapWeekTests.findUnique({
    where: { roadmap_week_id: weekId },
  });

  if (!test) {
    const questions = await generateWeekTestQuestions(
      week,
      (roadmap.analysis.gap_skills as string[]) ?? [],
    );
    test = await prisma.roadmapWeekTests.create({
      data: { roadmap_week_id: weekId, questions: toJson(questions) },
    });
  }

  const passedAttempt = await prisma.roadmapWeekTestAttempts.findFirst({
    where: { user_id: userId, roadmap_week_test_id: test.id, passed: true },
    select: { id: true },
  });

  return {
    test_id: test.id,
    week_number: week.week_number,
    pass_score: test.pass_score,
    already_passed: Boolean(passedAttempt),
    questions: (test.questions as unknown as StoredTestQuestion[]).map(stripAnswer),
  };
};

const submitWeekTestToDB = async (
  userId: string,
  roadmapId: string,
  weekId: string,
  answers: { question_id: string; selected_answer: string }[],
): Promise<SubmitResult> => {
  const roadmap = await findOwnedRoadmap(userId, roadmapId);
  const week = roadmap.weeks.find((w) => w.id === weekId);
  if (!week) {
    throw new AppError("Week not found in this roadmap", 404);
  }
  await assertWeekTestAccess(week);

  const test = await prisma.roadmapWeekTests.findUnique({
    where: { roadmap_week_id: weekId },
  });
  if (!test) {
    throw new AppError(
      "Test not ready yet. Please fetch the test first.",
      404,
    );
  }

  const passedAttempt = await prisma.roadmapWeekTestAttempts.findFirst({
    where: { user_id: userId, roadmap_week_test_id: test.id, passed: true },
    select: { id: true },
  });
  if (passedAttempt) {
    throw new AppError("Test already passed", 409);
  }

  const questions = test.questions as unknown as StoredTestQuestion[];
  if (answers.length !== questions.length) {
    throw new AppError(
      `Answer count must match the test size (${questions.length})`,
      400,
    );
  }

  const { perQuestion, correctCount } = gradeAnswers(questions, answers);
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= test.pass_score;

  const nextWeek = roadmap.weeks.find(
    (w) => w.week_number === week.week_number + 1,
  );

  let next_unlocked_week: number | undefined;
  if (passed && nextWeek) {
    next_unlocked_week = nextWeek.week_number;
  }

  const attempt = await prisma.$transaction(async (tx) => {
    const record = await tx.roadmapWeekTestAttempts.create({
      data: {
        user_id: userId,
        roadmap_week_test_id: test.id,
        score,
        passed,
        answers: toJson(perQuestion),
      },
    });

    if (passed && nextWeek) {
      await tx.roadmapWeeks.update({
        where: { id: nextWeek.id },
        data: { is_unlocked: true, unlocked_at: new Date() },
      });
    }

    return record;
  });

  return {
    attempt_id: attempt.id,
    score,
    passed,
    correct_count: correctCount,
    total_questions: questions.length,
    answers: perQuestion,
    ...(next_unlocked_week ? { next_unlocked_week } : {}),
  };
};

// ─── Final exam service functions ─────────────────────────────

const allWeeksPassed = async (userId: string, roadmapId: string): Promise<boolean> => {
  const weeks = await prisma.roadmapWeeks.findMany({
    where: { roadmap_id: roadmapId },
    select: {
      id: true,
      weekTest: {
        select: {
          id: true,
          attempts: {
            where: { user_id: userId, passed: true },
            select: { id: true },
            take: 1,
          },
        },
      },
    },
  });
  if (weeks.length === 0) return false;
  return weeks.every((w) => (w.weekTest?.attempts.length ?? 0) > 0);
};

const getFinalExamFromDB = async (
  userId: string,
  roadmapId: string,
): Promise<FinalExamResponse> => {
  const roadmap = await findOwnedRoadmap(userId, roadmapId);

  if (!(await allWeeksPassed(userId, roadmapId))) {
    throw new AppError(
      "Complete and pass every weekly test before attempting the final exam",
      403,
    );
  }

  let exam = await prisma.roadmapFinalExams.findUnique({
    where: { roadmap_id: roadmapId },
  });

  if (!exam) {
    const questions = await generateFinalExamQuestions(
      roadmap.weeks.map((w) => ({
        week_number: w.week_number,
        topic_summary: w.topic_summary,
      })),
      (roadmap.analysis.gap_skills as string[]) ?? [],
    );
    exam = await prisma.roadmapFinalExams.create({
      data: { roadmap_id: roadmapId, questions: toJson(questions) },
    });
  }

  const passedAttempt = await prisma.roadmapFinalExamAttempts.findFirst({
    where: { user_id: userId, roadmap_final_exam_id: exam.id, passed: true },
    select: { id: true },
  });

  return {
    exam_id: exam.id,
    roadmap_id: roadmapId,
    pass_score: exam.pass_score,
    already_passed: Boolean(passedAttempt),
    questions: (exam.questions as unknown as StoredTestQuestion[]).map(stripAnswer),
  };
};

const submitFinalExamToDB = async (
  userId: string,
  roadmapId: string,
  answers: { question_id: string; selected_answer: string }[],
): Promise<SubmitResult> => {
  const roadmap = await findOwnedRoadmap(userId, roadmapId);

  if (!(await allWeeksPassed(userId, roadmapId))) {
    throw new AppError(
      "Complete and pass every weekly test before attempting the final exam",
      403,
    );
  }

  const exam = await prisma.roadmapFinalExams.findUnique({
    where: { roadmap_id: roadmapId },
  });
  if (!exam) {
    throw new AppError(
      "Final exam not ready yet. Please fetch it first.",
      404,
    );
  }

  const passedAttempt = await prisma.roadmapFinalExamAttempts.findFirst({
    where: { user_id: userId, roadmap_final_exam_id: exam.id, passed: true },
    select: { id: true },
  });
  if (passedAttempt) {
    throw new AppError("Final exam already passed", 409);
  }

  const questions = exam.questions as unknown as StoredTestQuestion[];
  if (answers.length !== questions.length) {
    throw new AppError(
      `Answer count must match the exam size (${questions.length})`,
      400,
    );
  }

  const { perQuestion, correctCount } = gradeAnswers(questions, answers);
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= exam.pass_score;

  const attempt = await prisma.$transaction(async (tx) => {
    const record = await tx.roadmapFinalExamAttempts.create({
      data: {
        user_id: userId,
        roadmap_final_exam_id: exam.id,
        score,
        passed,
        answers: toJson(perQuestion),
      },
    });

    if (passed) {
      await tx.roadmaps.update({
        where: { id: roadmapId },
        data: { status: "completed" },
      });
    }

    return record;
  });

  return {
    attempt_id: attempt.id,
    score,
    passed,
    correct_count: correctCount,
    total_questions: questions.length,
    answers: perQuestion,
    ...(passed ? { roadmap_completed: true } : {}),
  };
};

export const roadmapTestService = {
  generateTestsForRoadmap,
  getWeekTestFromDB,
  submitWeekTestToDB,
  getFinalExamFromDB,
  submitFinalExamToDB,
};

export { WEEK_TEST_QUESTION_COUNT, FINAL_EXAM_QUESTION_COUNT };
