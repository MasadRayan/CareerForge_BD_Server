import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
  QuizQueryParams,
  SubmitAttemptPayload,
  QuizQuestionResponse,
  PaginatedQuizQuestionsResponse,
  AttemptResult,
  QuizStatsResponse,
} from "./quiz.interface.js";

const VALID_ROLES = [
  "backend",
  "frontend",
  "fullstack",
  "devops",
  "data-science",
] as const;


const stripAnswer = (q: {
  id: string;
  role_category: string;
  question_text: string;
  options: unknown;
  difficulty: string;
}): QuizQuestionResponse => ({
  id: q.id,
  role_category: q.role_category,
  question_text: q.question_text,
  options: q.options as QuizQuestionResponse["options"],
  difficulty: q.difficulty as QuizQuestionResponse["difficulty"],
});


const getQuestionsFromDB = async (
  params: QuizQueryParams,
): Promise<PaginatedQuizQuestionsResponse> => {
  const { role_category, difficulty, page = 1, limit = 10 } = params;

  // Validate role_category if provided
  if (
    role_category &&
    !VALID_ROLES.includes(role_category as (typeof VALID_ROLES)[number])
  ) {
    throw new AppError(
      `Invalid role_category. Must be one of: ${VALID_ROLES.join(", ")}`,
      400,
    );
  }

  // Validate difficulty if provided
  if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
    throw new AppError(
      "Invalid difficulty. Must be one of: easy, medium, hard",
      400,
    );
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
  const skip = (safePage - 1) * safeLimit;
  const where = {
    ...(role_category ? { role_category } : {}),
    ...(difficulty ? { difficulty } : {}),
  };

  const [questions, totalItems] = await Promise.all([
    prisma.quizQuestions.findMany({
      where,
      select: {
        id: true,
        role_category: true,
        question_text: true,
        options: true,
        difficulty: true,
      },
      orderBy: { id: "asc" },
      skip,
      take: safeLimit,
    }),
    prisma.quizQuestions.count({ where }),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);

  // Fisher-Yates shuffle for randomised order within the current page
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    questions: shuffled.map(stripAnswer),
    pagination: {
      currentPage: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    },
  };
};

const submitAttemptToDB = async (
  userId: string,
  payload: SubmitAttemptPayload,
): Promise<AttemptResult> => {
  const { question_id, selected_answer } = payload;

  const question = await prisma.quizQuestions.findUnique({
    where: { id: question_id },
    select: { id: true, correct_answer: true },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  const is_correct = question.correct_answer === selected_answer;

  const attempt = await prisma.quizAttempts.create({
    data: {
      user_id: userId,
      question_id,
      selected_answer,
      is_correct,
    },
    select: {
      id: true,
      question_id: true,
      selected_answer: true,
      is_correct: true,
      attempted_at: true,
    },
  });

  return {
    attempt_id: attempt.id,
    question_id: attempt.question_id,
    selected_answer: attempt.selected_answer,
    correct_answer: question.correct_answer, // revealed only after submission
    is_correct: attempt.is_correct,
    attempted_at: attempt.attempted_at,
  };
};

const getStatsFromDB = async (userId: string): Promise<QuizStatsResponse> => {
  const attempts = await prisma.quizAttempts.findMany({
    where: { user_id: userId },
    select: {
      is_correct: true,
      question: {
        select: { difficulty: true },
      },
    },
  });

  const total_attempted = attempts.length;
  const correct = attempts.filter((a) => a.is_correct).length;
  const incorrect = total_attempted - correct;
  const accuracy_percent =
    total_attempted === 0
      ? 0
      : Math.round((correct / total_attempted) * 100);

  const byDiff = {
    easy: { attempted: 0, correct: 0 },
    medium: { attempted: 0, correct: 0 },
    hard: { attempted: 0, correct: 0 },
  };

  for (const a of attempts) {
    const d = a.question.difficulty as "easy" | "medium" | "hard";
    byDiff[d].attempted += 1;
    if (a.is_correct) byDiff[d].correct += 1;
  }

  return {
    total_attempted,
    correct,
    incorrect,
    accuracy_percent,
    by_difficulty: byDiff,
  };
};

const getAttemptHistoryFromDB = async (userId: string) => {
  const attempts = await prisma.quizAttempts.findMany({
    where: { user_id: userId },
    orderBy: { attempted_at: "desc" },
    select: {
      id: true,
      selected_answer: true,
      is_correct: true,
      attempted_at: true,
      question: {
        select: {
          id: true,
          question_text: true,
          correct_answer: true,
          difficulty: true,
          role_category: true,
        },
      },
    },
  });

  return attempts;
};

export const quizService = {
  getQuestionsFromDB,
  submitAttemptToDB,
  getStatsFromDB,
  getAttemptHistoryFromDB,
};
