import { randomUUID } from "node:crypto";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { groqChatCompletion } from "../../config/groq.js";
import { extractJsonObject } from "../../utils/extractJsonObject.js";
import { renderSkillCertificatePdf } from "../../lib/certificate.pdf.js";
import { uploadCertificateBuffer } from "../../config/cloudinary.js";
import { skillTestPrompt } from "./certificate.prompt.js";
import {
  testSetSchema,
  type StoredCertificateQuestion,
  type PublicCertificateQuestion,
  type StartTestResponse,
  type SubmitTestResponse,
  type AttemptAnswerResult,
  type CertificatePublic,
} from "./certificate.interface.js";

const SKILL_TEST_QUESTION_COUNT = 10;
const SKILL_TEST_PASS_SCORE = 60;
const MAX_GENERATION_ATTEMPTS = 3;
const RATE_LIMIT_BACKOFF_MS = 2500;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimited = (error: unknown): boolean =>
  /429|rate ?limit/i.test(error instanceof Error ? error.message : String(error));

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

  if (["a", "b", "c", "d"].includes(raw)) {
    return raw as "a" | "b" | "c" | "d";
  }

  const norm = normalizeText(correctAnswer);

  const exact = (["a", "b", "c", "d"] as const).filter(
    (k) => normalizeText(options[k]) === norm,
  );
  if (exact.length === 1) return exact[0];

  const fuzzy = (["a", "b", "c", "d"] as const).filter((k) => {
    const option = normalizeText(options[k]);
    return (
      option.length >= 6 &&
      (option.includes(norm) || (norm.length >= 6 && norm.includes(option)))
    );
  });
  if (fuzzy.length === 1) return fuzzy[0];

  return null;
};

const toStoredQuestions = (
  questions: {
    question_text: string;
    options: { a: string; b: string; c: string; d: string };
    correct_answer: string;
    difficulty?: "easy" | "medium" | "hard";
  }[],
): StoredCertificateQuestion[] => {
  const stored: StoredCertificateQuestion[] = [];
  for (const q of questions) {
    const correct_answer = resolveCorrectLetter(q.options, q.correct_answer);
    if (!correct_answer) continue;
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

const stripAnswer = (q: StoredCertificateQuestion): PublicCertificateQuestion => ({
  id: q.id,
  question_text: q.question_text,
  options: q.options,
  difficulty: q.difficulty,
});

const toJson = (value: unknown): any => JSON.parse(JSON.stringify(value));

const generateQuestionsForSkill = async (
  skill: string,
): Promise<StoredCertificateQuestion[]> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
    if (attempt > 1) {
      await sleep(
        isRateLimited(lastError) ? RATE_LIMIT_BACKOFF_MS * attempt : 1000,
      );
    }

    let raw: string;
    try {
      raw = await groqChatCompletion(
        [{ role: "user", content: skillTestPrompt(skill) }],
        { temperature: 0.3, maxTokens: 4096 },
      );
    } catch (error: unknown) {
      lastError = error;
      continue;
    }

    const parsed = extractJsonObject(raw);
    const validated = testSetSchema.safeParse(parsed);
    if (!validated.success) {
      lastError = new Error("Malformed JSON for certificate test questions");
      continue;
    }

    const stored = toStoredQuestions(validated.data.questions);
    if (stored.length >= Math.min(SKILL_TEST_QUESTION_COUNT, 8)) {
      return stored;
    }
    lastError = new Error(
      `Too few coherent questions generated (${stored.length})`,
    );
  }

  const message =
    lastError instanceof Error ? lastError.message : "Groq request failed";
  await prisma.systemLogs
    .create({
      data: {
        type: "ai_failure",
        message,
        metadata: { stage: "certificate.generate", provider: "groq" },
      },
    })
    .catch(() => {});
  throw new AppError(
    "AI service was unable to prepare this test. Please try again in a moment.",
    502,
  );
};

const assertSkillInProfile = async (
  userId: string,
  skill: string,
): Promise<void> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { skills: true },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const owned = user.skills.some(
    (s) => s.trim().toLowerCase() === skill.trim().toLowerCase(),
  );
  if (!owned) {
    throw new AppError(
      "This skill is not in your profile. Only profile skills can be certified.",
      403,
    );
  }
};

// ─── Service functions ───────────────────────────────────────

const startTestInDB = async (
  userId: string,
  skill: string,
): Promise<StartTestResponse> => {
  const normalized = skill.trim();
  await assertSkillInProfile(userId, normalized);

  const questions = await generateQuestionsForSkill(normalized);

  const attempt = await prisma.skillTestAttempts.create({
    data: {
      user_id: userId,
      skill: normalized,
      pass_score: SKILL_TEST_PASS_SCORE,
      questions: toJson(questions),
    },
    select: { id: true },
  });

  return {
    attempt_id: attempt.id,
    skill: normalized,
    pass_score: SKILL_TEST_PASS_SCORE,
    questions: questions.map(stripAnswer),
  };
};

const gradeAnswers = (
  questions: StoredCertificateQuestion[],
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

const generateCertNumber = (): string => {
  const hex = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `CFC-${hex}`;
};

const submitTestInDB = async (
  userId: string,
  attemptId: string,
  answers: { question_id: string; selected_answer: string }[],
): Promise<SubmitTestResponse> => {
  const attempt = await prisma.skillTestAttempts.findFirst({
    where: { id: attemptId, user_id: userId },
  });
  if (!attempt) {
    throw new AppError("Attempt not found or not owned by you", 404);
  }
  if (attempt.submitted_at) {
    throw new AppError("This test has already been submitted", 409);
  }

  const questions = attempt.questions as unknown as StoredCertificateQuestion[];
  if (answers.length !== questions.length) {
    throw new AppError(
      `Answer count must match the test size (${questions.length})`,
      400,
    );
  }

  const { perQuestion, correctCount } = gradeAnswers(questions, answers);
  const score = Math.round((correctCount / questions.length) * 100);
  const passed = score >= attempt.pass_score;

  let certificate: CertificatePublic | undefined;

  if (passed) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const certNumber = generateCertNumber();
    const pdfBuffer = await renderSkillCertificatePdf({
      fullName: user?.name ?? "CareerForge User",
      skill: attempt.skill,
      score,
      certificateNumber: certNumber,
    });

    const pdfUrl = await uploadCertificateBuffer(
      pdfBuffer,
      `cert-${attemptId}`,
    );

    const created = await prisma.$transaction(async (tx) => {
      await tx.skillTestAttempts.update({
        where: { id: attempt.id },
        data: {
          score,
          passed,
          answers: toJson(perQuestion),
          submitted_at: new Date(),
        },
      });
      return tx.certificates.create({
        data: {
          user_id: userId,
          skill: attempt.skill,
          score,
          cert_number: certNumber,
          pdf_url: pdfUrl,
          skill_test_attempt_id: attempt.id,
        },
      });
    });

    certificate = {
      id: created.id,
      skill: created.skill,
      score: created.score,
      cert_number: created.cert_number,
      pdf_url: created.pdf_url,
      issued_at: created.issued_at,
    };
  } else {
    await prisma.skillTestAttempts.update({
      where: { id: attempt.id },
      data: {
        score,
        passed,
        answers: toJson(perQuestion),
        submitted_at: new Date(),
      },
    });
  }

  return {
    attempt_id: attempt.id,
    score,
    passed,
    correct_count: correctCount,
    total_questions: questions.length,
    answers: perQuestion,
    ...(certificate ? { certificate } : {}),
  };
};

const listCertificatesFromDB = async (
  userId: string,
): Promise<CertificatePublic[]> => {
  const rows = await prisma.certificates.findMany({
    where: { user_id: userId },
    orderBy: { issued_at: "desc" },
  });
  return rows.map((r) => ({
    id: r.id,
    skill: r.skill,
    score: r.score,
    cert_number: r.cert_number,
    pdf_url: r.pdf_url,
    issued_at: r.issued_at,
  }));
};

const getCertificateFromDB = async (
  userId: string,
  certificateId: string,
): Promise<CertificatePublic> => {
  const cert = await prisma.certificates.findFirst({
    where: { id: certificateId, user_id: userId },
  });
  if (!cert) {
    throw new AppError("Certificate not found or not owned by you", 404);
  }
  return {
    id: cert.id,
    skill: cert.skill,
    score: cert.score,
    cert_number: cert.cert_number,
    pdf_url: cert.pdf_url,
    issued_at: cert.issued_at,
  };
};

const verifyCertificateInDB = async (certNumber: string) => {
  const cert = await prisma.certificates.findUnique({
    where: { cert_number: certNumber },
    select: {
      skill: true,
      score: true,
      issued_at: true,
      user: { select: { name: true } },
    },
  });
  if (!cert) {
    throw new AppError("Certificate not found", 404);
  }
  return {
    valid: true,
    holder_name: cert.user.name,
    skill: cert.skill,
    score: cert.score,
    issued_at: cert.issued_at,
  };
};

export const certificateService = {
  startTestInDB,
  submitTestInDB,
  listCertificatesFromDB,
  getCertificateFromDB,
  verifyCertificateInDB,
};