import { z } from "zod";


export interface QuizQueryParams {
  role_category?: string;
  difficulty?: "easy" | "medium" | "hard";
  page?: number;
  limit?: number;
}

export interface SubmitAttemptPayload {
  question_id: string;
  selected_answer: "a" | "b" | "c" | "d";
}


export const submitAttemptSchema = z.object({
  question_id: z.string().uuid("question_id must be a valid UUID"),
  selected_answer: z.enum(["a", "b", "c", "d"]).refine(
    (v) => ["a", "b", "c", "d"].includes(v),
    { message: "selected_answer must be one of: a, b, c, d" },
  ),
});


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
}

export interface QuizPaginationMeta {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedQuizQuestionsResponse {
  questions: QuizQuestionResponse[];
  pagination: QuizPaginationMeta;
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
