import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import { groqChatCompletion } from "../../config/groq.js";
import { behavioralFeedbackPrompt } from "./behavioral.prompts.js";
import type { SubmitAnswerPayload, BehavioralFeedback, SubmitAnswerResult } from "./behavioral.interface.js";

const feedbackSchema = z.object({
  structure_score: z.number().int().min(0).max(10),
  star_adherence: z.enum(["excellent", "good", "needs_improvement"]),
  strengths: z.array(z.string()),
  suggestions: z.array(z.string()),
  improved_example: z.string(),
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

const callGroqForFeedback = async (
  question: string,
  answer: string,
): Promise<BehavioralFeedback> => {
  let raw: string;
  try {
    raw = await groqChatCompletion(
      [
        {
          role: "user",
          content: behavioralFeedbackPrompt(question, answer),
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 2048,
      },
    );
  } catch (error: any) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: error?.message ?? "Groq request failed",
          metadata: { stage: "behavioral.submitAnswer", provider: "groq" },
        },
      })
      .catch(() => {});
    throw new AppError(
      "AI service is unavailable. Please try again in a moment.",
      502,
    );
  }

  const parsed = extractJsonObject(raw);
  const validated = feedbackSchema.safeParse(parsed);
  if (!validated.success) {
    await prisma.systemLogs
      .create({
        data: {
          type: "ai_failure",
          message: "Groq returned malformed JSON for behavioral feedback",
          metadata: {
            stage: "behavioral.submitAnswer",
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

const getQuestionsFromDB = async (params: {
  category?: string;
  page?: number;
  limit?: number;
}) => {
  const safePage = Math.max(1, Number(params.page) || 1);
  const safeLimit = Math.min(Math.max(1, Number(params.limit) || 10), 50);
  const skip = (safePage - 1) * safeLimit;

  const where = params.category ? { category: params.category } : {};

  const [questions, totalItems] = await Promise.all([
    prisma.behavioralQuestions.findMany({
      where,
      select: {
        id: true,
        question_text: true,
        category: true,
      },
      orderBy: { id: "asc" },
      skip,
      take: safeLimit,
    }),
    prisma.behavioralQuestions.count({ where }),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / safeLimit);

  return {
    questions,
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

const getQuestionFromDB = async (id: string) => {
  const question = await prisma.behavioralQuestions.findUnique({
    where: { id },
    select: {
      id: true,
      question_text: true,
      category: true,
    },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
};

const submitAnswerToDB = async (
  userId: string,
  questionId: string,
  payload: SubmitAnswerPayload,
): Promise<SubmitAnswerResult> => {
  const question = await prisma.behavioralQuestions.findUnique({
    where: { id: questionId },
    select: { id: true, question_text: true },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  const feedback = await callGroqForFeedback(
    question.question_text,
    payload.answer_text,
  );

  const answer = await prisma.behavioralAnswers.create({
    data: {
      user_id: userId,
      question_id: questionId,
      answer_text: payload.answer_text,
      ai_feedback: feedback as any,
    },
    select: {
      id: true,
      question_id: true,
      answer_text: true,
      ai_feedback: true,
      answered_at: true,
    },
  });

  return answer as unknown as SubmitAnswerResult;
};

const getAnswersFromDB = async (userId: string) => {
  const answers = await prisma.behavioralAnswers.findMany({
    where: { user_id: userId },
    orderBy: { answered_at: "desc" },
    select: {
      id: true,
      question_id: true,
      answer_text: true,
      ai_feedback: true,
      answered_at: true,
      question: {
        select: {
          question_text: true,
          category: true,
        },
      },
    },
  });

  return answers.map((a) => ({
    id: a.id,
    question_id: a.question_id,
    question_text: a.question.question_text,
    category: a.question.category,
    answer_text: a.answer_text,
    ai_feedback: a.ai_feedback as BehavioralFeedback | null,
    answered_at: a.answered_at,
  }));
};

export const behavioralService = {
  getQuestionsFromDB,
  getQuestionFromDB,
  submitAnswerToDB,
  getAnswersFromDB,
};
