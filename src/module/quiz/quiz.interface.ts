import { z } from "zod";

// ─── Request payload types ────────────────────────────────────

export interface QuizQueryParams {
  role_category?: string;
  difficulty?: "easy" | "medium" | "hard";
  limit?: number;
}

export interface SubmitAttemptPayload {
  question_id: string;
  selected_answer: "a" | "b" | "c" | "d";
}

// ─── Zod validation schemas ───────────────────────────────────

export const submitAttemptSchema = z.object({
  question_id: z.string().uuid("question_id must be a valid UUID"),
  selected_answer: z.enum(["a", "b", "c", "d"]).refine(
    (v) => ["a", "b", "c", "d"].includes(v),
    { message: "selected_answer must be one of: a, b, c, d" },
  ),
});

// ─── Response shape types ─────────────────────────────────────

export interface QuizQuestionResponse {
  id: string;
  role_category: string;
  question_text: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  difficulty: "easy" | "medium" | "hard";
  // NOTE: correct_answer is intentionally OMITTED from response
}

export interface AttemptResult {
  attempt_id: string;
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  attempted_at: Date;
}

export interface QuizStatsResponse {
  total_attempted: number;
  correct: number;
  incorrect: number;
  accuracy_percent: number;
  by_difficulty: {
    easy: { attempted: number; correct: number };
    medium: { attempted: number; correct: number };
    hard: { attempted: number; correct: number };
  };
}
