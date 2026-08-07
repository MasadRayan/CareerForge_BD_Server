import { z } from "zod";

// ─── Zod schemas ─────────────────────────────────────────────

export const testQuestionSchema = z.object({
  question_text: z.string().min(1),
  options: z.object({
    a: z.string().min(1),
    b: z.string().min(1),
    c: z.string().min(1),
    d: z.string().min(1),
  }),
  correct_answer: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const testSetSchema = z.object({
  questions: z.array(testQuestionSchema).min(1),
});

export type TestQuestionInput = z.infer<typeof testQuestionSchema>;

export const submitWeekTestSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid("question_id must be a valid UUID"),
        selected_answer: z.enum(["a", "b", "c", "d"]),
      }),
    )
    .min(1),
});

export const submitFinalExamSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid("question_id must be a valid UUID"),
        selected_answer: z.enum(["a", "b", "c", "d"]),
      }),
    )
    .min(1),
});

export type SubmitAnswersPayload = z.infer<typeof submitWeekTestSchema>;

// ─── Stored question shape (as persisted in the Json column) ──

export interface StoredTestQuestion {
  id: string;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  correct_answer: "a" | "b" | "c" | "d";
  difficulty?: "easy" | "medium" | "hard";
}

// ─── Response shapes (correct_answer NEVER leaves the server) ─

export interface PublicTestQuestion {
  id: string;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  difficulty?: "easy" | "medium" | "hard";
}

export interface WeekTestResponse {
  test_id: string;
  week_number: number;
  pass_score: number;
  already_passed: boolean;
  questions: PublicTestQuestion[];
}

export interface FinalExamResponse {
  exam_id: string;
  roadmap_id: string;
  pass_score: number;
  already_passed: boolean;
  questions: PublicTestQuestion[];
}

export interface AttemptAnswerResult {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

export interface SubmitResult {
  attempt_id: string;
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  answers: AttemptAnswerResult[];
  next_unlocked_week?: number;
  roadmap_completed?: boolean;
}
