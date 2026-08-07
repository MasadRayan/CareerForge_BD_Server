import { z } from "zod";

// ─── Zod schemas ─────────────────────────────────────────────

export const startTestSchema = z.object({
  skill: z.string().trim().min(1, "skill is required").max(80),
});

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

export const submitTestSchema = z.object({
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid("question_id must be a valid UUID"),
        selected_answer: z.enum(["a", "b", "c", "d"]),
      }),
    )
    .min(1),
});

// ─── Stored question shape (persisted in the Json column) ────

export interface StoredCertificateQuestion {
  id: string;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  correct_answer: "a" | "b" | "c" | "d";
  difficulty?: "easy" | "medium" | "hard";
}

// ─── Response shapes (correct_answer NEVER leaves the server) ─

export interface PublicCertificateQuestion {
  id: string;
  question_text: string;
  options: { a: string; b: string; c: string; d: string };
  difficulty?: "easy" | "medium" | "hard";
}

export interface StartTestResponse {
  attempt_id: string;
  skill: string;
  pass_score: number;
  questions: PublicCertificateQuestion[];
}

export interface AttemptAnswerResult {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

export interface CertificatePublic {
  id: string;
  skill: string;
  score: number;
  cert_number: string;
  pdf_url: string;
  issued_at: Date;
}

export interface SubmitTestResponse {
  attempt_id: string;
  score: number;
  passed: boolean;
  correct_count: number;
  total_questions: number;
  answers: AttemptAnswerResult[];
  certificate?: CertificatePublic;
}